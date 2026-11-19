import { CheckCircle2, ClipboardCheck, Pencil, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  PURCHASE_ORDER_TRANSITIONS,
  type PurchaseOrderStatus,
} from '@/features/purchase-orders/purchase-orders.types';
import {
  useApprovePurchaseOrderMutation,
  useGetPurchaseOrderQuery,
  useUpdatePurchaseOrderStatusMutation,
} from '@/features/purchase-orders/purchase-orders.api';
import { useGetPurchaseOrderProfitQuery } from '@/features/finance/finance.api';
import { AttachmentPanel } from '@/features/attachments/components/AttachmentPanel';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { ErrorState } from '@/shared/components/error-state';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { StatusBadge } from '@/shared/components/status-badge';
import { StatusTransitionMenu } from '@/shared/components/status-transition-menu';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import { displayUserName, formatDate, formatDateTime, formatMoney } from '@/shared/utils/format';
import { toastApiError } from '@/shared/utils/toast';

const OrderProfitSection = ({ purchaseOrderId }: { purchaseOrderId: string }) => {
  const { data: profit, isLoading } = useGetPurchaseOrderProfitQuery(purchaseOrderId);

  if (isLoading) {
    return (
      <DetailSection title="Profitability">
        <p className="text-sm text-muted-foreground">Loading approved ledger entries…</p>
      </DetailSection>
    );
  }

  if (!profit) return null;

  return (
    <DetailSection title="Profitability">
      {profit.entryCount === 0 ? (
        <p className="text-sm text-muted-foreground">
          No approved ledger entries are linked to this order yet.
        </p>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Revenue</span>
            <span className="font-mono text-xs">{formatMoney(profit.revenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Costs</span>
            <span className="font-mono text-xs">−{formatMoney(profit.costs)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Refunds</span>
            <span className="font-mono text-xs">−{formatMoney(profit.refunds)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Adjustments</span>
            <span className="font-mono text-xs">{formatMoney(profit.adjustments)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-medium">Profit ({profit.baseCurrency})</span>
            <span className="font-mono text-base font-semibold text-accent">
              {formatMoney(profit.profit)}
            </span>
          </div>
          <p className="pt-1 text-[11px] text-muted-foreground">
            Based on {profit.entryCount} approved {profit.entryCount === 1 ? 'entry' : 'entries'}.
          </p>
        </div>
      )}
    </DetailSection>
  );
};

export const PurchaseOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useGetPurchaseOrderQuery(id ?? '', {
    skip: !id,
  });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdatePurchaseOrderStatusMutation();
  const [approve, { isLoading: approving }] = useApprovePurchaseOrderMutation();

  if (isLoading) return <SplashScreen label="Loading purchase order…" />;
  if (error || !order) return <ErrorState error={error} onRetry={refetch} />;

  const currency = order.currency;
  const canEdit = ['DRAFT', 'PENDING_APPROVAL'].includes(order.status);
  const canInspect = ['IN_PRODUCTION', 'SHIPPED', 'COMPLETED'].includes(order.status);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({
        id,
        status: status as Exclude<PurchaseOrderStatus, 'APPROVED'>,
      }).unwrap();
    } catch (statusError) {
      toastApiError(statusError);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approve(id).unwrap();
    } catch (approveError) {
      toastApiError(approveError);
    }
  };

  const milestones = [
    { label: 'Submitted', value: order.submittedAt },
    { label: 'Approved', value: order.approvedAt },
    { label: 'Production', value: order.productionStartedAt },
    { label: 'Shipped', value: order.shippedAt },
    { label: 'Completed', value: order.completedAt },
  ].filter((milestone) => milestone.value);

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/purchase-orders"
        backLabel="All purchase orders"
        eyebrow={order.orderNumber}
        title={order.supplier?.name ?? 'Purchase order'}
        description={order.customer?.name ?? 'No customer linked'}
        actions={
          <>
            <StatusBadge status={order.status} />
            {order.status === 'PENDING_APPROVAL' ? (
              <Can resource="purchase_orders" action="approve">
                <Button onClick={handleApprove} disabled={approving}>
                  <CheckCircle2 className="size-4" />
                  {approving ? 'Approving…' : 'Approve'}
                </Button>
              </Can>
            ) : null}
            {canInspect ? (
              <>
                <Can resource="quality_control" action="create">
                  <Button variant="outline" asChild>
                    <Link to={`/quality-control/new?purchaseOrderId=${order.id}`}>
                      <ClipboardCheck className="size-4" />
                      QC report
                    </Link>
                  </Button>
                </Can>
                <Can resource="shipments" action="create">
                  <Button variant="outline" asChild>
                    <Link to={`/shipments/new?purchaseOrderId=${order.id}`}>
                      <Truck className="size-4" />
                      Shipment
                    </Link>
                  </Button>
                </Can>
              </>
            ) : null}
            <Can resource="purchase_orders" action="update">
              {canEdit ? (
                <>
                  <StatusTransitionMenu
                    currentStatus={order.status}
                    transitions={PURCHASE_ORDER_TRANSITIONS}
                    onSelect={handleStatusChange}
                    isLoading={updatingStatus}
                  />
                  <Button variant="outline" asChild>
                    <Link to={`/purchase-orders/${order.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                </>
              ) : null}
            </Can>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <DetailSection title="Order">
            <DetailList
              items={[
                {
                  label: 'Quotation',
                  value: order.quotation ? (
                    <Link
                      className="underline decoration-border underline-offset-4 hover:text-accent"
                      to={`/quotations/${order.quotation.id}`}
                    >
                      {order.quotation.quotationNumber}
                    </Link>
                  ) : (
                    '—'
                  ),
                  mono: true,
                },
                { label: 'Supplier', value: order.supplier?.name ?? '—' },
                { label: 'Customer', value: order.customer?.name ?? '—' },
                { label: 'Currency', value: currency, mono: true },
                { label: 'Expected delivery', value: formatDate(order.expectedDeliveryDate) },
                { label: 'Created', value: formatDateTime(order.createdAt) },
                { label: 'Notes', value: order.notes || 'No notes.', span: 2 },
              ]}
            />
          </DetailSection>

          <AttachmentPanel entityType="purchase_order" entityId={order.id} />

          <DetailSection title={`Line items (${order.items?.length ?? order._count.items})`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Item
                    </th>
                    <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Unit cost
                    </th>
                    <th className="py-2 pl-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Line total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-border/70 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-medium">{item.name}</p>
                        {item.description ? (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs">{item.quantity}</td>
                      <td className="px-3 py-3 text-right font-mono text-xs">
                        {formatMoney(item.unitCost, currency)}
                      </td>
                      <td className="py-3 pl-3 text-right font-mono text-xs">
                        {formatMoney(item.total, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Totals">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono text-xs">{formatMoney(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono text-xs">
                  {formatMoney(order.shippingFee, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono text-xs">{formatMoney(order.tax, currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-medium">Total</span>
                <span className="font-mono text-base font-semibold text-accent">
                  {formatMoney(order.total, currency)}
                </span>
              </div>
            </div>
          </DetailSection>

          <Can resource="finance" action="read">
            <OrderProfitSection purchaseOrderId={order.id} />
          </Can>

          <DetailSection title="Milestones">
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No milestones recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {milestones.map((milestone) => (
                  <div key={milestone.label} className="flex items-start justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{milestone.label}</span>
                    <span className="text-right font-mono text-[11px]">
                      {formatDateTime(milestone.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>

          <DetailSection title="Record">
            <DetailList
              items={[
                { label: 'Created by', value: displayUserName(order.createdBy) },
                { label: 'Approved by', value: displayUserName(order.approvedBy) },
                { label: 'Reference', value: order.id, mono: true, span: 2 },
              ]}
            />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};
