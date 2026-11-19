import {
  ArrowUpRight,
  ClipboardList,
  Factory,
  FileText,
  Plus,
  Stamp,
  Truck,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/features/auth/auth.slice';
import { useListCustomsRecordsQuery } from '@/features/customs/customs.api';
import { useListLedgerEntriesQuery } from '@/features/finance/finance.api';
import { useListProductRequestsQuery } from '@/features/product-requests/product-requests.api';
import { useListPurchaseOrdersQuery } from '@/features/purchase-orders/purchase-orders.api';
import { useListQuotationsQuery } from '@/features/quotations/quotations.api';
import { useListShipmentsQuery } from '@/features/shipments/shipments.api';
import { EmptyState } from '@/shared/components/empty-state';
import { PageHeader } from '@/shared/components/page-header';
import { StatCard } from '@/shared/components/stat-card';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Can } from '@/shared/guards/Can';
import { usePermission } from '@/shared/hooks/usePermission';
import { formatDate, formatMoney } from '@/shared/utils/format';

export const DashboardPage = () => {
  const user = useAppSelector(selectAuthUser);
  const { can } = usePermission();

  const canReadRequests = can('product_requests', 'read');
  const canReadQuotations = can('quotations', 'read');
  const canReadOrders = can('purchase_orders', 'read');
  const canReadShipments = can('shipments', 'read');
  const canReadCustoms = can('customs', 'read');
  const canReadFinance = can('finance', 'read');

  const openRequests = useListProductRequestsQuery(
    { limit: 1, status: 'SUBMITTED' },
    { skip: !canReadRequests },
  );
  const recentRequests = useListProductRequestsQuery(
    { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' },
    { skip: !canReadRequests },
  );
  const pendingQuotations = useListQuotationsQuery(
    { limit: 1, status: 'SENT' },
    { skip: !canReadQuotations },
  );
  const recentQuotations = useListQuotationsQuery(
    { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' },
    { skip: !canReadQuotations },
  );
  const productionOrders = useListPurchaseOrdersQuery(
    { limit: 1, status: 'IN_PRODUCTION' },
    { skip: !canReadOrders },
  );
  const pendingApprovals = useListPurchaseOrdersQuery(
    { limit: 1, status: 'PENDING_APPROVAL' },
    { skip: !canReadOrders },
  );
  const inTransitShipments = useListShipmentsQuery(
    { limit: 1, status: 'IN_TRANSIT' },
    { skip: !canReadShipments },
  );
  const pendingCustoms = useListCustomsRecordsQuery(
    { limit: 1, status: 'PENDING' },
    { skip: !canReadCustoms },
  );
  const pendingLedger = useListLedgerEntriesQuery(
    { limit: 1, status: 'PENDING' },
    { skip: !canReadFinance },
  );

  interface DashboardStat {
    label: string;
    value: string | number;
    icon: LucideIcon;
    hint: string;
    to: string;
    accent?: boolean;
  }

  const stats: DashboardStat[] = [
    ...(canReadRequests
      ? [
          {
            label: 'Open requests',
            value: openRequests.data?.meta.total ?? '—',
            icon: ClipboardList,
            hint: 'Submitted product enquiries',
            to: '/product-requests?status=SUBMITTED',
          },
        ]
      : []),
    ...(canReadQuotations
      ? [
          {
            label: 'Quotes with clients',
            value: pendingQuotations.data?.meta.total ?? '—',
            icon: FileText,
            hint: 'Sent, awaiting response',
            to: '/quotations?status=SENT',
          },
        ]
      : []),
    ...(canReadOrders
      ? [
          {
            label: 'In production',
            value: productionOrders.data?.meta.total ?? '—',
            icon: Factory,
            hint: `${pendingApprovals.data?.meta.total ?? 0} awaiting approval`,
            to: '/purchase-orders?status=IN_PRODUCTION',
          },
        ]
      : []),
    ...(canReadShipments
      ? [
          {
            label: 'In transit',
            value: inTransitShipments.data?.meta.total ?? '—',
            icon: Truck,
            hint: 'Freight on the water',
            to: '/shipments?status=IN_TRANSIT',
          },
        ]
      : []),
    ...(canReadCustoms
      ? [
          {
            label: 'Customs pending',
            value: pendingCustoms.data?.meta.total ?? '—',
            icon: Stamp,
            hint: 'Declarations to clear',
            to: '/customs?status=PENDING',
          },
        ]
      : []),
    ...(canReadFinance
      ? [
          {
            label: 'Unapproved entries',
            value: pendingLedger.data?.meta.total ?? '—',
            icon: Wallet,
            hint: 'Pending ledger entries',
            to: '/finance?status=PENDING',
            accent: true,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDate(new Date())}
        title={`Good to see you, ${user?.firstName ?? 'there'}.`}
        description="A live read of the sourcing desk — enquiries, quotes, production, freight and money."
        actions={
          <>
            <Can resource="product_requests" action="create">
              <Button variant="outline" asChild>
                <Link to="/product-requests/new">
                  <Plus className="size-4" />
                  Request
                </Link>
              </Button>
            </Can>
            <Can resource="quotations" action="create">
              <Button asChild>
                <Link to="/quotations/new">
                  <FileText className="size-4" />
                  Quotation
                </Link>
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="block transition-transform hover:-translate-y-0.5">
            <StatCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              hint={stat.hint}
              accent={stat.accent}
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {canReadRequests ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Latest requests
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/product-requests">
                  View all
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentRequests.data?.items.length ? (
                <ul className="divide-y divide-border">
                  {recentRequests.data.items.map((request) => (
                    <li key={request.id}>
                      <Link
                        to={`/product-requests/${request.id}`}
                        className="flex items-center gap-3 py-2.5 transition-colors hover:text-accent"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{request.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {request.customer?.name ?? 'No customer'} · {request.requestNumber}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No requests yet"
                  description="New product enquiries will appear here."
                />
              )}
            </CardContent>
          </Card>
        ) : null}

        {canReadQuotations ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Latest quotations
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/quotations">
                  View all
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentQuotations.data?.items.length ? (
                <ul className="divide-y divide-border">
                  {recentQuotations.data.items.map((quotation) => (
                    <li key={quotation.id}>
                      <Link
                        to={`/quotations/${quotation.id}`}
                        className="flex items-center gap-3 py-2.5 transition-colors hover:text-accent"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs">
                            {quotation.quotationNumber}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {quotation.customer?.name ?? 'No customer'}
                          </p>
                        </div>
                        <span className="font-mono text-xs">
                          {formatMoney(quotation.total, quotation.currency)}
                        </span>
                        <StatusBadge status={quotation.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No quotations yet"
                  description="Quotes created from requests will appear here."
                />
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};
