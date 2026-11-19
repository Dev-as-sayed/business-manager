import bcrypt from 'bcrypt';
import { Prisma, UserStatus } from '@prisma/client';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
  UpdateUserStatusInput,
} from '@/modules/users/users.types';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  status: true,
  roleId: true,
  customerId: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { id: true, name: true, description: true } },
  customer: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

type UserWithRelations = Prisma.UserGetPayload<{ select: typeof userSelect }>;

const userStatusTransitions: Record<UserStatus, UserStatus[]> = {
  [UserStatus.ACTIVE]: [UserStatus.INACTIVE, UserStatus.SUSPENDED],
  [UserStatus.INACTIVE]: [UserStatus.ACTIVE],
  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE],
};

const findUserOrThrow = async (id: string): Promise<UserWithRelations> => {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: userSelect,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

const findRoleOrThrow = async (roleId: string) => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { id: true, name: true },
  });

  if (!role) {
    throw ApiError.badRequest('Role not found');
  }

  return role;
};

const ensureCustomerIsActive = async (customerId: string) => {
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

const ensureCustomerNotLinked = async (customerId: string, currentUserId?: string) => {
  const linkedUser = await prisma.user.findUnique({
    where: { customerId },
    select: { id: true },
  });

  if (linkedUser && linkedUser.id !== currentUserId) {
    throw ApiError.conflict('Customer is already linked to another user');
  }
};

const ensureCanManageSuperAdmin = (actor: AuthUser, targetRoleName: string) => {
  if (targetRoleName === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw ApiError.forbidden('Only a super admin can manage super admin users');
  }
};

const ensureNotLastActiveSuperAdmin = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, role: { select: { name: true } } },
  });

  if (!user || user.role.name !== 'SUPER_ADMIN' || user.status !== UserStatus.ACTIVE) {
    return;
  }

  const otherActiveSuperAdmins = await prisma.user.count({
    where: {
      id: { not: userId },
      deletedAt: null,
      status: UserStatus.ACTIVE,
      role: { name: 'SUPER_ADMIN' },
    },
  });

  if (otherActiveSuperAdmins === 0) {
    throw ApiError.badRequest('Cannot remove the last active super admin');
  }
};

export const createUser = async (
  input: CreateUserInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<UserWithRelations> => {
  const role = await findRoleOrThrow(input.roleId);
  ensureCanManageSuperAdmin(actor, role.name);

  const customerId = input.customerId ?? null;

  if (role.name === 'CUSTOMER') {
    if (customerId) {
      await ensureCustomerIsActive(customerId);
    }
  } else if (customerId) {
    throw ApiError.badRequest('Only customer users can be linked to a customer');
  }

  if (customerId) {
    await ensureCustomerNotLinked(customerId);
  }

  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (existing) {
    throw ApiError.conflict('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      roleId: input.roleId,
      customerId,
    },
    select: userSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'users.create',
    resource: 'users',
    resourceId: user.id,
    metadata: { email: user.email, role: role.name },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return user;
};

export const listUsers = async (query: ListUsersQuery) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.role ? { role: { name: query.role } } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: 'insensitive' } },
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { lastName: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.UserOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where, orderBy, skip, take, select: userSelect }),
    prisma.user.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getUser = async (id: string): Promise<UserWithRelations> => findUserOrThrow(id);

export const updateUser = async (
  id: string,
  input: UpdateUserInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<UserWithRelations> => {
  const existing = await findUserOrThrow(id);
  ensureCanManageSuperAdmin(actor, existing.role.name);

  const targetRole = input.roleId
    ? await findRoleOrThrow(input.roleId)
    : { id: existing.roleId, name: existing.role.name };
  ensureCanManageSuperAdmin(actor, targetRole.name);

  let customerId = input.customerId;

  if (targetRole.name !== 'CUSTOMER') {
    if (customerId !== undefined && customerId !== null) {
      throw ApiError.badRequest('Only customer users can be linked to a customer');
    }

    customerId = null;
  } else if (customerId) {
    await ensureCustomerIsActive(customerId);
  }

  if (customerId) {
    await ensureCustomerNotLinked(customerId, id);
  }

  if (input.email && input.email !== existing.email) {
    const emailOwner = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (emailOwner && emailOwner.id !== id) {
      throw ApiError.conflict('Email is already registered');
    }
  }

  if (existing.role.name === 'SUPER_ADMIN' && targetRole.name !== 'SUPER_ADMIN') {
    await ensureNotLastActiveSuperAdmin(id);
  }

  const shouldSetCustomerId = targetRole.name !== 'CUSTOMER' || input.customerId !== undefined;

  const data: Prisma.UserUpdateInput = {
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
    ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.roleId !== undefined ? { role: { connect: { id: input.roleId } } } : {}),
    ...(shouldSetCustomerId ? { customerId } : {}),
  };

  const user = await prisma.user.update({ where: { id }, data, select: userSelect });

  await writeAuditLog({
    actorId: actor.id,
    action: 'users.update',
    resource: 'users',
    resourceId: user.id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return user;
};

export const updateUserStatus = async (
  id: string,
  input: UpdateUserStatusInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<UserWithRelations> => {
  const existing = await findUserOrThrow(id);
  ensureCanManageSuperAdmin(actor, existing.role.name);

  if (existing.status === input.status) {
    return existing;
  }

  if (!userStatusTransitions[existing.status].includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change user status from ${existing.status} to ${input.status}`,
    );
  }

  if (actor.id === id && input.status !== UserStatus.ACTIVE) {
    throw ApiError.badRequest('You cannot deactivate your own account');
  }

  if (input.status !== UserStatus.ACTIVE) {
    await ensureNotLastActiveSuperAdmin(id);
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: { status: input.status },
      select: userSelect,
    });

    if (input.status !== UserStatus.ACTIVE) {
      await tx.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date(), revokedByIp: meta.ip ?? null },
      });
    }

    return updated;
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'users.status_change',
    resource: 'users',
    resourceId: id,
    metadata: { from: existing.status, to: input.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return user;
};

export const deleteUser = async (id: string, actor: AuthUser, meta: RequestMeta) => {
  const existing = await findUserOrThrow(id);
  ensureCanManageSuperAdmin(actor, existing.role.name);

  if (actor.id === id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  await ensureNotLastActiveSuperAdmin(id);

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: UserStatus.INACTIVE,
        customerId: null,
      },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date(), revokedByIp: meta.ip ?? null },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: id, usedAt: null },
    }),
  ]);

  await writeAuditLog({
    actorId: actor.id,
    action: 'users.delete',
    resource: 'users',
    resourceId: id,
    metadata: { email: existing.email },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
