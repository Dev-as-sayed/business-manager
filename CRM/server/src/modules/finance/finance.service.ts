import { randomUUID } from 'node:crypto';
import { LedgerEntryStatus, LedgerEntryType, Prisma } from '@prisma/client';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateLedgerEntryInput,
  LedgerExportQuery,
  ListLedgerEntriesQuery,
  PurchaseOrderProfitQuery,
  UpdateLedgerEntryInput,
} from '@/modules/finance/finance.types';

const ledgerEntrySelect = {
  id: true,
  entryNumber: true,
  purchaseOrderId: true,
  shipmentId: true,
  customerId: true,
  supplierId: true,
  type: true,
  status: true,
  amount: true,
  currency: true,
  exchangeRate: true,
  amountInBaseCurrency: true,
  description: true,
  reference: true,
  occurredAt: true,
  createdById: true,
  approvedById: true,
  approvedAt: true,
  voidedAt: true,
  createdAt: true,
  updatedAt: true,
  purchaseOrder: {
    select: { id: true, orderNumber: true, status: true, currency: true, total: true },
  },
  shipment: { select: { id: true, shipmentNumber: true, status: true } },
  customer: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.LedgerEntrySelect;

type LedgerEntryDetail = Prisma.LedgerEntryGetPayload<{
  select: typeof ledgerEntrySelect;
}>;

const findLedgerEntryOrThrow = async (id: string): Promise<LedgerEntryDetail> => {
  const entry = await prisma.ledgerEntry.findUnique({
    where: { id },
    select: ledgerEntrySelect,
  });

  if (!entry) {
    throw ApiError.notFound('Ledger entry not found');
  }

  return entry;
};

const getPurchaseOrderForLedger = async (tx: Prisma.TransactionClient, purchaseOrderId: string) => {
  const purchaseOrder = await tx.purchaseOrder.findFirst({
    where: { id: purchaseOrderId, deletedAt: null },
    select: {
      id: true,
      orderNumber: true,
      customerId: true,
      supplierId: true,
      status: true,
      currency: true,
    },
  });

  if (!purchaseOrder) {
    throw ApiError.notFound('Purchase order not found');
  }

  return purchaseOrder;
};

const getShipmentForLedger = async (tx: Prisma.TransactionClient, shipmentId: string) => {
  const shipment = await tx.shipment.findFirst({
    where: { id: shipmentId, deletedAt: null },
    select: {
      id: true,
      shipmentNumber: true,
      customerId: true,
      status: true,
      items: {
        select: {
          purchaseOrderItem: {
            select: {
              purchaseOrderId: true,
              purchaseOrder: {
                select: { supplierId: true, currency: true },
              },
            },
          },
        },
      },
    },
  });

  if (!shipment) {
    throw ApiError.notFound('Shipment not found');
  }

  return shipment;
};

const ensureSupplier = async (tx: Prisma.TransactionClient, supplierId: string) => {
  const supplier = await tx.supplier.findFirst({
    where: { id: supplierId, deletedAt: null },
    select: { id: true },
  });

  if (!supplier) {
    throw ApiError.badRequest('Supplier not found');
  }

  return supplier;
};

const resolveCreateContext = async (
  tx: Prisma.TransactionClient,
  input: CreateLedgerEntryInput,
) => {
  const purchaseOrder = input.purchaseOrderId
    ? await getPurchaseOrderForLedger(tx, input.purchaseOrderId)
    : null;
  const shipment = input.shipmentId ? await getShipmentForLedger(tx, input.shipmentId) : null;

  if (purchaseOrder && shipment) {
    if (purchaseOrder.customerId !== shipment.customerId) {
      throw ApiError.badRequest('Purchase order and shipment must belong to the same customer');
    }

    const includesOrder = shipment.items.some(
      (item) => item.purchaseOrderItem.purchaseOrderId === purchaseOrder.id,
    );

    if (!includesOrder) {
      throw ApiError.badRequest('Shipment does not include the purchase order');
    }
  }

  const customerId = purchaseOrder?.customerId ?? shipment?.customerId;

  if (!customerId) {
    throw ApiError.badRequest('purchaseOrderId or shipmentId is required');
  }

  let supplierId = input.supplierId ?? purchaseOrder?.supplierId ?? null;
  let shipmentCurrency: string | undefined;

  if (input.supplierId) {
    await ensureSupplier(tx, input.supplierId);
  } else if (!supplierId && shipment) {
    const supplierIds = new Set(
      shipment.items.map((item) => item.purchaseOrderItem.purchaseOrder.supplierId),
    );

    if (supplierIds.size === 1) {
      supplierId = [...supplierIds][0] ?? null;
    }
  }

  if (!purchaseOrder && shipment) {
    const currencies = new Set(
      shipment.items.map((item) => item.purchaseOrderItem.purchaseOrder.currency),
    );

    if (currencies.size === 1) {
      shipmentCurrency = [...currencies][0];
    }
  }

  const currency = input.currency ?? purchaseOrder?.currency ?? shipmentCurrency ?? 'USD';

  return { customerId, supplierId, currency };
};

const computeAmountInBaseCurrency = (amount: number, exchangeRate: number) =>
  new Prisma.Decimal(amount).mul(new Prisma.Decimal(exchangeRate)).toDecimalPlaces(2);

const generateEntryNumber = () => `LE-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const createLedgerEntry = async (
  input: CreateLedgerEntryInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<LedgerEntryDetail> => {
  const entry = await prisma.$transaction(async (tx) => {
    const context = await resolveCreateContext(tx, input);
    const exchangeRate = input.exchangeRate ?? 1;

    return tx.ledgerEntry.create({
      data: {
        entryNumber: generateEntryNumber(),
        purchaseOrderId: input.purchaseOrderId ?? null,
        shipmentId: input.shipmentId ?? null,
        customerId: context.customerId,
        supplierId: context.supplierId,
        type: input.type,
        amount: new Prisma.Decimal(input.amount),
        currency: context.currency,
        exchangeRate: new Prisma.Decimal(exchangeRate),
        amountInBaseCurrency: computeAmountInBaseCurrency(input.amount, exchangeRate),
        description: input.description ?? null,
        reference: input.reference ?? null,
        occurredAt: input.occurredAt ?? new Date(),
        createdById: actor.id,
      },
      select: ledgerEntrySelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'finance.create',
    resource: 'finance',
    resourceId: entry.id,
    metadata: {
      entryNumber: entry.entryNumber,
      type: entry.type,
      purchaseOrderId: entry.purchaseOrderId,
      shipmentId: entry.shipmentId,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return entry;
};

const buildLedgerWhere = (
  query: ListLedgerEntriesQuery | LedgerExportQuery,
): Prisma.LedgerEntryWhereInput => {
  const conditions: Prisma.LedgerEntryWhereInput[] = [];

  if (query.type) {
    conditions.push({ type: query.type });
  }

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.purchaseOrderId) {
    conditions.push({ purchaseOrderId: query.purchaseOrderId });
  }

  if (query.shipmentId) {
    conditions.push({ shipmentId: query.shipmentId });
  }

  if (query.customerId) {
    conditions.push({ customerId: query.customerId });
  }

  if (query.supplierId) {
    conditions.push({ supplierId: query.supplierId });
  }

  if (query.currency) {
    conditions.push({ currency: query.currency });
  }

  if (query.dateFrom || query.dateTo) {
    conditions.push({
      occurredAt: {
        ...(query.dateFrom ? { gte: query.dateFrom } : {}),
        ...(query.dateTo ? { lte: query.dateTo } : {}),
      },
    });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { entryNumber: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
        {
          purchaseOrder: {
            orderNumber: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          shipment: {
            shipmentNumber: { contains: query.search, mode: 'insensitive' },
          },
        },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
      ],
    });
  }

  return { AND: conditions };
};

const ledgerOrderBy = (
  query: ListLedgerEntriesQuery | LedgerExportQuery,
): Prisma.LedgerEntryOrderByWithRelationInput =>
  ({
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  }) as Prisma.LedgerEntryOrderByWithRelationInput;

export const listLedgerEntries = async (query: ListLedgerEntriesQuery) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const where = buildLedgerWhere(query);

  const [items, total] = await prisma.$transaction([
    prisma.ledgerEntry.findMany({
      where,
      orderBy: ledgerOrderBy(query),
      skip,
      take,
      select: ledgerEntrySelect,
    }),
    prisma.ledgerEntry.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getLedgerEntry = async (id: string): Promise<LedgerEntryDetail> =>
  findLedgerEntryOrThrow(id);

export const updateLedgerEntry = async (
  id: string,
  input: UpdateLedgerEntryInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<LedgerEntryDetail> => {
  const existing = await findLedgerEntryOrThrow(id);

  if (existing.status !== LedgerEntryStatus.PENDING) {
    throw ApiError.badRequest('Only pending ledger entries can be updated');
  }

  const entry = await prisma.$transaction(async (tx) => {
    if (input.supplierId) {
      await ensureSupplier(tx, input.supplierId);
    }

    const amount = input.amount ?? Number(existing.amount);
    const exchangeRate = input.exchangeRate ?? Number(existing.exchangeRate);

    return tx.ledgerEntry.update({
      where: { id },
      data: {
        ...(input.supplierId === null
          ? { supplier: { disconnect: true } }
          : typeof input.supplierId === 'string'
            ? { supplier: { connect: { id: input.supplierId } } }
            : {}),
        ...(input.amount !== undefined ? { amount: new Prisma.Decimal(input.amount) } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.exchangeRate !== undefined
          ? { exchangeRate: new Prisma.Decimal(input.exchangeRate) }
          : {}),
        amountInBaseCurrency: computeAmountInBaseCurrency(amount, exchangeRate),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.reference !== undefined ? { reference: input.reference } : {}),
        ...(input.occurredAt !== undefined ? { occurredAt: input.occurredAt } : {}),
      },
      select: ledgerEntrySelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'finance.update',
    resource: 'finance',
    resourceId: entry.id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return entry;
};

export const approveLedgerEntry = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<LedgerEntryDetail> => {
  const existing = await findLedgerEntryOrThrow(id);

  if (existing.status === LedgerEntryStatus.APPROVED) {
    return existing;
  }

  if (existing.status !== LedgerEntryStatus.PENDING) {
    throw ApiError.badRequest('Only pending ledger entries can be approved');
  }

  const entry = await prisma.ledgerEntry.update({
    where: { id },
    data: {
      status: LedgerEntryStatus.APPROVED,
      approvedById: actor.id,
      approvedAt: new Date(),
    },
    select: ledgerEntrySelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'finance.approve',
    resource: 'finance',
    resourceId: entry.id,
    metadata: { entryNumber: entry.entryNumber, type: entry.type },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return entry;
};

export const voidLedgerEntry = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<LedgerEntryDetail> => {
  const existing = await findLedgerEntryOrThrow(id);

  if (existing.status === LedgerEntryStatus.VOID) {
    return existing;
  }

  const entry = await prisma.ledgerEntry.update({
    where: { id },
    data: {
      status: LedgerEntryStatus.VOID,
      voidedAt: new Date(),
    },
    select: ledgerEntrySelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'finance.void',
    resource: 'finance',
    resourceId: entry.id,
    metadata: { entryNumber: entry.entryNumber, type: entry.type },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return entry;
};

const csvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = value instanceof Date ? value.toISOString() : String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
};

const buildLedgerCsv = (entries: LedgerEntryDetail[]): string => {
  const header = [
    'entryNumber',
    'purchaseOrderId',
    'shipmentId',
    'customerId',
    'supplierId',
    'type',
    'status',
    'amount',
    'currency',
    'exchangeRate',
    'amountInBaseCurrency',
    'occurredAt',
    'description',
    'reference',
  ].join(',');

  const rows = entries.map((entry) =>
    [
      entry.entryNumber,
      entry.purchaseOrderId,
      entry.shipmentId,
      entry.customerId,
      entry.supplierId,
      entry.type,
      entry.status,
      entry.amount,
      entry.currency,
      entry.exchangeRate,
      entry.amountInBaseCurrency,
      entry.occurredAt,
      entry.description,
      entry.reference,
    ]
      .map(csvValue)
      .join(','),
  );

  return [header, ...rows].join('\n');
};

export const exportLedgerEntries = async (
  query: LedgerExportQuery,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<{ csv: string; count: number }> => {
  const entries = await prisma.ledgerEntry.findMany({
    where: buildLedgerWhere(query),
    orderBy: ledgerOrderBy(query),
    take: 10_000,
    select: ledgerEntrySelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'finance.export',
    resource: 'finance',
    metadata: { count: entries.length },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return { csv: buildLedgerCsv(entries), count: entries.length };
};

export const getPurchaseOrderProfit = async (query: PurchaseOrderProfitQuery) => {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { id: query.purchaseOrderId, deletedAt: null },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      currency: true,
      total: true,
    },
  });

  if (!purchaseOrder) {
    throw ApiError.notFound('Purchase order not found');
  }

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      status: LedgerEntryStatus.APPROVED,
      OR: [
        { purchaseOrderId: purchaseOrder.id },
        {
          shipment: {
            items: {
              some: {
                purchaseOrderItem: { purchaseOrderId: purchaseOrder.id },
              },
            },
          },
        },
      ],
    },
    select: { type: true, amountInBaseCurrency: true },
  });

  let revenue = new Prisma.Decimal(0);
  let costs = new Prisma.Decimal(0);
  let refunds = new Prisma.Decimal(0);
  let adjustments = new Prisma.Decimal(0);
  let payments = new Prisma.Decimal(0);

  for (const entry of entries) {
    switch (entry.type) {
      case LedgerEntryType.REVENUE:
        revenue = revenue.add(entry.amountInBaseCurrency);
        break;
      case LedgerEntryType.COST:
        costs = costs.add(entry.amountInBaseCurrency);
        break;
      case LedgerEntryType.REFUND:
        refunds = refunds.add(entry.amountInBaseCurrency);
        break;
      case LedgerEntryType.ADJUSTMENT:
        adjustments = adjustments.add(entry.amountInBaseCurrency);
        break;
      case LedgerEntryType.PAYMENT:
        payments = payments.add(entry.amountInBaseCurrency);
        break;
    }
  }

  const profit = revenue.sub(costs).sub(refunds).add(adjustments).toDecimalPlaces(2);

  return {
    purchaseOrderId: purchaseOrder.id,
    orderNumber: purchaseOrder.orderNumber,
    orderStatus: purchaseOrder.status,
    orderCurrency: purchaseOrder.currency,
    orderTotal: purchaseOrder.total,
    baseCurrency: env.BASE_CURRENCY,
    revenue: revenue.toDecimalPlaces(2),
    costs: costs.toDecimalPlaces(2),
    refunds: refunds.toDecimalPlaces(2),
    adjustments: adjustments.toDecimalPlaces(2),
    payments: payments.toDecimalPlaces(2),
    profit,
    entryCount: entries.length,
  };
};
