import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SUPPLIER_STATUS_OPTIONS,
  type Supplier,
  type SupplierStatus,
} from '@/features/suppliers/suppliers.types';
import { useListSuppliersQuery } from '@/features/suppliers/suppliers.api';
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

export const SuppliersListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListSuppliersQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as SupplierStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<Supplier>[] = [
    {
      id: 'name',
      header: 'Supplier',
      sortable: true,
      sortKey: 'name',
      cell: (supplier) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{supplier.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {supplier.contactName || 'No contact named'}
          </p>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      hideBelow: 'md',
      cell: (supplier) => (
        <div className="min-w-0 text-sm">
          <p className="truncate">{supplier.email || '—'}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {supplier.phone || '—'}
          </p>
        </div>
      ),
    },
    {
      id: 'region',
      header: 'Region',
      hideBelow: 'lg',
      cell: (supplier) => (
        <span className="text-sm">
          {[supplier.city, supplier.country].filter(Boolean).join(', ') || '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (supplier) => <StatusBadge status={supplier.status} />,
    },
    {
      id: 'createdAt',
      header: 'Since',
      sortable: true,
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'sm',
      cell: (supplier) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(supplier.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations directory"
        title="Suppliers"
        description="Factories and trading partners used for sourcing, production and inspection."
        actions={
          <Can resource="suppliers" action="create">
            <Button asChild>
              <Link to="/suppliers/new">
                <Plus className="size-4" />
                New supplier
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(supplier) => supplier.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(supplier) => navigate(`/suppliers/${supplier.id}`)}
        emptyTitle={params.search || params.status ? 'No matching suppliers' : 'No suppliers yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Add your first supplier to start purchase orders.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search name, email, phone…"
              ariaLabel="Search suppliers"
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
                {SUPPLIER_STATUS_OPTIONS.map((option) => (
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
