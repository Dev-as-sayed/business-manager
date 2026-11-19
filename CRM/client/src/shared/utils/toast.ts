import { toast } from 'sonner';
import { isNormalizedApiError, type NormalizedApiError } from '@/shared/types';

export const toastSuccess = (message: string): void => {
  toast.success(message);
};

export const toastError = (message: string): void => {
  toast.error(message);
};

export const toastApiError = (
  error: unknown,
  fallback = 'Something went wrong. Try again.',
): void => {
  if (isNormalizedApiError(error)) {
    if (error.status === 403 || error.status === 429) return;
    toast.error(error.message || fallback);
    return;
  }

  if (error instanceof Error && error.message) {
    toast.error(error.message);
    return;
  }

  toast.error(fallback);
};

export const applyServerFieldErrors = <TField extends string>(
  error: unknown,
  setError: (field: TField, error: { type: string; message: string }) => void,
): boolean => {
  if (!isNormalizedApiError(error) || error.errors.length === 0) return false;

  for (const detail of error.errors) {
    setError(detail.field as TField, { type: 'server', message: detail.message });
  }

  return true;
};

export const getErrorMessage = (
  error: unknown,
  fallback = 'Unable to load this data.',
): string => {
  if (isNormalizedApiError(error)) return error.message || fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export type { NormalizedApiError };
