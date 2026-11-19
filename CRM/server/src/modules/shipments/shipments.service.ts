import { randomUUID } from 'node:crypto';
import { Prisma, PurchaseOrderStatus, ShipmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildDataScope, customerScope } from '@/shared/utils/dataScope';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateShipmentInput,
  ListShipmentsQuery,
  ShipmentItemInput,
  UpdateShipmentInput,
  UpdateShipmentStatusInput,
} from '@/modules/shipments/shipments.types';

const shipmentListSelect = {
  id: true,
  shipmentNumber: true,
  customerId: true,
  status: true,
  carrier: true,
  trackingNumber: true,
  shippingMethod: true,
  origin: true,
  destination: true,
  estimatedDeliveryDate: true,
  actualDeliveryDate: true,
  notes: true,
  createdById: true,
  shippedAt: true,
  deliveredAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, name: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { items: true } },
} satisfies Prisma.ShipmentSelect;

const shipmentDetailSelect = {
  ...shipmentListSelect,
  items: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      purchaseOrderItemId: true,
      quantity: true,
      createdAt: true,
      updatedAt: true,
      purchaseOrderItem: {
        select: {
          id: true,
          name: true,
          quantity: true,
          purchaseOrderId: true,
          purchaseOrder: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              supplierId: true,
              supplier: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ShipmentSelect;

type ShipmentDetail = Prisma.ShipmentGetPayload<{
  select: typeof shipmentDetailSelect;
}>;

const shipmentStatusTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  [ShipmentStatus.PENDING]: [ShipmentStatus.PREPARING, ShipmentStatus.CANCELLED],
  [ShipmentStatus.PREPARING]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED],
  [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.DELIVERED],
  [ShipmentStatus.DELIVERED]: [],
  [ShipmentStatus.CANCELLED]: [],
};

const shipmentScope = (actor: AuthUser): Prisma.ShipmentWhereInput =>
  buildDataScope(actor, [customerScope('customerId')]) as Prisma.ShipmentWhereInput;

const findShipmentOrThrow = async (id: string, actor: AuthUser): Promise<ShipmentDetail> => {
  const shipment = await prisma.shipment.findFirst({
    where: {
      AND: [{ id, deletedAt: null }, shipmentScope(actor)],
    },
    select: shipmentDetailSelect,
  });

  if (!shipment) {
    throw ApiError.notFound('Shipment not found');
  }

  return shipment;
};

const ensureUniqueItemIds = (items: ShipmentItemInput[]) => {
  const itemIds = new Set<string>();

  for (const item of items) {
    if (itemIds.has(item.purchaseOrderItemId)) {
      throw ApiError.badRequest('Duplicate purchase order items are not allowed');
    }

    itemIds.add(item.purchaseOrderItemId);
  }
};

const loadShippablePurchaseOrderItems = async (tx: Prisma.TransactionClient, itemIds: string[]) => {
  const items = await tx.purchaseOrderItem.findMany({
    where: { id: { in: itemIds } },
    select: {
      id: true,
      quantity: true,
      purchaseOrder: {
        select: {
          id: true,
          customerId: true,
          status: true,
          deletedAt: true,
        },
      },
    },
  });

  if (items.length !== itemIds.length) {
    throw ApiError.notFound('Purchase order item not found');
  }

  for (const item of items) {
    if (item.purchaseOrder.deletedAt) {
      throw ApiError.notFound('Purchase order item not found');
    }

    if (
      item.purchaseOrder.status !== PurchaseOrderStatus.APPROVED &&
      item.purchaseOrder.status !== PurchaseOrderStatus.IN_PRODUCTION
    ) {
      throw ApiError.badRequest('Purchase order must be approved or in production before shipping');
    }
  }

  const [firstItem] = items;

  if (!firstItem) {
    throw ApiError.badRequest('At least one shipment item is required');
  }

  const customerIds = new Set(items.map((item) => item.purchaseOrder.customerId));

  if (customerIds.size !== 1) {
    throw ApiError.badRequest('All shipment items must belong to the same customer');
  }

  return { items, customerId: firstItem.purchaseOrder.customerId };
};

const ensureAvailableQuantities = async (
  tx: Prisma.TransactionClient,
  items: ShipmentItemInput[],
  excludeShipmentId?: string,
) => {
  const itemIds = items.map((item) => item.purchaseOrderItemId);
  const shippable = await loadShippablePurchaseOrderItems(tx, itemIds);
  const orderedById = new Map(shippable.items.map((item) => [item.id, item.quantity]));

  const existingItems = await tx.shipmentItem.findMany({
    where: {
      purchaseOrderItemId: { in: itemIds },
      shipment: {
        deletedAt: null,
        status: { not: ShipmentStatus.CANCELLED },
        ...(excludeShipmentId ? { id: { not: excludeShipmentId } } : {}),
      },
    },
    select: { purchaseOrderItemId: true, quantity: true },
  });

  const shippedById = new Map<string, number>();

  for (const existing of existingItems) {
    shippedById.set(
      existing.purchaseOrderItemId,
      (shippedById.get(existing.purchaseOrderItemId) ?? 0) + existing.quantity,
    );
  }

  for (const item of items) {
    const orderedQuantity = orderedById.get(item.purchaseOrderItemId);

    if (orderedQuantity === undefined) {
      throw ApiError.notFound('Purchase order item not found');
    }

    const alreadyShipped = shippedById.get(item.purchaseOrderItemId) ?? 0;

    if (alreadyShipped + item.quantity > orderedQuantity) {
      throw ApiError.badRequest(
        `Shipment quantity exceeds the ordered quantity for purchase order item ${item.purchaseOrderItemId}`,
      );
    }
  }

  return shippable;
};

const generateShipmentNumber = () => `SH-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const createShipment = async (
  input: CreateShipmentInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<ShipmentDetail> => {
  ensureUniqueItemIds(input.items);

  const shipment = await prisma.$transaction(async (tx) => {
    const shippable = await ensureAvailableQuantities(tx, input.items);

    return tx.shipment.create({
      data: {
        shipmentNumber: generateShipmentNumber(),
        customerId: shippable.customerId,
        carrier: input.carrier ?? null,
        trackingNumber: input.trackingNumber ?? null,
        shippingMethod: input.shippingMethod ?? null,
        origin: input.origin ?? null,
        destination: input.destination ?? null,
        estimatedDeliveryDate: input.estimatedDeliveryDate ?? null,
        notes: input.notes ?? null,
        createdById: actor.id,
        items: {
          create: input.items.map((item) => ({
            purchaseOrderItemId: item.purchaseOrderItemId,
            quantity: item.quantity,
          })),
        },
      },
      select: shipmentDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'shipments.create',
    resource: 'shipments',
    resourceId: shipment.id,
    metadata: {
      shipmentNumber: shipment.shipmentNumber,
      customerId: shipment.customerId,
      itemCount: shipment.items.length,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return shipment;
};

export const listShipments = async (query: ListShipmentsQuery, actor: AuthUser) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const conditions: Prisma.ShipmentWhereInput[] = [{ deletedAt: null }, shipmentScope(actor)];

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.customerId) {
    conditions.push({ customerId: query.customerId });
  }

  if (query.purchaseOrderId) {
    conditions.push({
      items: {
        some: {
          purchaseOrderItem: { purchaseOrderId: query.purchaseOrderId },
        },
      },
    });
  }

  if (query.carrier) {
    conditions.push({ carrier: { contains: query.carrier, mode: 'insensitive' } });
  }

  if (query.trackingNumber) {
    conditions.push({ trackingNumber: { contains: query.trackingNumber, mode: 'insensitive' } });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { shipmentNumber: { contains: query.search, mode: 'insensitive' } },
        { trackingNumber: { contains: query.search, mode: 'insensitive' } },
        { carrier: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        {
          items: {
            some: {
              purchaseOrderItem: {
                purchaseOrder: {
                  orderNumber: { contains: query.search, mode: 'insensitive' },
                },
              },
            },
          },
        },
      ],
    });
  }

  const where: Prisma.ShipmentWhereInput = { AND: conditions };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.ShipmentOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.shipment.findMany({
      where,
      orderBy,
      skip,
      take,
      select: shipmentListSelect,
    }),
    prisma.shipment.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getShipment = async (id: string, actor: AuthUser): Promise<ShipmentDetail> =>
  findShipmentOrThrow(id, actor);

export const updateShipment = async (
  id: string,
  input: UpdateShipmentInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<ShipmentDetail> => {
  const existing = await findShipmentOrThrow(id, actor);

  if (existing.status !== ShipmentStatus.PENDING) {
    throw ApiError.badRequest('Only pending shipments can be updated');
  }

  if (input.items !== undefined) {
    ensureUniqueItemIds(input.items);
  }

  const shipment = await prisma.$transaction(async (tx) => {
    if (input.items !== undefined) {
      const shippable = await ensureAvailableQuantities(tx, input.items, id);

      if (shippable.customerId !== existing.customerId) {
        throw ApiError.badRequest('Shipment items must belong to the shipment customer');
      }

      await tx.shipmentItem.deleteMany({ where: { shipmentId: id } });

      await tx.shipmentItem.createMany({
        data: input.items.map((item) => ({
          shipmentId: id,
          purchaseOrderItemId: item.purchaseOrderItemId,
          quantity: item.quantity,
        })),
      });
    }

    return tx.shipment.update({
      where: { id },
      data: {
        ...(input.carrier !== undefined ? { carrier: input.carrier } : {}),
        ...(input.trackingNumber !== undefined ? { trackingNumber: input.trackingNumber } : {}),
        ...(input.shippingMethod !== undefined ? { shippingMethod: input.shippingMethod } : {}),
        ...(input.origin !== undefined ? { origin: input.origin } : {}),
        ...(input.destination !== undefined ? { destination: input.destination } : {}),
        ...(input.estimatedDeliveryDate !== undefined
          ? { estimatedDeliveryDate: input.estimatedDeliveryDate }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
      select: shipmentDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'shipments.update',
    resource: 'shipments',
    resourceId: shipment.id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return shipment;
};

export const updateShipmentStatus = async (
  id: string,
  input: UpdateShipmentStatusInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<ShipmentDetail> => {
  const existing = await findShipmentOrThrow(id, actor);

  if (existing.status === input.status) {
    return existing;
  }

  if (!shipmentStatusTransitions[existing.status].includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change shipment status from ${existing.status} to ${input.status}`,
    );
  }

  const now = new Date();

  const shipment = await prisma.shipment.update({
    where: { id },
    data: {
      status: input.status,
      ...(input.status === ShipmentStatus.IN_TRANSIT ? { shippedAt: now } : {}),
      ...(input.status === ShipmentStatus.DELIVERED
        ? { deliveredAt: now, actualDeliveryDate: existing.actualDeliveryDate ?? now }
        : {}),
      ...(input.status === ShipmentStatus.CANCELLED ? { cancelledAt: now } : {}),
    },
    select: shipmentDetailSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'shipments.status.update',
    resource: 'shipments',
    resourceId: shipment.id,
    metadata: { from: existing.status, to: input.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return shipment;
};
