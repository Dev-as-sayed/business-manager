import { randomUUID } from 'node:crypto';
import { Prisma, ProductRequestStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildDataScope, assigneeScope, customerScope } from '@/shared/utils/dataScope';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  AssignProductRequestInput,
  CreateProductRequestInput,
  ListProductRequestsQuery,
  UpdateProductRequestInput,
  UpdateProductRequestStatusInput,
} from '@/modules/product-requests/product-requests.types';

const productRequestListSelect = {
  id: true,
  requestNumber: true,
  customerId: true,
  title: true,
  description: true,
  status: true,
  assignedUserId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, name: true } },
  assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { items: true } },
} satisfies Prisma.ProductRequestSelect;

const productRequestDetailSelect = {
  ...productRequestListSelect,
  items: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      quantity: true,
      targetPrice: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.ProductRequestSelect;

type ProductRequestDetail = Prisma.ProductRequestGetPayload<{
  select: typeof productRequestDetailSelect;
}>;

const staffStatusTransitions: Record<ProductRequestStatus, ProductRequestStatus[]> = {
  [ProductRequestStatus.DRAFT]: [ProductRequestStatus.SUBMITTED, ProductRequestStatus.CANCELLED],
  [ProductRequestStatus.SUBMITTED]: [
    ProductRequestStatus.REVIEWING,
    ProductRequestStatus.CANCELLED,
  ],
  [ProductRequestStatus.REVIEWING]: [
    ProductRequestStatus.QUOTED,
    ProductRequestStatus.REJECTED,
    ProductRequestStatus.CANCELLED,
  ],
  [ProductRequestStatus.QUOTED]: [
    ProductRequestStatus.APPROVED,
    ProductRequestStatus.REJECTED,
    ProductRequestStatus.CANCELLED,
  ],
  [ProductRequestStatus.APPROVED]: [],
  [ProductRequestStatus.REJECTED]: [],
  [ProductRequestStatus.CANCELLED]: [],
};

const customerStatusTransitions: Record<ProductRequestStatus, ProductRequestStatus[]> = {
  ...staffStatusTransitions,
  [ProductRequestStatus.DRAFT]: [ProductRequestStatus.SUBMITTED, ProductRequestStatus.CANCELLED],
  [ProductRequestStatus.SUBMITTED]: [ProductRequestStatus.CANCELLED],
  [ProductRequestStatus.REVIEWING]: [],
  [ProductRequestStatus.QUOTED]: [],
};

const terminalStatuses: ProductRequestStatus[] = [
  ProductRequestStatus.APPROVED,
  ProductRequestStatus.REJECTED,
  ProductRequestStatus.CANCELLED,
];

const productRequestScope = (actor: AuthUser): Prisma.ProductRequestWhereInput =>
  buildDataScope(actor, [
    customerScope('customerId'),
    assigneeScope('assignedUserId'),
  ]) as Prisma.ProductRequestWhereInput;

const findProductRequestOrThrow = async (
  id: string,
  actor: AuthUser,
): Promise<ProductRequestDetail> => {
  const productRequest = await prisma.productRequest.findFirst({
    where: {
      AND: [{ id, deletedAt: null }, productRequestScope(actor)],
    },
    select: productRequestDetailSelect,
  });

  if (!productRequest) {
    throw ApiError.notFound('Product request not found');
  }

  return productRequest;
};

const ensureActiveCustomer = async (customerId: string) => {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, deletedAt: null },
    select: { id: true, status: true },
  });

  if (!customer) {
    throw ApiError.badRequest('Customer not found');
  }

  if (customer.status !== 'ACTIVE') {
    throw ApiError.badRequest('Customer is not active');
  }

  return customer;
};

const ensureOpsUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      status: 'ACTIVE',
      role: { name: 'CHINA_OPERATIONS' },
    },
    select: { id: true },
  });

  if (!user) {
    throw ApiError.badRequest('Assigned user must be an active China operations user');
  }

  return user;
};

