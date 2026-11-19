import { CustomerStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildDataScope, customerScope } from '@/shared/utils/dataScope';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateCustomerInput,
  ListCustomersQuery,
  UpdateCustomerInput,
  UpdateCustomerStatusInput,
} from '@/modules/customers/customers.types';

const customerStatusTransitions: Record<CustomerStatus, CustomerStatus[]> = {
  [CustomerStatus.ACTIVE]: [CustomerStatus.INACTIVE, CustomerStatus.BLOCKED],
  [CustomerStatus.INACTIVE]: [CustomerStatus.ACTIVE],
  [CustomerStatus.BLOCKED]: [CustomerStatus.INACTIVE],
};

const customerScopeWhere = (user: AuthUser): Prisma.CustomerWhereInput =>
  buildDataScope(user, [customerScope('id')]) as Prisma.CustomerWhereInput;

const findCustomerOrThrow = async (id: string, user: AuthUser) => {
  const customer = await prisma.customer.findFirst({
    where: {
      AND: [{ id, deletedAt: null }, customerScopeWhere(user)],
    },
  });

  if (!customer) {
    throw ApiError.notFound('Customer not found');
  }

  return customer;
};

export const createCustomer = async (
  input: CreateCustomerInput,
  actorId: string,
  meta: RequestMeta,
) => {
  const customer = await prisma.customer.create({ data: input });

  await writeAuditLog({
    actorId,
    action: 'customers.create',
    resource: 'customers',
    resourceId: customer.id,
    metadata: { name: customer.name },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return customer;
};

export const listCustomers = async (query: ListCustomersQuery, user: AuthUser) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.CustomerWhereInput = {
    deletedAt: null,
    ...customerScopeWhere(user),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { contactName: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.CustomerOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.customer.findMany({ where, orderBy, skip, take }),
    prisma.customer.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getCustomer = async (id: string, user: AuthUser) => findCustomerOrThrow(id, user);

export const updateCustomer = async (
  id: string,
  input: UpdateCustomerInput,
  user: AuthUser,
  meta: RequestMeta,
) => {
  const existing = await findCustomerOrThrow(id, user);
  const customer = await prisma.customer.update({ where: { id }, data: input });

  await writeAuditLog({
    actorId: user.id,
    action: 'customers.update',
    resource: 'customers',
    resourceId: customer.id,
    metadata: { name: existing.name, fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return customer;
};

export const updateCustomerStatus = async (
  id: string,
  input: UpdateCustomerStatusInput,
  user: AuthUser,
  meta: RequestMeta,
) => {
  const customer = await findCustomerOrThrow(id, user);

  if (customer.status === input.status) {
    return customer;
  }

  const allowedTransitions = customerStatusTransitions[customer.status];

  if (!allowedTransitions.includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change customer status from ${customer.status} to ${input.status}`,
    );
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: { status: input.status },
  });

  await writeAuditLog({
    actorId: user.id,
    action: 'customers.status_change',
    resource: 'customers',
    resourceId: updated.id,
    metadata: { from: customer.status, to: updated.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return updated;
};

export const deleteCustomer = async (id: string, actor: AuthUser, meta: RequestMeta) => {
  const customer = await findCustomerOrThrow(id, actor);
  const linkedUsers = await prisma.user.findMany({
    where: { customerId: id, deletedAt: null },
    select: { id: true },
  });
  const linkedUserIds = linkedUsers.map((user) => user.id);

  await prisma.$transaction([
    prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), status: CustomerStatus.INACTIVE },
    }),
    prisma.user.updateMany({
      where: { id: { in: linkedUserIds } },
      data: { status: 'INACTIVE' },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: { in: linkedUserIds }, revokedAt: null },
      data: { revokedAt: new Date(), revokedByIp: meta.ip ?? null },
    }),
  ]);

  await writeAuditLog({
    actorId: actor.id,
    action: 'customers.delete',
    resource: 'customers',
    resourceId: customer.id,
    metadata: { name: customer.name },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
