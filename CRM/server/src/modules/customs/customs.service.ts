import { randomUUID } from 'node:crypto';
import { CustomsStatus, Prisma, ShipmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateCustomsRecordInput,
  ListCustomsRecordsQuery,
  UpdateCustomsRecordInput,
  UpdateCustomsStatusInput,
} from '@/modules/customs/customs.types';

const customsRecordSelect = {
  id: true,
  recordNumber: true,
  shipmentId: true,
  customerId: true,
  supplierId: true,
  status: true,
  declarationNumber: true,
  customsOffice: true,
  country: true,
  dutyAmount: true,
  taxAmount: true,
  otherFees: true,
  totalAmount: true,
  currency: true,
  exchangeRate: true,
  clearanceDate: true,
  notes: true,
  createdById: true,
  updatedById: true,
  reviewedAt: true,
  clearedAt: true,
  heldAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  shipment: {
    select: { id: true, shipmentNumber: true, status: true, customerId: true },
  },
  customer: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  updatedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.CustomsRecordSelect;

type CustomsRecordDetail = Prisma.CustomsRecordGetPayload<{
  select: typeof customsRecordSelect;
}>;

const customsStatusTransitions: Record<CustomsStatus, CustomsStatus[]> = {
  [CustomsStatus.PENDING]: [CustomsStatus.IN_REVIEW, CustomsStatus.CANCELLED],
  [CustomsStatus.IN_REVIEW]: [CustomsStatus.CLEARED, CustomsStatus.HELD, CustomsStatus.CANCELLED],
  [CustomsStatus.HELD]: [CustomsStatus.IN_REVIEW, CustomsStatus.CANCELLED],
  [CustomsStatus.CLEARED]: [],
  [CustomsStatus.CANCELLED]: [],
};

const findCustomsRecordOrThrow = async (id: string): Promise<CustomsRecordDetail> => {
  const customsRecord = await prisma.customsRecord.findFirst({
    where: { id, deletedAt: null },
    select: customsRecordSelect,
  });

  if (!customsRecord) {
    throw ApiError.notFound('Customs record not found');
  }

  return customsRecord;
};

const getShipmentForCustoms = async (tx: Prisma.TransactionClient, shipmentId: string) => {
  const shipment = await tx.shipment.findFirst({
    where: { id: shipmentId, deletedAt: null },
    select: {
      id: true,
      shipmentNumber: true,
      customerId: true,
      status: true,
    },
  });

  if (!shipment) {
    throw ApiError.notFound('Shipment not found');
  }

  if (shipment.status === ShipmentStatus.CANCELLED) {
    throw ApiError.badRequest('Cancelled shipments cannot have customs records');
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

const ensureUniqueCustomsRecord = async (
  tx: Prisma.TransactionClient,
  shipmentId: string,
  excludeId?: string,
) => {
  const existing = await tx.customsRecord.findFirst({
    where: {
      shipmentId,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw ApiError.conflict('A customs record already exists for this shipment');
  }
};

const calculateTotal = (dutyAmount: number, taxAmount: number, otherFees: number) =>
  new Prisma.Decimal(dutyAmount)
    .add(new Prisma.Decimal(taxAmount))
    .add(new Prisma.Decimal(otherFees))
    .toDecimalPlaces(2);

const generateRecordNumber = () => `CU-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const createCustomsRecord = async (
  input: CreateCustomsRecordInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<CustomsRecordDetail> => {
  const customsRecord = await prisma.$transaction(async (tx) => {
    const shipment = await getShipmentForCustoms(tx, input.shipmentId);
    await ensureUniqueCustomsRecord(tx, shipment.id);

    if (input.supplierId) {
      await ensureSupplier(tx, input.supplierId);
    }

    const dutyAmount = input.dutyAmount ?? 0;
    const taxAmount = input.taxAmount ?? 0;
    const otherFees = input.otherFees ?? 0;

    return tx.customsRecord.create({
      data: {
        recordNumber: generateRecordNumber(),
        shipmentId: shipment.id,
        customerId: shipment.customerId,
        supplierId: input.supplierId ?? null,
        declarationNumber: input.declarationNumber ?? null,
        customsOffice: input.customsOffice ?? null,
        country: input.country ?? null,
        dutyAmount: new Prisma.Decimal(dutyAmount),
        taxAmount: new Prisma.Decimal(taxAmount),
        otherFees: new Prisma.Decimal(otherFees),
        totalAmount: calculateTotal(dutyAmount, taxAmount, otherFees),
        currency: input.currency ?? 'USD',
        exchangeRate: new Prisma.Decimal(input.exchangeRate ?? 1),
        clearanceDate: input.clearanceDate ?? null,
        notes: input.notes ?? null,
        createdById: actor.id,
      },
      select: customsRecordSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'customs.create',
    resource: 'customs',
    resourceId: customsRecord.id,
    metadata: {
      recordNumber: customsRecord.recordNumber,
      shipmentId: customsRecord.shipmentId,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return customsRecord;
};

export const listCustomsRecords = async (query: ListCustomsRecordsQuery) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const conditions: Prisma.CustomsRecordWhereInput[] = [{ deletedAt: null }];

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.customerId) {
    conditions.push({ customerId: query.customerId });
  }

  if (query.supplierId) {
    conditions.push({ supplierId: query.supplierId });
  }

  if (query.shipmentId) {
    conditions.push({ shipmentId: query.shipmentId });
  }

  if (query.country) {
    conditions.push({ country: { contains: query.country, mode: 'insensitive' } });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { recordNumber: { contains: query.search, mode: 'insensitive' } },
        { declarationNumber: { contains: query.search, mode: 'insensitive' } },
        { customsOffice: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
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

  const where: Prisma.CustomsRecordWhereInput = { AND: conditions };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.CustomsRecordOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.customsRecord.findMany({
      where,
      orderBy,
      skip,
      take,
      select: customsRecordSelect,
    }),
    prisma.customsRecord.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getCustomsRecord = async (id: string): Promise<CustomsRecordDetail> =>
  findCustomsRecordOrThrow(id);

export const updateCustomsRecord = async (
  id: string,
  input: UpdateCustomsRecordInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<CustomsRecordDetail> => {
  const existing = await findCustomsRecordOrThrow(id);

  if (existing.status === CustomsStatus.CLEARED || existing.status === CustomsStatus.CANCELLED) {
    throw ApiError.badRequest('Cleared or cancelled customs records cannot be updated');
  }

  const customsRecord = await prisma.$transaction(async (tx) => {
    if (input.supplierId) {
      await ensureSupplier(tx, input.supplierId);
    }

    const dutyAmount = input.dutyAmount ?? Number(existing.dutyAmount);
    const taxAmount = input.taxAmount ?? Number(existing.taxAmount);
    const otherFees = input.otherFees ?? Number(existing.otherFees);

    return tx.customsRecord.update({
      where: { id },
      data: {
        ...(input.supplierId !== undefined ? { supplierId: input.supplierId } : {}),
        ...(input.declarationNumber !== undefined
          ? { declarationNumber: input.declarationNumber }
          : {}),
        ...(input.customsOffice !== undefined ? { customsOffice: input.customsOffice } : {}),
        ...(input.country !== undefined ? { country: input.country } : {}),
        ...(input.dutyAmount !== undefined
          ? { dutyAmount: new Prisma.Decimal(input.dutyAmount) }
          : {}),
        ...(input.taxAmount !== undefined
          ? { taxAmount: new Prisma.Decimal(input.taxAmount) }
          : {}),
        ...(input.otherFees !== undefined
          ? { otherFees: new Prisma.Decimal(input.otherFees) }
          : {}),
        totalAmount: calculateTotal(dutyAmount, taxAmount, otherFees),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.exchangeRate !== undefined
          ? { exchangeRate: new Prisma.Decimal(input.exchangeRate) }
          : {}),
        ...(input.clearanceDate !== undefined ? { clearanceDate: input.clearanceDate } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        updatedById: actor.id,
      },
      select: customsRecordSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'customs.update',
    resource: 'customs',
    resourceId: customsRecord.id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return customsRecord;
};

export const updateCustomsStatus = async (
  id: string,
  input: UpdateCustomsStatusInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<CustomsRecordDetail> => {
  const existing = await findCustomsRecordOrThrow(id);

  if (existing.status === input.status) {
    return existing;
  }

  if (!customsStatusTransitions[existing.status].includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change customs status from ${existing.status} to ${input.status}`,
    );
  }

  const now = new Date();

  const customsRecord = await prisma.customsRecord.update({
    where: { id },
    data: {
      status: input.status,
      updatedById: actor.id,
      ...(input.status === CustomsStatus.IN_REVIEW ? { reviewedAt: now, heldAt: null } : {}),
      ...(input.status === CustomsStatus.CLEARED ? { clearedAt: now } : {}),
      ...(input.status === CustomsStatus.HELD ? { heldAt: now } : {}),
      ...(input.status === CustomsStatus.CANCELLED ? { cancelledAt: now } : {}),
    },
    select: customsRecordSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'customs.status.update',
    resource: 'customs',
    resourceId: customsRecord.id,
    metadata: { from: existing.status, to: input.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return customsRecord;
};

export const deleteCustomsRecord = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<void> => {
  const existing = await findCustomsRecordOrThrow(id);

  await prisma.customsRecord.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: actor.id },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'customs.delete',
    resource: 'customs',
    resourceId: id,
    metadata: { recordNumber: existing.recordNumber },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
