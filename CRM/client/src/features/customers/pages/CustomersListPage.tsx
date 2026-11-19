import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CUSTOMER_STATUS_OPTIONS,
  type Customer,
  type CustomerStatus,
} from '@/features/customers/customers.types';
import { useListCustomersQuery } from '@/features/customers/customers.api';
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
import { formatDate } from '@/shared/utils/format';

export const CustomersListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListCustomersQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as CustomerStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<Customer>[] = [
    {
      id: 'name',
      header: 'Customer',
      sortable: true,
      sortKey: 'name',
      cell: (customer) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{customer.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {customer.contactName || 'No contact named'}
          </p>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      hideBelow: 'md',
      cell: (customer) => (
        <div className="min-w-0 text-sm">
          <p className="truncate">{customer.email || '—'}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {customer.phone || '—'}
          </p>
        </div>
      ),
    },
    {
      id: 'region',
      header: 'Region',
      hideBelow: 'lg',
      cell: (customer) => (
        <span className="text-sm">
          {[customer.city, customer.country].filter(Boolean).join(', ') || '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (customer) => <StatusBadge status={customer.status} />,
    },
    {
      id: 'createdAt',
      header: 'Since',
      sortable: true,
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'sm',
      cell: (customer) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(customer.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Sales directory"
        title="Customers"
        description="Companies and buyers you quote for. Status changes are tracked on each record."
        actions={
          <Can resource="customers" action="create">
            <Button asChild>
              <Link to="/customers/new">
                <Plus className="size-4" />
                New customer
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(customer) => customer.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
        emptyTitle={params.search || params.status ? 'No matching customers' : 'No customers yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Add your first customer to start quoting.'
        }
        toolbar={
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput
                value={params.search}
                onChange={setSearch}
                placeholder="Search name, email, phone…"
                ariaLabel="Search customers"
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
                  {CUSTOMER_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {params.search || params.status ? (
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Filtered
              </p>
            ) : null}
          </>
        }
      />
    </div>
  );
};
