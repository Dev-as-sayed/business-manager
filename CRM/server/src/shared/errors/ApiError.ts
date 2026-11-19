import httpStatus from 'http-status';

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: ApiErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: ApiErrorDetail[] = [],
    isOperational = true,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(httpStatus.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized', errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(httpStatus.UNAUTHORIZED, message, errors);
  }

  static forbidden(message = 'Forbidden', errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(httpStatus.FORBIDDEN, message, errors);
  }

  static notFound(message = 'Not found', errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(httpStatus.NOT_FOUND, message, errors);
  }

  static conflict(message = 'Conflict', errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(httpStatus.CONFLICT, message, errors);
  }

  static tooManyRequests(message = 'Too many requests', errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(httpStatus.TOO_MANY_REQUESTS, message, errors);
  }

  static internal(message = 'Internal server error', errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(httpStatus.INTERNAL_SERVER_ERROR, message, errors, false);
  }
}
