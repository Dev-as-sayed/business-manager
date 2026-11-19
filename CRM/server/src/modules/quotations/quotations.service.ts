import { randomUUID } from 'node:crypto';
import { Prisma, ProductRequestStatus, QuotationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildDataScope, customerScope } from '@/shared/utils/dataScope';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateQuotationInput,
  ListQuotationsQuery,
  UpdateQuotationInput,
  UpdateQuotationStatusInput,
} from '@/modules/quotations/quotations.types';

const quotationListSelect = {
  id: true,
  quotationNumber: true,
  productRequestId: true,
  customerId: true,
  status: true,
  currency: true,
  serviceFeeRate: true,
  subtotal: true,
  serviceFee: true,
  shippingFee: true,
  tax: true,
  total: true,
  validUntil: true,
  notes: true,
  createdById: true,
  approvedById: true,
  approvedAt: true,
  sentAt: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, name: true } },
  productRequest: { select: { id: true, requestNumber: true, title: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { items: true } },
} satisfies Prisma.QuotationSelect;

const quotationDetailSelect = {
  ...quotationListSelect,
  items: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      quantity: true,
      unitPrice: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.QuotationSelect;

type QuotationDetail = Prisma.QuotationGetPayload<{
  select: typeof quotationDetailSelect;
}>;

const quotationStatusTransitions: Record<QuotationStatus, QuotationStatus[]> = {
  [QuotationStatus.DRAFT]: [QuotationStatus.SENT],
  [QuotationStatus.SENT]: [
    QuotationStatus.APPROVED,
    QuotationStatus.REJECTED,
    QuotationStatus.EXPIRED,
  ],
  [QuotationStatus.APPROVED]: [],
  [QuotationStatus.REJECTED]: [],
  [QuotationStatus.EXPIRED]: [],
};

const quotationScope = (actor: AuthUser): Prisma.QuotationWhereInput =>
  buildDataScope(actor, [customerScope('customerId')]) as Prisma.QuotationWhereInput;

const findQuotationOrThrow = async (id: string, actor: AuthUser): Promise<QuotationDetail> => {
  const quotation = await prisma.quotation.findFirst({
    where: {
      AND: [{ id, deletedAt: null }, quotationScope(actor)],
    },
    select: quotationDetailSelect,
  });

  if (!quotation) {
    throw ApiError.notFound('Quotation not found');
  }

  return quotation;
};

const getProductRequestForQuotation = async (
  tx: Prisma.TransactionClient,
  productRequestId: string,
) => {
  const productRequest = await tx.productRequest.findFirst({
    where: { id: productRequestId, deletedAt: null },
    select: {
      id: true,
      customerId: true,
      status: true,
      customer: { select: { id: true, status: true } },
    },
  });

  if (!productRequest) {
    throw ApiError.notFound('Product request not found');
  }

  return productRequest;
};

const calculateTotals = (
  items: Array<{ quantity: number; unitPrice: number }>,
  serviceFeeRate: number,
  shippingFee: number,
  tax: number,
) => {
  const subtotal = items
    .reduce(
      (sum, item) => sum.add(new Prisma.Decimal(item.unitPrice).mul(item.quantity)),
      new Prisma.Decimal(0),
    )
    .toDecimalPlaces(2);

  const serviceFee = subtotal.mul(new Prisma.Decimal(serviceFeeRate)).toDecimalPlaces(2);

  const total = subtotal
    .add(serviceFee)
    .add(new Prisma.Decimal(shippingFee))
    .add(new Prisma.Decimal(tax))
    .toDecimalPlaces(2);

  return { subtotal, serviceFee, total };
};

const generateQuotationNumber = () => `QT-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const createQuotation = async (
  input: CreateQuotationInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<QuotationDetail> => {
  const serviceFeeRate = input.serviceFeeRate ?? 0;
  const shippingFee = input.shippingFee ?? 0;
  const tax = input.tax ?? 0;
  const totals = calculateTotals(input.items, serviceFeeRate, shippingFee, tax);

  const quotation = await prisma.$transaction(async (tx) => {
    const productRequest = await getProductRequestForQuotation(tx, input.productRequestId);

    if (productRequest.customer.status !== 'ACTIVE') {
      throw ApiError.badRequest('Customer is not active');
    }

    if (
      productRequest.status !== ProductRequestStatus.REVIEWING &&
      productRequest.status !== ProductRequestStatus.QUOTED
    ) {
      throw ApiError.badRequest(
        'Product request must be in review or quoted before creating a quotation',
      );
    }

    if (productRequest.status === ProductRequestStatus.REVIEWING) {
      await tx.productRequest.update({
        where: { id: productRequest.id },
        data: { status: ProductRequestStatus.QUOTED },
      });
    }

    return tx.quotation.create({
      data: {
        quotationNumber: generateQuotationNumber(),
        productRequestId: productRequest.id,
        customerId: productRequest.customerId,
        currency: input.currency ?? 'USD',
        serviceFeeRate: new Prisma.Decimal(serviceFeeRate),
        shippingFee: new Prisma.Decimal(shippingFee),
        tax: new Prisma.Decimal(tax),
        subtotal: totals.subtotal,
        serviceFee: totals.serviceFee,
        total: totals.total,
        validUntil: input.validUntil ?? null,
        notes: input.notes ?? null,
        createdById: actor.id,
        items: {
          create: input.items.map((item) => ({
            name: item.name,
            description: item.description ?? null,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            notes: item.notes ?? null,
          })),
        },
      },
      select: quotationDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'quotations.create',
    resource: 'quotations',
    resourceId: quotation.id,
    metadata: {
      quotationNumber: quotation.quotationNumber,
      productRequestId: quotation.productRequestId,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return quotation;
};

export const listQuotations = async (query: ListQuotationsQuery, actor: AuthUser) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const conditions: Prisma.QuotationWhereInput[] = [{ deletedAt: null }, quotationScope(actor)];

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.customerId) {
    conditions.push({ customerId: query.customerId });
  }

  if (query.productRequestId) {
    conditions.push({ productRequestId: query.productRequestId });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { quotationNumber: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { productRequest: { title: { contains: query.search, mode: 'insensitive' } } },
        {
          productRequest: {
            requestNumber: { contains: query.search, mode: 'insensitive' },
          },
        },
      ],
    });
  }

  const where: Prisma.QuotationWhereInput = { AND: conditions };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.QuotationOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.quotation.findMany({
      where,
      orderBy,
      skip,
      take,
      select: quotationListSelect,
    }),
    prisma.quotation.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getQuotation = async (id: string, actor: AuthUser): Promise<QuotationDetail> =>
  findQuotationOrThrow(id, actor);

export const updateQuotation = async (
  id: string,
  input: UpdateQuotationInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<QuotationDetail> => {
  const existing = await findQuotationOrThrow(id, actor);

  if (existing.status !== QuotationStatus.DRAFT) {
    throw ApiError.badRequest('Only draft quotations can be updated');
  }

  const items =
    input.items ??
    existing.items.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      notes: item.notes,
    }));

  const serviceFeeRate = input.serviceFeeRate ?? Number(existing.serviceFeeRate);
  const shippingFee = input.shippingFee ?? Number(existing.shippingFee);
  const tax = input.tax ?? Number(existing.tax);
  const totals = calculateTotals(items, serviceFeeRate, shippingFee, tax);

  const quotation = await prisma.$transaction(async (tx) => {
    if (input.items !== undefined) {
      await tx.quotationItem.deleteMany({ where: { quotationId: id } });

      await tx.quotationItem.createMany({
        data: input.items.map((item) => ({
          quotationId: id,
          name: item.name,
          description: item.description ?? null,
          quantity: item.quantity,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          notes: item.notes ?? null,
        })),
      });
    }

    return tx.quotation.update({
      where: { id },
      data: {
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.serviceFeeRate !== undefined
          ? { serviceFeeRate: new Prisma.Decimal(input.serviceFeeRate) }
          : {}),
        ...(input.shippingFee !== undefined
          ? { shippingFee: new Prisma.Decimal(input.shippingFee) }
          : {}),
        ...(input.tax !== undefined ? { tax: new Prisma.Decimal(input.tax) } : {}),
        ...(input.validUntil !== undefined ? { validUntil: input.validUntil } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        subtotal: totals.subtotal,
        serviceFee: totals.serviceFee,
        total: totals.total,
      },
      select: quotationDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'quotations.update',
    resource: 'quotations',
    resourceId: quotation.id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return quotation;
};

export const updateQuotationStatus = async (
  id: string,
  input: UpdateQuotationStatusInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<QuotationDetail> => {
  const existing = await findQuotationOrThrow(id, actor);

  if (input.status === QuotationStatus.APPROVED) {
    throw ApiError.badRequest('Use the approve endpoint to approve a quotation');
  }

  if (existing.status === input.status) {
    return existing;
  }

  if (!quotationStatusTransitions[existing.status].includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change quotation status from ${existing.status} to ${input.status}`,
    );
  }

  const quotation = await prisma.$transaction(async (tx) => {
    if (input.status === QuotationStatus.REJECTED) {
      const productRequest = await getProductRequestForQuotation(tx, existing.productRequestId);

      if (productRequest.status !== ProductRequestStatus.QUOTED) {
        throw ApiError.badRequest('Product request is not in quoted status');
      }

      await tx.productRequest.update({
        where: { id: productRequest.id },
        data: { status: ProductRequestStatus.REJECTED },
      });
    }

    return tx.quotation.update({
      where: { id },
      data: {
        status: input.status,
        ...(input.status === QuotationStatus.SENT ? { sentAt: new Date() } : {}),
      },
      select: quotationDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'quotations.status.update',
    resource: 'quotations',
    resourceId: quotation.id,
    metadata: { from: existing.status, to: input.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return quotation;
};

export const approveQuotation = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<QuotationDetail> => {
  const existing = await findQuotationOrThrow(id, actor);

  if (existing.status === QuotationStatus.APPROVED) {
    return existing;
  }

  if (existing.status !== QuotationStatus.SENT) {
    throw ApiError.badRequest('Only sent quotations can be approved');
  }

  const quotation = await prisma.$transaction(async (tx) => {
    const productRequest = await getProductRequestForQuotation(tx, existing.productRequestId);

    if (productRequest.status !== ProductRequestStatus.QUOTED) {
      throw ApiError.badRequest('Product request is not in quoted status');
    }

    await tx.productRequest.update({
      where: { id: productRequest.id },
      data: { status: ProductRequestStatus.APPROVED },
    });

    return tx.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.APPROVED,
        approvedById: actor.id,
        approvedAt: new Date(),
      },
      select: quotationDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'quotations.approve',
    resource: 'quotations',
    resourceId: quotation.id,
    metadata: { productRequestId: quotation.productRequestId },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return quotation;
};

export const deleteQuotation = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<void> => {
  const existing = await findQuotationOrThrow(id, actor);

  if (existing.status !== QuotationStatus.DRAFT) {
    throw ApiError.badRequest('Only draft quotations can be deleted');
  }

  await prisma.$transaction(async (tx) => {
    await tx.quotation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    const remaining = await tx.quotation.count({
      where: {
        productRequestId: existing.productRequestId,
        deletedAt: null,
      },
    });

    if (remaining === 0) {
      const productRequest = await tx.productRequest.findFirst({
        where: { id: existing.productRequestId, deletedAt: null },
        select: { id: true, status: true },
      });

      if (productRequest && productRequest.status === ProductRequestStatus.QUOTED) {
        await tx.productRequest.update({
          where: { id: productRequest.id },
          data: { status: ProductRequestStatus.REVIEWING },
        });
      }
    }
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'quotations.delete',
    resource: 'quotations',
    resourceId: id,
    metadata: { quotationNumber: existing.quotationNumber },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
