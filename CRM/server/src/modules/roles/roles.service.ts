import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateRoleInput,
  ListRolesQuery,
  RoleResponse,
  UpdateRoleInput,
} from '@/modules/roles/roles.types';

const roleSelect = {
  id: true,
  name: true,
  description: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  permissions: {
    select: {
      permission: {
        select: { id: true, resource: true, action: true },
      },
    },
  },
  _count: { select: { users: true } },
} satisfies Prisma.RoleSelect;

type RoleWithRelations = Prisma.RoleGetPayload<{ select: typeof roleSelect }>;

const toRoleResponse = (role: RoleWithRelations): RoleResponse => ({
  id: role.id,
  name: role.name,
  description: role.description,
  isSystem: role.isSystem,
  userCount: role._count.users,
  permissions: role.permissions
    .map(({ permission }) => `${permission.resource}:${permission.action}`)
    .sort(),
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
});

const findRoleOrThrow = async (id: string): Promise<RoleWithRelations> => {
  const role = await prisma.role.findUnique({ where: { id }, select: roleSelect });

  if (!role) {
    throw ApiError.notFound('Role not found');
  }

  return role;
};

const resolvePermissionIds = async (keys: string[]): Promise<string[]> => {
  const uniqueKeys = [...new Set(keys)];

  if (uniqueKeys.length === 0) {
    return [];
  }

  const permissions = await prisma.permission.findMany({
    where: {
      OR: uniqueKeys.map((key) => {
        const separatorIndex = key.indexOf(':');
        return {
          resource: key.slice(0, separatorIndex),
          action: key.slice(separatorIndex + 1),
        };
      }),
    },
    select: { id: true, resource: true, action: true },
  });

  const foundKeys = new Set(
    permissions.map((permission) => `${permission.resource}:${permission.action}`),
  );
  const missingKeys = uniqueKeys.filter((key) => !foundKeys.has(key));

  if (missingKeys.length > 0) {
    throw ApiError.badRequest(
      'Unknown permissions',
      missingKeys.map((key) => ({
        field: 'permissions',
        message: `Unknown permission: ${key}`,
      })),
    );
  }

  return permissions.map((permission) => permission.id);
};

export const listPermissions = async () => {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    select: { id: true, resource: true, action: true, description: true },
  });

  return permissions.map((permission) => ({
    id: permission.id,
    key: `${permission.resource}:${permission.action}`,
    resource: permission.resource,
    action: permission.action,
    description: permission.description,
  }));
};

export const listRoles = async (query: ListRolesQuery) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.RoleWhereInput = query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [roles, total] = await prisma.$transaction([
    prisma.role.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take,
      select: roleSelect,
    }),
    prisma.role.count({ where }),
  ]);

  return { items: roles.map(toRoleResponse), meta: buildMeta(total, page, limit) };
};

export const getRole = async (id: string): Promise<RoleResponse> =>
  toRoleResponse(await findRoleOrThrow(id));

export const createRole = async (
  input: CreateRoleInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<RoleResponse> => {
  const existing = await prisma.role.findUnique({
    where: { name: input.name },
    select: { id: true },
  });

  if (existing) {
    throw ApiError.conflict('Role name already exists');
  }

  const permissionIds = input.permissions ? await resolvePermissionIds(input.permissions) : [];

  const role = await prisma.$transaction(async (tx) => {
    const created = await tx.role.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        isSystem: false,
      },
    });

    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: created.id,
          permissionId,
        })),
      });
    }

    return tx.role.findUniqueOrThrow({ where: { id: created.id }, select: roleSelect });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'roles.create',
    resource: 'roles',
    resourceId: role.id,
    metadata: { name: role.name, permissions: input.permissions ?? [] },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return toRoleResponse(role);
};

export const updateRole = async (
  id: string,
  input: UpdateRoleInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<RoleResponse> => {
  const existing = await findRoleOrThrow(id);

  if (input.name !== undefined && input.name !== existing.name) {
    if (existing.isSystem) {
      throw ApiError.badRequest('System roles cannot be renamed');
    }

    const nameOwner = await prisma.role.findUnique({
      where: { name: input.name },
      select: { id: true },
    });

    if (nameOwner && nameOwner.id !== id) {
      throw ApiError.conflict('Role name already exists');
    }
  }

  if (existing.name === 'SUPER_ADMIN' && input.permissions !== undefined) {
    throw ApiError.badRequest('SUPER_ADMIN permissions cannot be modified');
  }

  const permissionIds =
    input.permissions !== undefined ? await resolvePermissionIds(input.permissions) : undefined;

  const role = await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
    });

    if (permissionIds !== undefined) {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }
    }

    return tx.role.findUniqueOrThrow({ where: { id }, select: roleSelect });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'roles.update',
    resource: 'roles',
    resourceId: role.id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return toRoleResponse(role);
};

export const deleteRole = async (id: string, actor: AuthUser, meta: RequestMeta) => {
  const role = await findRoleOrThrow(id);

  if (role.isSystem) {
    throw ApiError.badRequest('System roles cannot be deleted');
  }

  if (role._count.users > 0) {
    throw ApiError.badRequest('Cannot delete a role that has users assigned');
  }

  await prisma.role.delete({ where: { id } });

  await writeAuditLog({
    actorId: actor.id,
    action: 'roles.delete',
    resource: 'roles',
    resourceId: id,
    metadata: { name: role.name },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
