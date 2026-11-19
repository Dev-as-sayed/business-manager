import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SortOrder = 'asc' | 'desc';

export interface TableParams {
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  sortOrder: SortOrder;
  [key: string]: string | number | undefined;
}

interface UseTableParamsOptions {
  defaultLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: SortOrder;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const RESERVED_KEYS = new Set(['page', 'limit', 'search', 'sortBy', 'sortOrder']);

export const useTableParams = (options: UseTableParamsOptions = {}) => {
  const { defaultLimit = 20, defaultSortBy = 'createdAt', defaultSortOrder = 'desc' } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo<TableParams>(() => {
    const page = clamp(Number(searchParams.get('page') ?? 1) || 1, 1, 100000);
    const limit = clamp(Number(searchParams.get('limit') ?? defaultLimit) || defaultLimit, 1, 100);
    const sortOrderParam = searchParams.get('sortOrder');
    const sortOrder: SortOrder =
      sortOrderParam === 'asc' || sortOrderParam === 'desc' ? sortOrderParam : defaultSortOrder;
    const result: TableParams = {
      page,
      limit,
      search: searchParams.get('search') ?? '',
      sortBy: searchParams.get('sortBy') ?? defaultSortBy,
      sortOrder,
    };

    searchParams.forEach((value, key) => {
      if (!RESERVED_KEYS.has(key) && value !== '') {
        result[key] = value;
      }
    });

    return result;
  }, [searchParams, defaultLimit, defaultSortBy, defaultSortOrder]);

  const setParams = useCallback(
    (next: Partial<TableParams>, { resetPage = false }: { resetPage?: boolean } = {}) => {
      setSearchParams(
        (current) => {
          const updated = new URLSearchParams(current);

          for (const [key, value] of Object.entries(next)) {
            if (value === undefined || value === null || value === '') {
              updated.delete(key);
            } else {
              updated.set(key, String(value));
            }
          }

          if (resetPage) {
            updated.delete('page');
          }

          return updated;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearch = useCallback(
    (search: string) => setParams({ search }, { resetPage: true }),
    [setParams],
  );

  const setFilter = useCallback(
    (key: string, value: string | number | undefined) =>
      setParams({ [key]: value }, { resetPage: true }),
    [setParams],
  );

  const setSort = useCallback(
    (sortBy: string, sortOrder: SortOrder) =>
      setParams({ sortBy, sortOrder }, { resetPage: true }),
    [setParams],
  );

  const setPage = useCallback(
    (page: number) => setParams({ page }, { resetPage: false }),
    [setParams],
  );

  const setLimit = useCallback(
    (limit: number) => setParams({ limit }, { resetPage: true }),
    [setParams],
  );

  const reset = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  return {
    params,
    setParams,
    setSearch,
    setFilter,
    setSort,
    setPage,
    setLimit,
    reset,
  };
};
