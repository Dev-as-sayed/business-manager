import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  QC_STATUS_OPTIONS,
  type QcReport,
  type QcStatus,
} from '@/features/quality-control/quality-control.types';
import { useListQcReportsQuery } from '@/features/quality-control/quality-control.api';
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

export const QualityControlListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const { data, isLoading, isFetching, error, refetch } = useListQcReportsQuery({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: (params.status as QcStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const columns: DataTableColumn<QcReport>[] = [
    {
      id: 'report',
      header: 'Report',
      sortable: true,
      sortKey: 'reportNumber',
      cell: (report) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{report.reportNumber}</p>
          <p className="truncate text-xs text-muted-foreground">
            {report.purchaseOrder?.orderNumber ?? 'No purchase order'}
          </p>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      hideBelow: 'lg',
      cell: (report) => <span className="text-sm">{report.customer?.name ?? '—'}</span>,
    },
    {
      id: 'supplier',
      header: 'Supplier',
      hideBelow: 'md',
      cell: (report) => <span className="text-sm">{report.supplier?.name ?? '—'}</span>,
    },
    {
      id: 'inspector',
      header: 'Inspector',
      hideBelow: 'lg',
      cell: (report) => (
        <span className="text-sm">
          {report.inspector ? displayUserName(report.inspector) : 'Unassigned'}
        </span>
      ),
    },
    {
      id: 'inspectionDate',
      header: 'Inspection',
      sortable: true,
      sortKey: 'inspectionDate',
      hideBelow: 'sm',
      align: 'right',
      cell: (report) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(report.inspectionDate)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (report) => <StatusBadge status={report.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations pipeline"
        title="Quality control"
        description="Inspections on approved or in-production orders, with photo evidence."
        actions={
          <Can resource="quality_control" action="create">
            <Button asChild>
              <Link to="/quality-control/new">
                <Plus className="size-4" />
                New QC report
              </Link>
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(report) => report.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(report) => navigate(`/quality-control/${report.id}`)}
        emptyTitle={params.search || params.status ? 'No matching reports' : 'No QC reports yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or status filter.'
            : 'Create an inspection once a purchase order is approved or in production.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search report number…"
              ariaLabel="Search QC reports"
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
                {QC_STATUS_OPTIONS.map((option) => (
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
