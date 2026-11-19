import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PURCHASE_ORDER_STATUS_OPTIONS,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from '@/features/purchase-orders/purchase-orders.types';
import { useListPurchaseOrdersQuery } from '@/features/purchase-orders/purchase-orders.api';
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

export const PurchaseOrdersListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListPurchaseOrdersQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as PurchaseOrderStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: 'order',
      header: 'Purchase order',
      sortable: true,
      sortKey: 'orderNumber',
      cell: (order) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{order.orderNumber}</p>
          <p className="truncate text-xs text-muted-foreground">
            {order.quotation?.quotationNumber ?? 'No quotation'}
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      hideBelow: 'lg',
      cell: (order) => <span className="text-sm">{order.customer?.name ?? '—'}</span>,
    },
    {
      id: 'supplier',
      header: 'Supplier',
      hideBelow: 'md',
      cell: (order) => <span className="text-sm">{order.supplier?.name ?? '—'}</span>,
    },
    {
      id: 'total',
      header: 'Total',
      sortable: true,
      sortKey: 'total',
      align: 'right',
      cell: (order) => (
        <span className="font-mono text-xs">{formatMoney(order.total, order.currency)}</span>
      ),
    },
    {
      id: 'expectedDeliveryDate',
      header: 'Delivery',
      sortable: true,
      sortKey: 'expectedDeliveryDate',
      hideBelow: 'lg',
      align: 'right',
      cell: (order) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(order.expectedDeliveryDate)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (order) => <StatusBadge status={order.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations pipeline"
        title="Purchase orders"
        description="Supplier orders created from approved quotations, tracked through production."
        actions={
          <Can resource="purchase_orders" action="create">
            <Button asChild>
              <Link to="/purchase-orders/new">
                <Plus className="size-4" />
                New purchase order
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(order) => order.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(order) => navigate(`/purchase-orders/${order.id}`)}
        emptyTitle={params.search || params.status ? 'No matching orders' : 'No purchase orders yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Approved quotations can be turned into supplier purchase orders.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search order number…"
              ariaLabel="Search purchase orders"
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
                {PURCHASE_ORDER_STATUS_OPTIONS.map((option) => (
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
