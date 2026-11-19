import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { parseDurationToMs } from '@/shared/utils/duration';
import {
  getRefreshTokenExpiry,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/modules/auth/auth.tokens';

export const authUserInclude = {
  role: {
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  },
} satisfies Prisma.UserInclude;

type UserWithRole = Prisma.UserGetPayload<{ include: typeof authUserInclude }>;

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: string;
  role: string;
  permissions: string[];
  customerId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface AuthResult extends TokenPair {
  user: PublicUser;
}

export interface PasswordResetResult {
  token: string;
  expiresAt: Date;
  email: string;
}

export const toAuthUser = (user: UserWithRole): AuthUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role.name,
  permissions: user.role.permissions.map(
    ({ permission }) => `${permission.resource}:${permission.action}`,
  ),
  customerId: user.customerId,
});

const toPublicUser = (user: UserWithRole): PublicUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  status: user.status,
  role: user.role.name,
  permissions: user.role.permissions
    .map(({ permission }) => `${permission.resource}:${permission.action}`)
    .sort(),
  customerId: user.customerId,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

const issueTokens = async (user: UserWithRole, meta: RequestMeta): Promise<TokenPair> => {
  const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role.name });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });
  const refreshTokenExpiresAt = getRefreshTokenExpiry();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
      createdByIp: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  return { accessToken, refreshToken, refreshTokenExpiresAt };
};

const findActiveUserById = async (id: string): Promise<UserWithRole> => {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null, status: 'ACTIVE' },
    include: authUserInclude,
  });

  if (!user) {
    throw ApiError.unauthorized('User is no longer active');
  }

  return user;
};

export const register = async (input: RegisterInput, meta: RequestMeta): Promise<AuthResult> => {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw ApiError.conflict('Email is already registered');
  }

  const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });

  if (!customerRole) {
    throw ApiError.internal('CUSTOMER role is not configured');
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      roleId: customerRole.id,
    },
    include: authUserInclude,
  });

  const tokens = await issueTokens(user, meta);

  await writeAuditLog({
    actorId: user.id,
    action: 'auth.register',
    resource: 'auth',
    resourceId: user.id,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return { user: toPublicUser(user), ...tokens };
};

export const login = async (input: LoginInput, meta: RequestMeta): Promise<AuthResult> => {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: authUserInclude,
  });

  const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

  if (!user || !passwordMatches || user.status !== 'ACTIVE') {
    await writeAuditLog({
      action: 'auth.login_failed',
      resource: 'auth',
      metadata: { email },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    throw ApiError.unauthorized('Invalid email or password');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = await issueTokens(user, meta);

  await writeAuditLog({
    actorId: user.id,
    action: 'auth.login',
    resource: 'auth',
    resourceId: user.id,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return { user: toPublicUser(user), ...tokens };
};

export const refresh = async (token: string, meta: RequestMeta): Promise<AuthResult> => {
  const payload = verifyRefreshToken(token);
  const tokenHash = hashToken(token);
  const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!storedToken || storedToken.userId !== payload.sub) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (storedToken.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedByIp: meta.ip ?? null },
    });

    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  if (storedToken.expiresAt <= new Date()) {
    throw ApiError.unauthorized('Refresh token has expired');
  }

  const user = await findActiveUserById(storedToken.userId);
  const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role.name });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });
  const refreshTokenExpiresAt = getRefreshTokenExpiry();
  const newTokenHash = hashToken(refreshToken);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
        revokedByIp: meta.ip ?? null,
        replacedByTokenHash: newTokenHash,
      },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
        createdByIp: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      },
    }),
  ]);

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
  };
};

export const logout = async (token: string, meta: RequestMeta): Promise<void> => {
  const tokenHash = hashToken(token);
  const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!storedToken) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: { id: storedToken.id, revokedAt: null },
    data: { revokedAt: new Date(), revokedByIp: meta.ip ?? null },
  });

  await writeAuditLog({
    actorId: storedToken.userId,
    action: 'auth.logout',
    resource: 'auth',
    resourceId: storedToken.userId,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};

export const logoutAll = async (userId: string, meta: RequestMeta): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date(), revokedByIp: meta.ip ?? null },
  });

  await writeAuditLog({
    actorId: userId,
    action: 'auth.logout_all',
    resource: 'auth',
    resourceId: userId,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};

export const forgotPassword = async (
  email: string,
  meta: RequestMeta,
): Promise<PasswordResetResult | null> => {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null, status: 'ACTIVE' },
  });

  if (!user) {
    return null;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.PASSWORD_RESET_EXPIRES_IN));

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    }),
  ]);

  await writeAuditLog({
    actorId: user.id,
    action: 'auth.forgot_password',
    resource: 'auth',
    resourceId: user.id,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return { token, expiresAt, email: user.email };
};

export const resetPassword = async (
  input: { token: string; password: string },
  meta: RequestMeta,
): Promise<void> => {
  const tokenHash = hashToken(input.token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.usedAt !== null ||
    resetToken.expiresAt <= new Date() ||
    resetToken.user.deletedAt !== null ||
    resetToken.user.status !== 'ACTIVE'
  ) {
    throw ApiError.badRequest('Invalid or expired password reset token');
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedByIp: meta.ip ?? null },
    }),
  ]);

  await writeAuditLog({
    actorId: resetToken.userId,
    action: 'auth.reset_password',
    resource: 'auth',
    resourceId: resetToken.userId,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};

export const changePassword = async (
  userId: string,
  input: { currentPassword: string; newPassword: string },
  meta: RequestMeta,
): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, status: 'ACTIVE' },
  });

  if (!user) {
    throw ApiError.unauthorized('User is no longer active');
  }

  const passwordMatches = await bcrypt.compare(input.currentPassword, user.passwordHash);

  if (!passwordMatches) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  if (input.currentPassword === input.newPassword) {
    throw ApiError.badRequest('New password must be different from the current password');
  }

  const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedByIp: meta.ip ?? null },
    }),
  ]);

  await writeAuditLog({
    actorId: userId,
    action: 'auth.change_password',
    resource: 'auth',
    resourceId: userId,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};

export const getMe = async (userId: string): Promise<PublicUser> => {
  const user = await findActiveUserById(userId);
  return toPublicUser(user);
};
