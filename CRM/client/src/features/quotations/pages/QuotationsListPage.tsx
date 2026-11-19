import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  QUOTATION_STATUS_OPTIONS,
  type Quotation,
  type QuotationStatus,
} from '@/features/quotations/quotations.types';
import { useListQuotationsQuery } from '@/features/quotations/quotations.api';
import { DataTable, type DataTableColumn } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { SearchInput } from '@/shared/components/search-input';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Can } from '@/shared/guards/Can';
import { useTableParams } from '@/shared/hooks/useTableParams';
import { formatDate, formatMoney } from '@/shared/utils/format';

export const QuotationsListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListQuotationsQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as QuotationStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<Quotation>[] = [
    {
      id: 'quotation',
      header: 'Quotation',
      sortable: true,
      sortKey: 'quotationNumber',
      cell: (quotation) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {quotation.productRequest?.title ?? quotation.quotationNumber}
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {quotation.quotationNumber}
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      hideBelow: 'md',
      cell: (quotation) => (
        <span className="text-sm">{quotation.customer?.name ?? '—'}</span>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      sortable: true,
      sortKey: 'total',
      align: 'right',
      cell: (quotation) => (
        <span className="font-mono text-xs">
          {formatMoney(quotation.total, quotation.currency)}
        </span>
      ),
    },
    {
      id: 'validUntil',
      header: 'Valid until',
      hideBelow: 'lg',
      align: 'right',
      cell: (quotation) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(quotation.validUntil)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (quotation) => <StatusBadge status={quotation.status} />,
    },
    {
      id: 'createdAt',
      header: 'Created',
      sortable: true,
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'sm',
      cell: (quotation) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(quotation.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sales pipeline"
        title="Quotations"
        description="Costed offers with service fees, freight and validity dates."
        actions={
          <Can resource="quotations" action="create">
            <Button asChild>
              <Link to="/quotations/new">
                <Plus className="size-4" />
                New quotation
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(quotation) => quotation.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(quotation) => navigate(`/quotations/${quotation.id}`)}
        emptyTitle={params.search || params.status ? 'No matching quotations' : 'No quotations yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Create a quotation from a product request under review.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search quotation number…"
              ariaLabel="Search quotations"
            />
            <Select
              value={(params.status as string) ?? 'ALL'}
              onValueChange={(value) => setFilter('status', value === 'ALL' ? undefined : value)}
            >
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {QUOTATION_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
};
