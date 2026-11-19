import { Ban, Check, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useApproveLedgerEntryMutation,
  useGetLedgerEntryQuery,
  useVoidLedgerEntryMutation,
} from '@/features/finance/finance.api';
import { AttachmentPanel } from '@/features/attachments/components/AttachmentPanel';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { ErrorState } from '@/shared/components/error-state';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import {
  displayUserName,
  formatDate,
  formatDateTime,
  formatMoney,
} from '@/shared/utils/format';
import { toastApiError } from '@/shared/utils/toast';

export const FinanceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [confirmVoid, setConfirmVoid] = useState(false);
  const { data: entry, isLoading, error, refetch } = useGetLedgerEntryQuery(id ?? '', {
    skip: !id,
  });
  const [approveEntry, { isLoading: approving }] = useApproveLedgerEntryMutation();
  const [voidEntry, { isLoading: voiding }] = useVoidLedgerEntryMutation();

  if (isLoading) return <SplashScreen label="Loading ledger entry…" />;
  if (error || !entry) return <ErrorState error={error} onRetry={refetch} />;

  const isPending = entry.status === 'PENDING';

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveEntry(id).unwrap();
    } catch (approveError) {
      toastApiError(approveError);
    }
  };

  const handleVoid = async () => {
    if (!id) return;
    try {
      await voidEntry(id).unwrap();
      setConfirmVoid(false);
    } catch (voidError) {
      toastApiError(voidError);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/finance"
        backLabel="Back to finance"
        eyebrow={entry.entryNumber}
        title={entry.customer?.name ?? 'Ledger entry'}
        description={entry.description || 'No description'}
        actions={
          <>
            <StatusBadge status={entry.status} />
            {isPending ? (
              <>
                <Can resource="finance" action="update">
                  <Button variant="outline" asChild>
                    <Link to={`/finance/${entry.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                </Can>
                <Can resource="finance" action="approve">
                  <Button onClick={handleApprove} disabled={approving}>
                    <Check className="size-4" />
                    {approving ? 'Approving…' : 'Approve'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmVoid(true)}
                  >
                    <Ban className="size-4" />
                    Void
                  </Button>
                </Can>
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <DetailSection title="Ledger entry">
            <DetailList
              items={[
                { label: 'Type', value: <StatusBadge status={entry.type} /> },
                { label: 'Status', value: <StatusBadge status={entry.status} /> },
                { label: 'Amount', value: formatMoney(entry.amount, entry.currency), mono: true },
                { label: 'Currency', value: entry.currency, mono: true },
                { label: 'Exchange rate', value: String(entry.exchangeRate), mono: true },
                {
                  label: 'Amount in base currency',
                  value: formatMoney(entry.amountInBaseCurrency),
                  mono: true,
                },
                { label: 'Occurred', value: formatDate(entry.occurredAt) },
                { label: 'Reference', value: entry.reference || '—', mono: true },
                { label: 'Description', value: entry.description || 'No description.', span: 2 },
              ]}
            />
          </DetailSection>

          <AttachmentPanel entityType="ledger_entry" entityId={entry.id} />

          <DetailSection title="Source">
            <DetailList
              items={[
                {
                  label: 'Purchase order',
                  value: entry.purchaseOrder ? (
                    <Link
                      to={`/purchase-orders/${entry.purchaseOrder.id}`}
                      className="font-mono text-xs underline decoration-border underline-offset-4"
                    >
                      {entry.purchaseOrder.orderNumber}
                    </Link>
                  ) : (
                    '—'
                  ),
                },
                {
                  label: 'Shipment',
                  value: entry.shipment ? (
                    <Link
                      to={`/shipments/${entry.shipment.id}`}
                      className="font-mono text-xs underline decoration-border underline-offset-4"
                    >
                      {entry.shipment.shipmentNumber}
                    </Link>
                  ) : (
                    '—'
                  ),
                },
                { label: 'Customer', value: entry.customer?.name ?? '—' },
                { label: 'Supplier', value: entry.supplier?.name ?? '—' },
              ]}
            />
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Audit">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono text-[11px]">{formatDateTime(entry.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Created by</span>
                <span className="text-xs">{displayUserName(entry.createdBy)}</span>
              </div>
              {entry.approvedAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-mono text-[11px]">
                    {formatDateTime(entry.approvedAt)}
                  </span>
                </div>
              ) : null}
              {entry.approvedBy ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Approved by</span>
                  <span className="text-xs">{displayUserName(entry.approvedBy)}</span>
                </div>
              ) : null}
              {entry.voidedAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Voided</span>
                  <span className="font-mono text-[11px]">{formatDateTime(entry.voidedAt)}</span>
                </div>
              ) : null}
            </div>
          </DetailSection>

          <DetailSection title="Reference">
            <DetailList
              items={[{ label: 'Entry ID', value: entry.id, mono: true, span: 2 }]}
            />
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmVoid}
        onOpenChange={setConfirmVoid}
        title="Void this ledger entry?"
        description="Voided entries stay in the ledger for audit purposes and no longer count toward profit."
        confirmLabel="Void entry"
        destructive
        isLoading={voiding}
        onConfirm={handleVoid}
      />
    </div>
  );
};
