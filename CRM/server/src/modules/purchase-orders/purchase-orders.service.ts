import { randomUUID } from 'node:crypto';
import { Prisma, PurchaseOrderStatus, QuotationStatus, SupplierStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildDataScope, customerScope } from '@/shared/utils/dataScope';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreatePurchaseOrderInput,
  ListPurchaseOrdersQuery,
  UpdatePurchaseOrderInput,
  UpdatePurchaseOrderStatusInput,
} from '@/modules/purchase-orders/purchase-orders.types';

const purchaseOrderListSelect = {
  id: true,
  orderNumber: true,
  quotationId: true,
  customerId: true,
  supplierId: true,
  status: true,
  currency: true,
  subtotal: true,
  shippingFee: true,
  tax: true,
  total: true,
  expectedDeliveryDate: true,
  notes: true,
  createdById: true,
  approvedById: true,
  approvedAt: true,
  submittedAt: true,
  productionStartedAt: true,
  shippedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  quotation: { select: { id: true, quotationNumber: true, status: true } },
  customer: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { items: true } },
} satisfies Prisma.PurchaseOrderSelect;

const purchaseOrderDetailSelect = {
  ...purchaseOrderListSelect,
  items: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      quantity: true,
      unitCost: true,
      total: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.PurchaseOrderSelect;

type PurchaseOrderDetail = Prisma.PurchaseOrderGetPayload<{
  select: typeof purchaseOrderDetailSelect;
}>;

type PurchaseOrderItemData = {
  name: string;
  description?: string | null;
  quantity: number;
  unitCost: number;
  notes?: string | null;
};

const purchaseOrderStatusTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  [PurchaseOrderStatus.DRAFT]: [
    PurchaseOrderStatus.PENDING_APPROVAL,
    PurchaseOrderStatus.CANCELLED,
  ],
  [PurchaseOrderStatus.PENDING_APPROVAL]: [PurchaseOrderStatus.CANCELLED],
  [PurchaseOrderStatus.APPROVED]: [
    PurchaseOrderStatus.IN_PRODUCTION,
    PurchaseOrderStatus.CANCELLED,
  ],
  [PurchaseOrderStatus.IN_PRODUCTION]: [PurchaseOrderStatus.SHIPPED],
  [PurchaseOrderStatus.SHIPPED]: [PurchaseOrderStatus.COMPLETED],
  [PurchaseOrderStatus.COMPLETED]: [],
  [PurchaseOrderStatus.CANCELLED]: [],
};

const purchaseOrderScope = (actor: AuthUser): Prisma.PurchaseOrderWhereInput =>
  buildDataScope(actor, [customerScope('customerId')]) as Prisma.PurchaseOrderWhereInput;

const findPurchaseOrderOrThrow = async (
  id: string,
  actor: AuthUser,
): Promise<PurchaseOrderDetail> => {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: {
      AND: [{ id, deletedAt: null }, purchaseOrderScope(actor)],
    },
    select: purchaseOrderDetailSelect,
  });

  if (!purchaseOrder) {
    throw ApiError.notFound('Purchase order not found');
  }

  return purchaseOrder;
};

const getApprovedQuotationForPurchaseOrder = async (
  tx: Prisma.TransactionClient,
  quotationId: string,
) => {
  const quotation = await tx.quotation.findFirst({
    where: { id: quotationId, deletedAt: null },
    select: {
      id: true,
      customerId: true,
      status: true,
      currency: true,
      customer: { select: { id: true, status: true } },
    },
  });

  if (!quotation) {
    throw ApiError.notFound('Quotation not found');
  }

  if (quotation.status !== QuotationStatus.APPROVED) {
    throw ApiError.badRequest('Quotation must be approved before creating a purchase order');
  }

  if (quotation.customer.status !== 'ACTIVE') {
    throw ApiError.badRequest('Customer is not active');
  }

  return quotation;
};

const ensureActiveSupplier = async (tx: Prisma.TransactionClient, supplierId: string) => {
  const supplier = await tx.supplier.findFirst({
    where: { id: supplierId, deletedAt: null },
    select: { id: true, status: true },
  });

  if (!supplier) {
    throw ApiError.badRequest('Supplier not found');
  }

  if (supplier.status !== SupplierStatus.ACTIVE) {
    throw ApiError.badRequest('Supplier is not active');
  }

  return supplier;
};

