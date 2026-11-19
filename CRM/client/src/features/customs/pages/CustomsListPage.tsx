import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CUSTOMS_STATUS_OPTIONS,
  type CustomsRecord,
  type CustomsStatus,
} from '@/features/customs/customs.types';
import { useListCustomsRecordsQuery } from '@/features/customs/customs.api';
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

export const CustomsListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListCustomsRecordsQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as CustomsStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<CustomsRecord>[] = [
    {
      id: 'record',
      header: 'Customs record',
      sortable: true,
      sortKey: 'recordNumber',
      cell: (record) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{record.recordNumber}</p>
          <p className="truncate text-xs text-muted-foreground">
            {record.declarationNumber || 'No declaration number'}
          </p>
        </div>
      ),
    },
    {
      id: 'shipment',
      header: 'Shipment',
      hideBelow: 'md',
      cell: (record) => (
        <span className="font-mono text-[11px]">
          {record.shipment?.shipmentNumber ?? '—'}
        </span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      hideBelow: 'lg',
      cell: (record) => <span className="text-sm">{record.customer?.name ?? '—'}</span>,
    },
    {
      id: 'country',
      header: 'Country',
      hideBelow: 'lg',
      cell: (record) => <span className="text-sm">{record.country || '—'}</span>,
    },
    {
      id: 'totalAmount',
      header: 'Duties & fees',
      align: 'right',
      sortable: true,
      sortKey: 'totalAmount',
      cell: (record) => (
        <span className="font-mono text-xs">
          {formatMoney(record.totalAmount, record.currency)}
        </span>
      ),
    },
    {
      id: 'clearanceDate',
      header: 'Clearance',
      sortable: true,
      sortKey: 'clearanceDate',
      align: 'right',
      hideBelow: 'sm',
      cell: (record) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(record.clearanceDate)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (record) => <StatusBadge status={record.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations pipeline"
        title="Customs"
        description="Declarations, duties and clearance status for every shipment."
        actions={
          <Can resource="customs" action="create">
            <Button asChild>
              <Link to="/customs/new">
                <Plus className="size-4" />
                New record
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(record) => record.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(record) => navigate(`/customs/${record.id}`)}
        emptyTitle={params.search || params.status ? 'No matching records' : 'No customs records yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Open a customs record against a shipment to track clearance.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search record, declaration or office…"
              ariaLabel="Search customs records"
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
                {CUSTOMS_STATUS_OPTIONS.map((option) => (
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
