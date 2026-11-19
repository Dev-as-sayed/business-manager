import type { Request, Response } from 'express';
import { API_PREFIX } from '@/config/constants';
import { env } from '@/config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = `${API_PREFIX}/auth`;

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: REFRESH_COOKIE_PATH,
};

export const isMobileClient = (req: Request): boolean =>
  req.get('x-client')?.toLowerCase() === 'mobile';

export const setRefreshTokenCookie = (res: Response, token: string, expiresAt: Date): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, { ...baseCookieOptions, expires: expiresAt });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
};

export const getRefreshTokenFromRequest = (
  req: Request,
  bodyToken?: string,
): string | undefined => {
  if (bodyToken) {
    return bodyToken;
  }

  const cookieToken: unknown = req.cookies?.[REFRESH_COOKIE_NAME];
  return typeof cookieToken === 'string' ? cookieToken : undefined;
};
