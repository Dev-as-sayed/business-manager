import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SHIPMENT_STATUS_OPTIONS,
  type Shipment,
  type ShipmentStatus,
} from '@/features/shipments/shipments.types';
import { useListShipmentsQuery } from '@/features/shipments/shipments.api';
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

export const ShipmentsListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListShipmentsQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as ShipmentStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<Shipment>[] = [
    {
      id: 'shipment',
      header: 'Shipment',
      sortable: true,
      sortKey: 'shipmentNumber',
      cell: (shipment) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{shipment.shipmentNumber}</p>
          <p className="truncate text-xs text-muted-foreground">
            {shipment.carrier || 'No carrier'} · {shipment._count.items}{' '}
            {shipment._count.items === 1 ? 'line' : 'lines'}
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      hideBelow: 'lg',
      cell: (shipment) => <span className="text-sm">{shipment.customer?.name ?? '—'}</span>,
    },
    {
      id: 'route',
      header: 'Route',
      hideBelow: 'md',
      cell: (shipment) => (
        <span className="text-sm">
          {shipment.origin || '—'} → {shipment.destination || '—'}
        </span>
      ),
    },
    {
      id: 'tracking',
      header: 'Tracking',
      hideBelow: 'lg',
      cell: (shipment) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {shipment.trackingNumber || '—'}
        </span>
      ),
    },
    {
      id: 'estimatedDeliveryDate',
      header: 'ETA',
      sortable: true,
      sortKey: 'estimatedDeliveryDate',
      align: 'right',
      hideBelow: 'sm',
      cell: (shipment) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(shipment.estimatedDeliveryDate)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (shipment) => <StatusBadge status={shipment.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations pipeline"
        title="Shipments"
        description="Consolidated freight from approved purchase orders, with tracking and delivery dates."
        actions={
          <Can resource="shipments" action="create">
            <Button asChild>
              <Link to="/shipments/new">
                <Plus className="size-4" />
                New shipment
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(shipment) => shipment.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(shipment) => navigate(`/shipments/${shipment.id}`)}
        emptyTitle={params.search || params.status ? 'No matching shipments' : 'No shipments yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Book freight against approved or in-production purchase orders.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search shipment or tracking…"
              ariaLabel="Search shipments"
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
                {SHIPMENT_STATUS_OPTIONS.map((option) => (
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
