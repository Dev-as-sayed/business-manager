import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { ApiError } from '@/shared/errors/ApiError';
import { parseDurationToMs } from '@/shared/utils/duration';

const JWT_ISSUER = 'crm-api';
const JWT_AUDIENCE = 'crm-client';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  type: 'refresh';
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const verifyToken = (
  token: string,
  secret: string,
  expectedType: 'access' | 'refresh',
): Record<string, unknown> => {
  try {
    const payload = jwt.verify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (
      !isRecord(payload) ||
      payload.type !== expectedType ||
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      throw new Error('Invalid token payload');
    }

    if (expectedType === 'access' && typeof payload.role !== 'string') {
      throw new Error('Invalid access token payload');
    }

    return payload;
  } catch {
    throw ApiError.unauthorized(`Invalid or expired ${expectedType} token`);
  }
};

export const signAccessToken = (user: { id: string; email: string; role: string }): string =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role, type: 'access', jti: crypto.randomUUID() },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: Math.floor(parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN) / 1000),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    },
  );

export const signRefreshToken = (user: { id: string; email: string }): string =>
  jwt.sign(
    { sub: user.id, email: user.email, type: 'refresh', jti: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: Math.floor(parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN) / 1000),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    },
  );

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = verifyToken(token, env.JWT_ACCESS_SECRET, 'access');

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: payload.role as string,
    type: 'access',
  };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = verifyToken(token, env.JWT_REFRESH_SECRET, 'refresh');

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    type: 'refresh',
  };
};

export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const getRefreshTokenExpiry = (): Date =>
  new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));
