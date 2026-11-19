import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '@/config/constants';
import type { ResponseMeta } from '@/shared/utils/sendResponse';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const page = Math.max(DEFAULT_PAGE, toPositiveInt(query.page, DEFAULT_PAGE));
  const limit = Math.min(MAX_LIMIT, Math.max(1, toPositiveInt(query.limit, DEFAULT_LIMIT)));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
};

export const buildMeta = (total: number, page: number, limit: number): ResponseMeta => ({
  page,
  limit,
  total,
});
