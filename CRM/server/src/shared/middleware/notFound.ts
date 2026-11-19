import type { RequestHandler } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '@/shared/errors/ApiError';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`));
};
