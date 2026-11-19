import { Prisma, SupplierStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateSupplierInput,
  ListSuppliersQuery,
  UpdateSupplierInput,
  UpdateSupplierStatusInput,
} from '@/modules/suppliers/suppliers.types';

const supplierStatusTransitions: Record<SupplierStatus, SupplierStatus[]> = {
  [SupplierStatus.ACTIVE]: [SupplierStatus.INACTIVE, SupplierStatus.BLOCKED],
  [SupplierStatus.INACTIVE]: [SupplierStatus.ACTIVE],
  [SupplierStatus.BLOCKED]: [SupplierStatus.INACTIVE],
};

const findSupplierOrThrow = async (id: string) => {
  const supplier = await prisma.supplier.findFirst({
    where: { id, deletedAt: null },
  });

  if (!supplier) {
    throw ApiError.notFound('Supplier not found');
  }

  return supplier;
};

export const createSupplier = async (
  input: CreateSupplierInput,
  actorId: string,
  meta: RequestMeta,
) => {
  const supplier = await prisma.supplier.create({ data: input });

  await writeAuditLog({
    actorId,
    action: 'suppliers.create',
    resource: 'suppliers',
    resourceId: supplier.id,
    metadata: { name: supplier.name },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return supplier;
};

export const listSuppliers = async (query: ListSuppliersQuery) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.SupplierWhereInput = {
    deletedAt: null,
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
  } as Prisma.SupplierOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.supplier.findMany({ where, orderBy, skip, take }),
    prisma.supplier.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getSupplier = async (id: string) => findSupplierOrThrow(id);

export const updateSupplier = async (
  id: string,
  input: UpdateSupplierInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  const existing = await findSupplierOrThrow(id);
  const supplier = await prisma.supplier.update({ where: { id }, data: input });

  await writeAuditLog({
    actorId: actor.id,
    action: 'suppliers.update',
    resource: 'suppliers',
    resourceId: supplier.id,
    metadata: { name: existing.name, fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return supplier;
};

export const updateSupplierStatus = async (
  id: string,
  input: UpdateSupplierStatusInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  const supplier = await findSupplierOrThrow(id);

  if (supplier.status === input.status) {
    return supplier;
  }

  if (!supplierStatusTransitions[supplier.status].includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change supplier status from ${supplier.status} to ${input.status}`,
    );
  }

  const updated = await prisma.supplier.update({
    where: { id },
    data: { status: input.status },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'suppliers.status_change',
    resource: 'suppliers',
    resourceId: updated.id,
    metadata: { from: supplier.status, to: updated.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return updated;
};

export const deleteSupplier = async (id: string, actor: AuthUser, meta: RequestMeta) => {
  const supplier = await findSupplierOrThrow(id);

  await prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date(), status: SupplierStatus.INACTIVE },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'suppliers.delete',
    resource: 'suppliers',
    resourceId: supplier.id,
    metadata: { name: supplier.name },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
