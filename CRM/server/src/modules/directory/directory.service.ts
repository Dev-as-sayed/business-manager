import bcrypt from 'bcrypt';
import { CustomerStatus, SupplierStatus, UserStatus, type Prisma } from '@prisma/client';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import type {
  CreateDirectoryUserInput,
  DirectoryRole,
  UpdateDirectoryUserInput,
} from '@/modules/directory/directory.types';

type AdminUser = Prisma.UserGetPayload<{ include: { role: true } }>;

const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] ?? name.trim();
  const lastName = parts.slice(1).join(' ') || firstName;

  return { firstName, lastName };
};

const serializeAdmin = (user: AdminUser) => ({
  _id: user.id,
  id: user.id,
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  phone: user.phone ?? '',
  address: '',
  avatar: null,
  role: 'admin',
  isActive: user.status === UserStatus.ACTIVE,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const serializeCustomer = (customer: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  _id: customer.id,
  id: customer.id,
  name: customer.name,
  email: customer.email ?? '',
  phone: customer.phone ?? '',
  address: customer.address ?? '',
  avatar: null,
  role: 'customer',
  isActive: customer.status === CustomerStatus.ACTIVE,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

const serializeSupplier = (supplier: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: SupplierStatus;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  _id: supplier.id,
  id: supplier.id,
  name: supplier.name,
  email: supplier.email ?? '',
  phone: supplier.phone ?? '',
  address: supplier.address ?? '',
  avatar: null,
  role: 'supplier',
  isActive: supplier.status === SupplierStatus.ACTIVE,
  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt,
});

const ensureEmailAvailable = async (
  email: string,
  exclude?: { type: DirectoryRole; id: string },
): Promise<void> => {
  const [user, customer, supplier] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.customer.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    }),
    prisma.supplier.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    }),
  ]);

  const userConflict = user && !(exclude?.type === 'ADMIN' && user.id === exclude.id);
  const customerConflict =
    customer && !(exclude?.type === 'CUSTOMER' && customer.id === exclude.id);
  const supplierConflict =
    supplier && !(exclude?.type === 'SUPPLIER' && supplier.id === exclude.id);

  if (userConflict || customerConflict || supplierConflict) {
    throw ApiError.conflict('Email is already registered');
  }
};

const findDirectoryEntity = async (id: string) => {
  const [customer, supplier, user] = await Promise.all([
    prisma.customer.findFirst({ where: { id, deletedAt: null } }),
    prisma.supplier.findFirst({ where: { id, deletedAt: null } }),
    prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
        role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      },
      include: { role: true },
    }),
  ]);

  if (customer) {
    return { type: 'CUSTOMER' as const, customer };
  }

  if (supplier) {
    return { type: 'SUPPLIER' as const, supplier };
  }

  if (user) {
    return { type: 'ADMIN' as const, user };
  }

  throw ApiError.notFound('User not found');
};

export const listDirectoryUsers = async (role: DirectoryRole) => {
  if (role === 'ADMIN') {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        role: { name: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(serializeAdmin);
  }

  if (role === 'CUSTOMER') {
    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return customers.map(serializeCustomer);
  }

  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  return suppliers.map(serializeSupplier);
};

export const createDirectoryUser = async (
  input: CreateDirectoryUserInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  await ensureEmailAvailable(input.email);

  if (input.role === 'ADMIN') {
    if (!input.password) {
      throw ApiError.badRequest('Password is required for admin users');
    }

    const role = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

    if (!role) {
      throw ApiError.internal('ADMIN role is not configured');
    }

    const { firstName, lastName } = splitName(input.name);
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName,
        lastName,
        phone: input.phone ?? null,
        roleId: role.id,
      },
      include: { role: true },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: 'directory.create',
      resource: 'users',
      resourceId: user.id,
      metadata: { role: 'admin', name: input.name, email: input.email },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return serializeAdmin(user);
  }

  if (input.role === 'CUSTOMER') {
    const customerRole = input.password
      ? await prisma.role.findUnique({ where: { name: 'CUSTOMER' } })
      : null;

    if (input.password && !customerRole) {
      throw ApiError.internal('CUSTOMER role is not configured');
    }

    const passwordHash = input.password
      ? await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS)
      : null;
    const { firstName, lastName } = splitName(input.name);

    const customer = await prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          address: input.address ?? null,
        },
      });

      if (passwordHash && customerRole) {
        await tx.user.create({
          data: {
            email: input.email,
            passwordHash,
            firstName,
            lastName,
            phone: input.phone ?? null,
            roleId: customerRole.id,
            customerId: created.id,
          },
        });
      }

      return created;
    });

    await writeAuditLog({
      actorId: actor.id,
      action: 'directory.create',
      resource: 'users',
      resourceId: customer.id,
      metadata: { role: 'customer', name: input.name, email: input.email },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return serializeCustomer(customer);
  }

  const supplier = await prisma.supplier.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      address: input.address ?? null,
    },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'directory.create',
    resource: 'users',
    resourceId: supplier.id,
    metadata: { role: 'supplier', name: input.name, email: input.email },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return serializeSupplier(supplier);
};