const ensureUniquePurchaseOrder = async (
  tx: Prisma.TransactionClient,
  quotationId: string,
  supplierId: string,
  excludeId?: string,
) => {
  const existing = await tx.purchaseOrder.findFirst({
    where: {
      quotationId,
      supplierId,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw ApiError.conflict('A purchase order already exists for this supplier and quotation');
  }
};

const calculateTotals = (items: PurchaseOrderItemData[], shippingFee: number, tax: number) => {
  const itemTotals = items.map((item) => ({
    ...item,
    total: new Prisma.Decimal(item.unitCost).mul(item.quantity).toDecimalPlaces(2),
  }));

  const subtotal = itemTotals
    .reduce((sum, item) => sum.add(item.total), new Prisma.Decimal(0))
    .toDecimalPlaces(2);

  const total = subtotal
    .add(new Prisma.Decimal(shippingFee))
    .add(new Prisma.Decimal(tax))
    .toDecimalPlaces(2);

  return { itemTotals, subtotal, total };
};

const generateOrderNumber = () => `PO-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const createPurchaseOrder = async (
  input: CreatePurchaseOrderInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<PurchaseOrderDetail> => {
  const shippingFee = input.shippingFee ?? 0;
  const tax = input.tax ?? 0;
  const totals = calculateTotals(input.items, shippingFee, tax);

  const purchaseOrder = await prisma.$transaction(async (tx) => {
    const quotation = await getApprovedQuotationForPurchaseOrder(tx, input.quotationId);
    await ensureActiveSupplier(tx, input.supplierId);
    await ensureUniquePurchaseOrder(tx, quotation.id, input.supplierId);

    return tx.purchaseOrder.create({
      data: {
        orderNumber: generateOrderNumber(),
        quotationId: quotation.id,
        customerId: quotation.customerId,
        supplierId: input.supplierId,
        currency: quotation.currency,
        shippingFee: new Prisma.Decimal(shippingFee),
        tax: new Prisma.Decimal(tax),
        subtotal: totals.subtotal,
        total: totals.total,
        expectedDeliveryDate: input.expectedDeliveryDate ?? null,
        notes: input.notes ?? null,
        createdById: actor.id,
        items: {
          create: totals.itemTotals.map((item) => ({
            name: item.name,
            description: item.description ?? null,
            quantity: item.quantity,
            unitCost: new Prisma.Decimal(item.unitCost),
            total: item.total,
            notes: item.notes ?? null,
          })),
        },
      },
      select: purchaseOrderDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'purchase_orders.create',
    resource: 'purchase_orders',
    resourceId: purchaseOrder.id,
    metadata: {
      orderNumber: purchaseOrder.orderNumber,
      quotationId: purchaseOrder.quotationId,
      supplierId: purchaseOrder.supplierId,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return purchaseOrder;
};

export const listPurchaseOrders = async (query: ListPurchaseOrdersQuery, actor: AuthUser) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const conditions: Prisma.PurchaseOrderWhereInput[] = [
    { deletedAt: null },
    purchaseOrderScope(actor),
  ];

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.customerId) {
    conditions.push({ customerId: query.customerId });
  }

  if (query.supplierId) {
    conditions.push({ supplierId: query.supplierId });
  }

  if (query.quotationId) {
    conditions.push({ quotationId: query.quotationId });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
        {
          quotation: {
            quotationNumber: { contains: query.search, mode: 'insensitive' },
          },
        },
      ],
    });
  }

  const where: Prisma.PurchaseOrderWhereInput = { AND: conditions };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.PurchaseOrderOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.purchaseOrder.findMany({
      where,
      orderBy,
      skip,
      take,
      select: purchaseOrderListSelect,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getPurchaseOrder = async (id: string, actor: AuthUser): Promise<PurchaseOrderDetail> =>
  findPurchaseOrderOrThrow(id, actor);

export const updatePurchaseOrder = async (
  id: string,
  input: UpdatePurchaseOrderInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<PurchaseOrderDetail> => {
  const existing = await findPurchaseOrderOrThrow(id, actor);

  if (existing.status !== PurchaseOrderStatus.DRAFT) {
    throw ApiError.badRequest('Only draft purchase orders can be updated');
  }

  const items =
    input.items ??
    existing.items.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitCost: Number(item.unitCost),
      notes: item.notes,
    }));

  const shippingFee = input.shippingFee ?? Number(existing.shippingFee);
  const tax = input.tax ?? Number(existing.tax);
  const totals = calculateTotals(items, shippingFee, tax);

  const purchaseOrder = await prisma.$transaction(async (tx) => {
    if (input.supplierId !== undefined) {
      await ensureActiveSupplier(tx, input.supplierId);
      await ensureUniquePurchaseOrder(tx, existing.quotationId, input.supplierId, id);
    }

    if (input.items !== undefined) {
      await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });

      await tx.purchaseOrderItem.createMany({
        data: totals.itemTotals.map((item) => ({
          purchaseOrderId: id,
          name: item.name,
          description: item.description ?? null,
          quantity: item.quantity,
          unitCost: new Prisma.Decimal(item.unitCost),
          total: item.total,
          notes: item.notes ?? null,
        })),
      });
    }

    return tx.purchaseOrder.update({
      where: { id },
      data: {
        ...(input.supplierId !== undefined ? { supplierId: input.supplierId } : {}),
        ...(input.shippingFee !== undefined
          ? { shippingFee: new Prisma.Decimal(input.shippingFee) }
          : {}),
        ...(input.tax !== undefined ? { tax: new Prisma.Decimal(input.tax) } : {}),
        ...(input.expectedDeliveryDate !== undefined
          ? { expectedDeliveryDate: input.expectedDeliveryDate }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        subtotal: totals.subtotal,
        total: totals.total,
      },
      select: purchaseOrderDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'purchase_orders.update',
    resource: 'purchase_orders',
    resourceId: purchaseOrder.id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return purchaseOrder;
};

export const updatePurchaseOrderStatus = async (
  id: string,
  input: UpdatePurchaseOrderStatusInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<PurchaseOrderDetail> => {
  const existing = await findPurchaseOrderOrThrow(id, actor);

  if (input.status === PurchaseOrderStatus.APPROVED) {
    throw ApiError.badRequest('Use the approve endpoint to approve a purchase order');
  }

  if (existing.status === input.status) {
    return existing;
  }

  if (!purchaseOrderStatusTransitions[existing.status].includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change purchase order status from ${existing.status} to ${input.status}`,
    );
  }

  const purchaseOrder = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: input.status,
      ...(input.status === PurchaseOrderStatus.PENDING_APPROVAL ? { submittedAt: new Date() } : {}),
      ...(input.status === PurchaseOrderStatus.IN_PRODUCTION
        ? { productionStartedAt: new Date() }
        : {}),
      ...(input.status === PurchaseOrderStatus.SHIPPED ? { shippedAt: new Date() } : {}),
      ...(input.status === PurchaseOrderStatus.COMPLETED ? { completedAt: new Date() } : {}),
    },
    select: purchaseOrderDetailSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'purchase_orders.status.update',
    resource: 'purchase_orders',
    resourceId: purchaseOrder.id,
    metadata: { from: existing.status, to: input.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return purchaseOrder;
};

