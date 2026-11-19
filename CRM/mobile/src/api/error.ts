import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiErrorBody, NormalizedApiError } from '@/shared/types';

const statusMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'The request was invalid.';
    case 401:
      return 'Authentication required.';
    case 403:
      return 'You do not have permission to do that.';
    case 404:
      return 'We could not find that record.';
    case 409:
      return 'That action conflicts with existing data.';
    case 422:
      return 'Some fields need attention.';
    case 429:
      return 'Too many requests. Wait a moment and try again.';
    case 500:
      return 'The server ran into a problem. Try again.';
    default:
      return 'Something went wrong. Try again.';
  }
};

const isApiErrorBody = (value: unknown): value is ApiErrorBody =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  typeof (value as { message: unknown }).message === 'string';

export const normalizeApiError = (
  error: FetchBaseQueryError | SerializedError,
): NormalizedApiError => {
  if ('status' in error) {
    if (typeof error.status === 'number') {
      const body = error.data;
      return {
        status: error.status,
        message: isApiErrorBody(body) ? body.message : statusMessage(error.status),
        errors: isApiErrorBody(body) && Array.isArray(body.errors) ? body.errors : [],
        raw: error.data,
      };
    }

    if (error.status === 'FETCH_ERROR') {
      return {
        status: 'NETWORK',
        message: 'Cannot reach the server. Check your connection and try again.',
        errors: [],
        raw: error.error,
      };
    }

    if (error.status === 'TIMEOUT_ERROR') {
      return {
        status: 'NETWORK',
        message: 'The server took too long to respond. Try again.',
        errors: [],
        raw: error.error,
      };
    }

    return {
      status: 'NETWORK',
      message: error.error || 'Something went wrong. Try again.',
      errors: [],
      raw: error.error,
    };
  }

  return {
    status: 'NETWORK',
    message: error.message || 'Something went wrong. Try again.',
    errors: [],
    raw: error,
  };
};
