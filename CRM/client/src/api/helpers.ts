import { toast } from 'sonner';
import type { ApiEnvelope, Meta, Paginated } from '@/shared/types';

export const unwrap = <T>(response: unknown): T => (response as ApiEnvelope<T>).data;

export const unwrapList = <T>(response: unknown): Paginated<T> => {
  const envelope = response as ApiEnvelope<T[]>;

  return {
    items: envelope.data,
    meta: envelope.meta ?? {
      page: 1,
      limit: envelope.data.length,
      total: envelope.data.length,
    },
  };
};

export const withSuccessToast =
  <T>() =>
  (response: unknown): T => {
    const envelope = response as ApiEnvelope<T>;

    if (envelope.message) toast.success(envelope.message);
    return envelope.data;
  };

export const emptyMeta = (): Meta => ({ page: 1, limit: 20, total: 0 });

export const buildQuery = (params: Record<string, unknown>): string => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
};
