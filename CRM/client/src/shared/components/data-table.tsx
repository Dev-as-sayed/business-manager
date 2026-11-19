import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/shared/components/empty-state';
import { ErrorState } from '@/shared/components/error-state';
import { Pagination } from '@/shared/components/pagination';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { SortOrder, TableParams } from '@/shared/hooks/useTableParams';
import type { Meta } from '@/shared/types';
import { cn } from '@/shared/utils/cn';

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  sortKey?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  isLoading: boolean;
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  meta?: Meta;
  params: TableParams;
  onSort?: (sortBy: string, sortOrder: SortOrder) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

const hideClasses = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
} as const;

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export const DataTable = <T,>({
  columns,
  rows,
  getRowId,
  isLoading,
  isFetching,
  error,
  onRetry,
  meta,
  params,
  onSort,
  onPageChange,
  onLimitChange,
  onRowClick,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Records will appear here once they are created.',
  emptyAction,
  toolbar,
  className,
}: DataTableProps<T>) => {
  const colSpan = columns.length;
  const showEmpty = !isLoading && !error && (rows?.length ?? 0) === 0;
  const showRows = !isLoading && !error && (rows?.length ?? 0) > 0;

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable || !column.sortKey || !onSort) return;
    const key = column.sortKey;
    const nextOrder: SortOrder =
      params.sortBy === key && params.sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, nextOrder);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
        className,
      )}
    >
      {toolbar ? (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {toolbar}
        </div>
      ) : null}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((column) => {
                const isSorted = column.sortKey && params.sortBy === column.sortKey;
                const SortIcon = isSorted
                  ? params.sortOrder === 'asc'
                    ? ArrowUp
                    : ArrowDown
                  : ArrowUpDown;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn(
                      'whitespace-nowrap px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground',
                      alignClasses[column.align ?? 'left'],
                      column.hideBelow ? hideClasses[column.hideBelow] : '',
                      column.headerClassName,
                    )}
                  >
                    {column.sortable && column.sortKey ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column)}
                        className={cn(
                          'inline-flex items-center gap-1.5 uppercase tracking-[0.14em] transition-colors hover:text-foreground',
                          isSorted && 'text-foreground',
                        )}
                      >
                        {column.header}
                        <SortIcon className="size-3" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} className="border-b border-border/70">
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'px-4 py-3',
                          column.hideBelow ? hideClasses[column.hideBelow] : '',
                        )}
                      >
                        <Skeleton className="h-4 w-full max-w-40" />
                      </td>
                    ))}
                  </tr>
                ))
              : null}

            {showRows
              ? rows?.map((row) => (
                  <tr
                    key={getRowId(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    className={cn(
                      'border-b border-border/70 transition-colors last:border-b-0',
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          'px-4 py-3 align-middle',
                          alignClasses[column.align ?? 'left'],
                          column.hideBelow ? hideClasses[column.hideBelow] : '',
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))
              : null}

            {error ? (
              <tr>
                <td colSpan={colSpan}>
                  <ErrorState error={error} onRetry={onRetry} />
                </td>
              </tr>
            ) : null}

            {showEmpty ? (
              <tr>
                <td colSpan={colSpan}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {meta && onPageChange && onLimitChange ? (
        <Pagination
          meta={meta}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          isFetching={isFetching}
        />
      ) : null}
    </div>
  );
};
