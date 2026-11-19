import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import httpStatus from 'http-status';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { ApiError, type ApiErrorDetail } from '@/shared/errors/ApiError';

interface ErrorBody {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
  stack?: string;
}

interface NormalizedError {
  statusCode: number;
  message: string;
  errors: ApiErrorDetail[];
  shouldLog: boolean;
}

const normalizeError = (error: unknown): NormalizedError => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors,
      shouldLog: !error.isOperational,
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        field: issue.path.map(String).join('.'),
        message: issue.message,
      })),
      shouldLog: false,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(', ')
          : String(error.meta?.target ?? 'field');

        return {
          statusCode: httpStatus.CONFLICT,
          message: 'A record with this value already exists',
          errors: [{ field: target, message: 'Must be unique' }],
          shouldLog: false,
        };
      }
      case 'P2025':
        return {
          statusCode: httpStatus.NOT_FOUND,
          message: 'Record not found',
          errors: [],
          shouldLog: false,
        };
      case 'P2003':
        return {
          statusCode: httpStatus.BAD_REQUEST,
          message: 'Related record constraint failed',
          errors: [],
          shouldLog: false,
        };
      default:
        return {
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
          errors: [],
          shouldLog: true,
        };
    }
  }

  if (
    error instanceof TokenExpiredError ||
    error instanceof JsonWebTokenError ||
    error instanceof NotBeforeError
  ) {
    return {
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Invalid or expired token',
      errors: [],
      shouldLog: false,
    };
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return {
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Invalid JSON payload',
      errors: [],
      shouldLog: false,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      errors: [],
      shouldLog: true,
    };
  }

  return {
    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    errors: [],
    shouldLog: true,
  };
};

export const globalErrorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const { statusCode, message, errors, shouldLog } = normalizeError(error);

  if (shouldLog) {
    (req.log ?? logger).error({ err: error, statusCode }, message);
  }

  const body: ErrorBody = {
    success: false,
    message,
    errors,
  };

  if (env.NODE_ENV !== 'production' && error instanceof Error && error.stack) {
    body.stack = error.stack;
  }

  res.status(statusCode).json(body);
};
