import type { Response } from 'express';
import httpStatus from 'http-status';

export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SendResponseOptions<T> {
  statusCode?: number;
  message?: string;
  data: T;
  meta?: ResponseMeta;
}

export const sendResponse = <T>(res: Response, options: SendResponseOptions<T>): Response => {
  const { statusCode = httpStatus.OK, message = 'Success', data, meta } = options;

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};
