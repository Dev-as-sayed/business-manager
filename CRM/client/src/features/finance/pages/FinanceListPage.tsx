import { Download, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LEDGER_STATUS_OPTIONS,
  LEDGER_TYPE_OPTIONS,
  type LedgerEntry,
  type LedgerEntryStatus,
  type LedgerEntryType,
} from '@/features/finance/finance.types';
import { downloadLedgerCsv, useListLedgerEntriesQuery } from '@/features/finance/finance.api';
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
import { toastApiError } from '@/shared/utils/toast';

export const FinanceListPage = () => {
  const navigate = useNavigate();
  const { params, setSearch, setFilter, setSort, setPage, setLimit } = useTableParams();

  const queryArgs = {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    type: (params.type as LedgerEntryType | undefined) || undefined,
    status: (params.status as LedgerEntryStatus | undefined) || undefined,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  };

  const { data, isLoading, isFetching, error, refetch } = useListLedgerEntriesQuery(queryArgs);

  const handleExport = async () => {
    try {
      await downloadLedgerCsv({
        search: queryArgs.search,
        type: queryArgs.type,
        status: queryArgs.status,
      });
    } catch (exportError) {
      toastApiError(exportError);
    }
  };

  const columns: DataTableColumn<LedgerEntry>[] = [
    {
      id: 'entry',
      header: 'Entry',
      sortable: true,
      sortKey: 'entryNumber',
      cell: (entry) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{entry.type}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {entry.entryNumber}
          </p>
        </div>
      ),
    },
    {
      id: 'source',
      header: 'Source',
      hideBelow: 'md',
      cell: (entry) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px]">
            {entry.purchaseOrder?.orderNumber ?? entry.shipment?.shipmentNumber ?? '—'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {entry.customer?.name ?? entry.supplier?.name ?? '—'}
          </p>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      sortKey: 'amount',
      cell: (entry) => (
        <div className="text-right">
          <p className="font-mono text-xs">{formatMoney(entry.amount, entry.currency)}</p>
          <p className="font-mono text-[10px] text-muted-foreground">
            ≈ {formatMoney(entry.amountInBaseCurrency)}
          </p>
        </div>
      ),
    },
    {
      id: 'occurredAt',
      header: 'Occurred',
      align: 'right',
      sortable: true,
      sortKey: 'occurredAt',
      hideBelow: 'sm',
      cell: (entry) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDate(entry.occurredAt)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (entry) => <StatusBadge status={entry.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Accounts"
        title="Finance"
        description="Ledger entries for revenue, costs, payments, refunds and adjustments."
        actions={
          <>
            <Can resource="finance" action="export">
              <Button variant="outline" onClick={handleExport}>
                <Download className="size-4" />
                Export CSV
              </Button>
            </Can>
            <Can resource="finance" action="create">
              <Button asChild>
                <Link to="/finance/new">
                  <Plus className="size-4" />
                  New entry
                </Link>
              </Button>
            </Can>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        getRowId={(entry) => entry.id}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={refetch}
        meta={data?.meta}
        params={params}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRowClick={(entry) => navigate(`/finance/${entry.id}`)}
        emptyTitle={params.search || params.status ? 'No matching entries' : 'No ledger entries yet'}
        emptyDescription={
          params.search || params.status
            ? 'Try a different search or filter.'
            : 'Record revenue or costs against a purchase order or shipment.'
        }
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput
              value={params.search}
              onChange={setSearch}
              placeholder="Search entry, reference or party…"
              ariaLabel="Search ledger entries"
            />
            <Select
              value={(params.type as string) ?? 'ALL'}
              onValueChange={(value) => setFilter('type', value === 'ALL' ? undefined : value)}
            >
              <SelectTrigger className="w-full sm:w-36" aria-label="Filter by type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {LEDGER_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(params.status as string) ?? 'ALL'}
              onValueChange={(value) => setFilter('status', value === 'ALL' ? undefined : value)}
            >
              <SelectTrigger className="w-full sm:w-36" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {LEDGER_STATUS_OPTIONS.map((option) => (
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
