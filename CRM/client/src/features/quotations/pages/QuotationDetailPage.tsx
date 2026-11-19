import { CheckCircle2, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  QUOTATION_TRANSITIONS,
  type QuotationStatus,
} from '@/features/quotations/quotations.types';
import {
  useApproveQuotationMutation,
  useDeleteQuotationMutation,
  useGetQuotationQuery,
  useUpdateQuotationStatusMutation,
} from '@/features/quotations/quotations.api';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
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

export const QuotationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quotation, isLoading, error, refetch } = useGetQuotationQuery(id ?? '', {
    skip: !id,
  });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateQuotationStatusMutation();
  const [approve, { isLoading: approving }] = useApproveQuotationMutation();
  const [deleteQuotation, { isLoading: deleting }] = useDeleteQuotationMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <SplashScreen label="Loading quotation…" />;
  if (error || !quotation) return <ErrorState error={error} onRetry={refetch} />;

  const currency = quotation.currency;
  const serviceRate = Number(quotation.serviceFeeRate) * 100;
  const canEdit = ['DRAFT', 'SENT'].includes(quotation.status);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({
        id,
        status: status as Exclude<QuotationStatus, 'APPROVED'>,
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

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteQuotation(id).unwrap();
      navigate('/quotations', { replace: true });
    } catch (deleteError) {
      toastApiError(deleteError);
      setConfirmOpen(false);
    }
  };

  const totals = [
    { label: 'Subtotal', value: formatMoney(quotation.subtotal, currency) },
    {
      label: `Service fee (${serviceRate.toFixed(2)}%)`,
      value: formatMoney(quotation.serviceFee, currency),
    },
    { label: 'Shipping', value: formatMoney(quotation.shippingFee, currency) },
    { label: 'Tax', value: formatMoney(quotation.tax, currency) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/quotations"
        backLabel="All quotations"
        eyebrow={quotation.quotationNumber}
        title={quotation.productRequest?.title ?? 'Quotation'}
        description={quotation.customer?.name ?? 'No customer linked'}
        actions={
          <>
            <StatusBadge status={quotation.status} />
            {quotation.status === 'SENT' ? (
              <Can resource="quotations" action="approve">
                <Button onClick={handleApprove} disabled={approving}>
                  <CheckCircle2 className="size-4" />
                  {approving ? 'Approving…' : 'Approve'}
                </Button>
              </Can>
            ) : null}
            {quotation.status === 'APPROVED' ? (
              <Can resource="purchase_orders" action="create">
                <Button asChild>
                  <Link to={`/purchase-orders/new?quotationId=${quotation.id}`}>
                    <PackagePlus className="size-4" />
                    Create purchase order
                  </Link>
                </Button>
              </Can>
            ) : null}
            <Can resource="quotations" action="update">
              {canEdit ? (
                <>
                  <StatusTransitionMenu
                    currentStatus={quotation.status}
                    transitions={QUOTATION_TRANSITIONS}
                    onSelect={handleStatusChange}
                    isLoading={updatingStatus}
                  />
                  <Button variant="outline" asChild>
                    <Link to={`/quotations/${quotation.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                </>
              ) : null}
            </Can>
            <Can resource="quotations" action="delete">
              {quotation.status === 'DRAFT' ? (
                <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              ) : null}
            </Can>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <DetailSection title="Offer">
            <DetailList
              items={[
                {
                  label: 'Product request',
                  value: quotation.productRequest ? (
                    <Link
                      className="underline decoration-border underline-offset-4 hover:text-accent"
                      to={`/product-requests/${quotation.productRequest.id}`}
                    >
                      {quotation.productRequest.requestNumber}
                    </Link>
                  ) : (
                    '—'
                  ),
                  mono: true,
                },
                { label: 'Customer', value: quotation.customer?.name ?? '—' },
                { label: 'Currency', value: currency, mono: true },
                { label: 'Valid until', value: formatDate(quotation.validUntil) },
                { label: 'Sent', value: quotation.sentAt ? formatDateTime(quotation.sentAt) : 'Not sent' },
                {
                  label: 'Approved',
                  value: quotation.approvedAt
                    ? `${formatDateTime(quotation.approvedAt)} · ${displayUserName(quotation.approvedBy)}`
                    : 'Not approved',
                },
                { label: 'Notes', value: quotation.notes || 'No notes.', span: 2 },
              ]}
            />
          </DetailSection>

          <DetailSection title={`Line items (${quotation.items?.length ?? quotation._count.items})`}>
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
                      Unit price
                    </th>
                    <th className="py-2 pl-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Line total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(quotation.items ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-border/70 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-medium">{item.name}</p>
                        {item.description ? (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs">{item.quantity}</td>
                      <td className="px-3 py-3 text-right font-mono text-xs">
                        {formatMoney(item.unitPrice, currency)}
                      </td>
                      <td className="py-3 pl-3 text-right font-mono text-xs">
                        {formatMoney(Number(item.unitPrice) * item.quantity, currency)}
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
              {totals.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono text-xs">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
                <span className="font-medium">Total</span>
                <span className="font-mono text-base font-semibold text-accent">
                  {formatMoney(quotation.total, currency)}
                </span>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Record">
            <DetailList
              items={[
                { label: 'Created by', value: displayUserName(quotation.createdBy) },
                { label: 'Created', value: formatDateTime(quotation.createdAt) },
                { label: 'Reference', value: quotation.id, mono: true, span: 2 },
              ]}
            />
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this quotation?"
        description="Only draft quotations can be removed. Purchase orders linked to it may block deletion."
        confirmLabel="Delete quotation"
        destructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