const generateRequestNumber = () => `PR-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const createProductRequest = async (
  input: CreateProductRequestInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<ProductRequestDetail> => {
  let customerId: string;
  let assignedUserId: string | null = null;

  if (actor.role === 'CUSTOMER') {
    if (!actor.customerId) {
      throw ApiError.forbidden('Customer account is not linked to a customer');
    }

    if (input.customerId && input.customerId !== actor.customerId) {
      throw ApiError.forbidden('Cannot create a request for another customer');
    }

    if (input.assignedUserId) {
      throw ApiError.forbidden('Customers cannot assign requests');
    }

    customerId = actor.customerId;
  } else {
    if (!input.customerId) {
      throw ApiError.badRequest('customerId is required');
    }

    customerId = input.customerId;
    assignedUserId = input.assignedUserId ?? null;
  }

  await ensureActiveCustomer(customerId);

  if (assignedUserId) {
    await ensureOpsUser(assignedUserId);
  }

  const productRequest = await prisma.productRequest.create({
    data: {
      requestNumber: generateRequestNumber(),
      customerId,
      title: input.title,
      description: input.description ?? null,
      assignedUserId,
      createdById: actor.id,
      items: {
        create: input.items.map((item) => ({
          name: item.name,
          description: item.description ?? null,
          quantity: item.quantity,
          targetPrice: item.targetPrice ?? null,
          notes: item.notes ?? null,
        })),
      },
    },
    select: productRequestDetailSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'product_requests.create',
    resource: 'product_requests',
    resourceId: productRequest.id,
    metadata: { requestNumber: productRequest.requestNumber },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return productRequest;
};

export const listProductRequests = async (query: ListProductRequestsQuery, actor: AuthUser) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const conditions: Prisma.ProductRequestWhereInput[] = [
    { deletedAt: null },
    productRequestScope(actor),
  ];

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.customerId) {
    conditions.push({ customerId: query.customerId });
  }

  if (query.assignedUserId) {
    conditions.push({ assignedUserId: query.assignedUserId });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { requestNumber: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ],
    });
  }

  const where: Prisma.ProductRequestWhereInput = { AND: conditions };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.ProductRequestOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.productRequest.findMany({
      where,
      orderBy,
      skip,
      take,
      select: productRequestListSelect,
    }),
    prisma.productRequest.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getProductRequest = async (
  id: string,
  actor: AuthUser,
): Promise<ProductRequestDetail> => findProductRequestOrThrow(id, actor);

export const updateProductRequest = async (
  id: string,
  input: UpdateProductRequestInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<ProductRequestDetail> => {
  const existing = await findProductRequestOrThrow(id, actor);

  if (terminalStatuses.includes(existing.status)) {
    throw ApiError.badRequest('Cannot update a closed product request');
  }

  if (
    actor.role === 'CUSTOMER' &&
    existing.status !== ProductRequestStatus.DRAFT &&
    existing.status !== ProductRequestStatus.SUBMITTED
  ) {
    throw ApiError.forbidden('Customers can only update draft or submitted requests');
  }

  const productRequest = await prisma.$transaction(async (tx) => {
    if (input.items !== undefined) {
      await tx.productRequestItem.deleteMany({ where: { productRequestId: id } });

      await tx.productRequestItem.createMany({
        data: input.items.map((item) => ({
          productRequestId: id,
          name: item.name,
          description: item.description ?? null,
          quantity: item.quantity,
          targetPrice: item.targetPrice ?? null,
          notes: item.notes ?? null,
        })),
      });
    }

    return tx.productRequest.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
      select: productRequestDetailSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'product_requests.update',
    resource: 'product_requests',
    resourceId: id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return productRequest;
};

export const updateProductRequestStatus = async (
  id: string,
  input: UpdateProductRequestStatusInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<ProductRequestDetail> => {
  const existing = await findProductRequestOrThrow(id, actor);

  if (existing.status === input.status) {
    return existing;
  }

  const transitions =
    actor.role === 'CUSTOMER' ? customerStatusTransitions : staffStatusTransitions;

  if (!transitions[existing.status].includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change product request status from ${existing.status} to ${input.status}`,
    );
  }

  const productRequest = await prisma.productRequest.update({
    where: { id },
    data: { status: input.status },
    select: productRequestDetailSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'product_requests.status.update',
    resource: 'product_requests',
    resourceId: id,
    metadata: { from: existing.status, to: input.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return productRequest;
};

export const assignProductRequest = async (
  id: string,
  input: AssignProductRequestInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<ProductRequestDetail> => {
  if (actor.role === 'CUSTOMER') {
    throw ApiError.forbidden('Customers cannot assign requests');
  }

  const existing = await findProductRequestOrThrow(id, actor);

  if (terminalStatuses.includes(existing.status)) {
    throw ApiError.badRequest('Cannot assign a closed product request');
  }

  if (input.assignedUserId) {
    await ensureOpsUser(input.assignedUserId);
  }

  const productRequest = await prisma.productRequest.update({
    where: { id },
    data: { assignedUserId: input.assignedUserId },
    select: productRequestDetailSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'product_requests.assign',
    resource: 'product_requests',
    resourceId: id,
    metadata: { assignedUserId: input.assignedUserId },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return productRequest;
};

export const deleteProductRequest = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<void> => {
  await findProductRequestOrThrow(id, actor);

  await prisma.productRequest.update({
    where: { id },
    data: { deletedAt: new Date(), status: ProductRequestStatus.CANCELLED },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'product_requests.delete',
    resource: 'product_requests',
    resourceId: id,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
