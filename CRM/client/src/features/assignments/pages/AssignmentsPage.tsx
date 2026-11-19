import { ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { selectAuthUser } from '@/features/auth/auth.slice';
import {
  PRODUCT_REQUEST_STATUS_OPTIONS,
  type ProductRequest,
  type ProductRequestStatus,
} from '@/features/product-requests/product-requests.types';
import { useListProductRequestsQuery } from '@/features/product-requests/product-requests.api';
import { useAppSelector } from '@/app/hooks';
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
import { useTableParams } from '@/shared/hooks/useTableParams';
import { formatDate } from '@/shared/utils/format';

export const AssignmentsPage = () => {
  const user = useAppSelector(selectAuthUser);
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListProductRequestsQuery(
    {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: (params.status as ProductRequestStatus | undefined) || undefined,
      assignedUserId: user?.id,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
    { skip: !user },
  );

  const columns: DataTableColumn<ProductRequest>[] = [
    {
      id: 'request',
      header: 'Request',
      sortable: true,
      sortKey: 'requestNumber',
      cell: (request) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{request.title}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {request.requestNumber}
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      hideBelow: 'md',
      cell: (request) => <span className="text-sm">{request.customer?.name ?? '—'}</span>,
    },
    {
      id: 'items',
      header: 'Lines',
      align: 'right',
      hideBelow: 'lg',
      cell: (request) => (
        <span className="font-mono text-xs">{request._count.items}</span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Assigned',
      align: 'right',
      sortable: true,
      sortKey: 'createdAt',
      hideBelow: 'sm',
      cell: (request) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(request.updatedAt)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (request) => <StatusBadge status={request.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="China operations"
        title="Assignments"
        description={`Product requests assigned to ${user ? `${user.firstName} ${user.lastName}` : 'you'}.`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/product-requests">
              All requests
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
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
        emptyTitle={params.search || params.status ? 'No matching assignments' : 'No assignments'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Requests assigned to you by the sales team will appear here.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search assignments…"
              ariaLabel="Search assignments"
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
