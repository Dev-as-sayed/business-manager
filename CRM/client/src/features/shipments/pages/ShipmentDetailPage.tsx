import { Pencil, Stamp } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  SHIPMENT_TRANSITIONS,
  type ShipmentStatus,
} from '@/features/shipments/shipments.types';
import {
  useGetShipmentQuery,
  useUpdateShipmentStatusMutation,
} from '@/features/shipments/shipments.api';
import { AttachmentPanel } from '@/features/attachments/components/AttachmentPanel';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { ErrorState } from '@/shared/components/error-state';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { StatusBadge } from '@/shared/components/status-badge';
import { StatusTransitionMenu } from '@/shared/components/status-transition-menu';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import { displayUserName, formatDate, formatDateTime } from '@/shared/utils/format';
import { toastApiError } from '@/shared/utils/toast';

export const ShipmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: shipment, isLoading, error, refetch } = useGetShipmentQuery(id ?? '', {
    skip: !id,
  });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateShipmentStatusMutation();

  if (isLoading) return <SplashScreen label="Loading shipment…" />;
  if (error || !shipment) return <ErrorState error={error} onRetry={refetch} />;

  const canEdit = ['PENDING', 'PREPARING'].includes(shipment.status);
  const canCustoms = shipment.status !== 'CANCELLED';

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({ id, status: status as ShipmentStatus }).unwrap();
    } catch (statusError) {
      toastApiError(statusError);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/shipments"
        backLabel="All shipments"
        eyebrow={shipment.shipmentNumber}
        title={shipment.customer?.name ?? 'Shipment'}
        description={[shipment.origin, shipment.destination].filter(Boolean).join(' → ') || undefined}
        actions={
          <>
            <StatusBadge status={shipment.status} />
            {canCustoms ? (
              <Can resource="customs" action="create">
                <Button variant="outline" asChild>
                  <Link to={`/customs/new?shipmentId=${shipment.id}`}>
                    <Stamp className="size-4" />
                    Customs record
                  </Link>
                </Button>
              </Can>
            ) : null}
            <Can resource="shipments" action="update">
              {canEdit ? (
                <>
                  <StatusTransitionMenu
                    currentStatus={shipment.status}
                    transitions={SHIPMENT_TRANSITIONS}
                    onSelect={handleStatusChange}
                    isLoading={updatingStatus}
                  />
                  <Button variant="outline" asChild>
                    <Link to={`/shipments/${shipment.id}/edit`}>
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
          <DetailSection title="Freight">
            <DetailList
              items={[
                { label: 'Carrier', value: shipment.carrier || '—' },
                { label: 'Tracking number', value: shipment.trackingNumber || '—', mono: true },
                { label: 'Method', value: shipment.shippingMethod || '—' },
                { label: 'Customer', value: shipment.customer?.name ?? '—' },
                { label: 'Origin', value: shipment.origin || '—' },
                { label: 'Destination', value: shipment.destination || '—' },
                { label: 'Estimated delivery', value: formatDate(shipment.estimatedDeliveryDate) },
                { label: 'Actual delivery', value: formatDate(shipment.actualDeliveryDate) },
                { label: 'Notes', value: shipment.notes || 'No notes.', span: 2 },
              ]}
            />
          </DetailSection>

          <AttachmentPanel entityType="shipment" entityId={shipment.id} />

          <DetailSection title={`Items (${shipment.items?.length ?? shipment._count.items})`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Item
                    </th>
                    <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Purchase order
                    </th>
                    <th className="py-2 pl-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Shipped qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(shipment.items ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-border/70 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-medium">{item.purchaseOrderItem.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.purchaseOrderItem.purchaseOrder.supplier?.name ?? '—'}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          to={`/purchase-orders/${item.purchaseOrderItem.purchaseOrderId}`}
                          className="font-mono text-[11px] underline decoration-border underline-offset-4 hover:text-accent"
                        >
                          {item.purchaseOrderItem.purchaseOrder.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 pl-3 text-right font-mono text-xs">
                        {item.quantity} / {item.purchaseOrderItem.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Milestones">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono text-[11px]">{formatDateTime(shipment.createdAt)}</span>
              </div>
              {shipment.shippedAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Shipped</span>
                  <span className="font-mono text-[11px]">{formatDateTime(shipment.shippedAt)}</span>
                </div>
              ) : null}
              {shipment.deliveredAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-mono text-[11px]">
                    {formatDateTime(shipment.deliveredAt)}
                  </span>
                </div>
              ) : null}
              {shipment.cancelledAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="font-mono text-[11px]">
                    {formatDateTime(shipment.cancelledAt)}
                  </span>
                </div>
              ) : null}
            </div>
          </DetailSection>

          <DetailSection title="Record">
            <DetailList
              items={[
                { label: 'Created by', value: displayUserName(shipment.createdBy) },
                { label: 'Reference', value: shipment.id, mono: true, span: 2 },
              ]}
            />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};
