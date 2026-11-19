import { ipKeyGenerator, rateLimit, type RateLimitExceededEventHandler } from 'express-rate-limit';
import httpStatus from 'http-status';
import type { Request } from 'express';
import { env } from '@/config/env';
import { ApiError } from '@/shared/errors/ApiError';

const rateLimitHandler: RateLimitExceededEventHandler = (_req, _res, next) => {
  next(new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many requests, please try again later.'));
};

const userOrIpKey = (req: Request): string => req.user?.id ?? ipKeyGenerator(req.ip ?? '');

const skipInTests = (): boolean => env.NODE_ENV === 'test';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: rateLimitHandler,
  skip: skipInTests,
});

export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: rateLimitHandler,
  skip: skipInTests,
});

export const uploadLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.UPLOAD_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: rateLimitHandler,
  skip: skipInTests,
});