export const getDirectoryUser = async (id: string) => {
  const entity = await findDirectoryEntity(id);

  if (entity.type === 'CUSTOMER') {
    return serializeCustomer(entity.customer);
  }

  if (entity.type === 'SUPPLIER') {
    return serializeSupplier(entity.supplier);
  }

  return serializeAdmin(entity.user);
};

export const updateDirectoryUser = async (
  id: string,
  input: UpdateDirectoryUserInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  const entity = await findDirectoryEntity(id);

  if (entity.type === 'CUSTOMER') {
    if (input.email) {
      await ensureEmailAvailable(input.email, { type: 'CUSTOMER', id });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.email ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
      },
    });

    if (input.password) {
      const linkedUser = await prisma.user.findUnique({
        where: { customerId: id },
        select: { id: true },
      });

      if (linkedUser) {
        const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
        await prisma.user.update({
          where: { id: linkedUser.id },
          data: { passwordHash },
        });
      }
    }

    await writeAuditLog({
      actorId: actor.id,
      action: 'directory.update',
      resource: 'users',
      resourceId: customer.id,
      metadata: { role: 'customer', fields: Object.keys(input) },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return serializeCustomer(customer);
  }

  if (entity.type === 'SUPPLIER') {
    if (input.email) {
      await ensureEmailAvailable(input.email, { type: 'SUPPLIER', id });
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.email ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
      },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: 'directory.update',
      resource: 'users',
      resourceId: supplier.id,
      metadata: { role: 'supplier', fields: Object.keys(input) },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return serializeSupplier(supplier);
  }

  if (input.email) {
    await ensureEmailAvailable(input.email, { type: 'ADMIN', id });
  }

  const data: Prisma.UserUpdateInput = {
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
  };

  if (input.name) {
    const { firstName, lastName } = splitName(input.name);
    data.firstName = firstName;
    data.lastName = lastName;
  }

  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { role: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'directory.update',
    resource: 'users',
    resourceId: user.id,
    metadata: { role: 'admin', fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return serializeAdmin(user);
};

export const deleteDirectoryUser = async (id: string, actor: AuthUser, meta: RequestMeta) => {
  const entity = await findDirectoryEntity(id);

  if (entity.type === 'CUSTOMER') {
    await prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id },
        data: { deletedAt: new Date(), status: CustomerStatus.INACTIVE },
      });

      const linkedUsers = await tx.user.findMany({
        where: { customerId: id, deletedAt: null },
        select: { id: true },
      });
      const userIds = linkedUsers.map((user) => user.id);

      if (userIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: userIds } },
          data: { deletedAt: new Date(), status: UserStatus.INACTIVE },
        });
        await tx.refreshToken.updateMany({
          where: { userId: { in: userIds }, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    });

    await writeAuditLog({
      actorId: actor.id,
      action: 'directory.delete',
      resource: 'users',
      resourceId: entity.customer.id,
      metadata: { role: 'customer', name: entity.customer.name },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return;
  }

  if (entity.type === 'SUPPLIER') {
    await prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date(), status: SupplierStatus.INACTIVE },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: 'directory.delete',
      resource: 'users',
      resourceId: entity.supplier.id,
      metadata: { role: 'supplier', name: entity.supplier.name },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return;
  }

  if (entity.user.role.name === 'SUPER_ADMIN') {
    const otherSuperAdmins = await prisma.user.count({
      where: {
        id: { not: id },
        deletedAt: null,
        status: UserStatus.ACTIVE,
        role: { name: 'SUPER_ADMIN' },
      },
    });

    if (otherSuperAdmins === 0) {
      throw ApiError.badRequest('Cannot delete the last active super admin');
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: UserStatus.INACTIVE },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await writeAuditLog({
    actorId: actor.id,
    action: 'directory.delete',
    resource: 'users',
    resourceId: entity.user.id,
    metadata: { role: 'admin', email: entity.user.email },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