export const approvePurchaseOrder = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<PurchaseOrderDetail> => {
  const existing = await findPurchaseOrderOrThrow(id, actor);

  if (existing.status === PurchaseOrderStatus.APPROVED) {
    return existing;
  }

  if (existing.status !== PurchaseOrderStatus.PENDING_APPROVAL) {
    throw ApiError.badRequest('Only pending purchase orders can be approved');
  }

  const purchaseOrder = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: PurchaseOrderStatus.APPROVED,
      approvedById: actor.id,
      approvedAt: new Date(),
    },
    select: purchaseOrderDetailSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'purchase_orders.approve',
    resource: 'purchase_orders',
    resourceId: purchaseOrder.id,
    metadata: {
      orderNumber: purchaseOrder.orderNumber,
      quotationId: purchaseOrder.quotationId,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return purchaseOrder;
};

export const deletePurchaseOrder = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<void> => {
  const existing = await findPurchaseOrderOrThrow(id, actor);

  if (existing.status !== PurchaseOrderStatus.DRAFT) {
    throw ApiError.badRequest('Only draft purchase orders can be deleted');
  }

  await prisma.purchaseOrder.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'purchase_orders.delete',
    resource: 'purchase_orders',
    resourceId: id,
    metadata: { orderNumber: existing.orderNumber },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
