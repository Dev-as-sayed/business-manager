import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PRODUCT_REQUEST_STATUS_OPTIONS,
  type ProductRequest,
  type ProductRequestStatus,
} from '@/features/product-requests/product-requests.types';
import { useListProductRequestsQuery } from '@/features/product-requests/product-requests.api';
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
import { displayUserName, formatDate } from '@/shared/utils/format';

export const ProductRequestsListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListProductRequestsQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as ProductRequestStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<ProductRequest>[] = [
    {
      id: 'request',
      header: 'Request',
      sortable: true,
      sortKey: 'requestNumber',
      cell: (request) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{request.title}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {request.requestNumber}
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      hideBelow: 'md',
      cell: (request) => (
        <span className="text-sm">{request.customer?.name ?? '—'}</span>
      ),
    },
    {
      id: 'assignee',
      header: 'Assignee',
      hideBelow: 'lg',
      cell: (request) => (
        <span className="text-sm">
          {request.assignedUser ? displayUserName(request.assignedUser) : 'Unassigned'}
        </span>
      ),
    },
    {
      id: 'items',
      header: 'Lines',
      align: 'center',
      hideBelow: 'sm',
      cell: (request) => (
        <span className="font-mono text-xs">{request._count.items}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (request) => <StatusBadge status={request.status} />,
    },
    {
      id: 'createdAt',
      header: 'Created',
      sortable: true,
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'sm',
      cell: (request) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(request.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sales pipeline"
        title="Product requests"
        description="Sourcing briefs from customers, routed to China operations for costing."
        actions={
          <Can resource="product_requests" action="create">
            <Button asChild>
              <Link to="/product-requests/new">
                <Plus className="size-4" />
                New request
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(request) => request.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(request) => navigate(`/product-requests/${request.id}`)}
        emptyTitle={params.search || params.status ? 'No matching requests' : 'No product requests yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Capture a customer brief to start the sourcing flow.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search title or request number…"
              ariaLabel="Search product requests"
            />
            <Select
              value={(params.status as string) ?? 'ALL'}
              onValueChange={(value) => setFilter('status', value === 'ALL' ? undefined : value)}
            >
              <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {PRODUCT_REQUEST_STATUS_OPTIONS.map((option) => (
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
