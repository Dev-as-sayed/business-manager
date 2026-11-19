import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { Meta } from '@/shared/types';

interface PaginationProps {
  meta: Meta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isFetching?: boolean;
}

const PAGE_SIZES = [10, 20, 50, 100];

export const Pagination = ({ meta, onPageChange, onLimitChange, isFetching }: PaginationProps) => {
  const pageCount = Math.max(1, Math.ceil(meta.total / meta.limit));
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {from}–{to} of {meta.total}
        {isFetching ? <span className="ml-2 text-accent">syncing</span> : null}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Rows
          </span>
          <Select
            value={String(meta.limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="h-7 w-16 px-2 text-xs" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(meta.page - 1)}
            disabled={meta.page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-16 text-center font-mono text-[11px] text-muted-foreground">
            {meta.page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page >= pageCount}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
