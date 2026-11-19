import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CUSTOMS_TRANSITIONS,
  type CustomsStatus,
} from '@/features/customs/customs.types';
import {
  useDeleteCustomsRecordMutation,
  useGetCustomsRecordQuery,
  useUpdateCustomsStatusMutation,
} from '@/features/customs/customs.api';
import { AttachmentPanel } from '@/features/attachments/components/AttachmentPanel';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { ErrorState } from '@/shared/components/error-state';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { StatusBadge } from '@/shared/components/status-badge';
import { StatusTransitionMenu } from '@/shared/components/status-transition-menu';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import {
  displayUserName,
  formatDate,
  formatDateTime,
  formatMoney,
} from '@/shared/utils/format';
import { toastApiError } from '@/shared/utils/toast';

export const CustomsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: record, isLoading, error, refetch } = useGetCustomsRecordQuery(id ?? '', {
    skip: !id,
  });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateCustomsStatusMutation();
  const [deleteRecord, { isLoading: deleting }] = useDeleteCustomsRecordMutation();

  if (isLoading) return <SplashScreen label="Loading customs record…" />;
  if (error || !record) return <ErrorState error={error} onRetry={refetch} />;

  const canEdit = ['PENDING', 'IN_REVIEW', 'HELD'].includes(record.status);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({ id, status: status as CustomsStatus }).unwrap();
    } catch (statusError) {
      toastApiError(statusError);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRecord(id).unwrap();
      navigate('/customs');
    } catch (deleteError) {
      toastApiError(deleteError);
    }
  };

  const fees = [
    { label: 'Duty', value: record.dutyAmount },
    { label: 'Tax', value: record.taxAmount },
    { label: 'Other fees', value: record.otherFees },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/customs"
        backLabel="All customs records"
        eyebrow={record.recordNumber}
        title={record.customer?.name ?? 'Customs record'}
        description={
          record.shipment
            ? `Shipment ${record.shipment.shipmentNumber}`
            : 'Shipment no longer available'
        }
        actions={
          <>
            <StatusBadge status={record.status} />
            <Can resource="customs" action="update">
              {canEdit ? (
                <>
                  <StatusTransitionMenu
                    currentStatus={record.status}
                    transitions={CUSTOMS_TRANSITIONS}
                    onSelect={handleStatusChange}
                    isLoading={updatingStatus}
                  />
                  <Button variant="outline" asChild>
                    <Link to={`/customs/${record.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                </>
              ) : null}
            </Can>
            <Can resource="customs" action="delete">
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <DetailSection title="Declaration">
            <DetailList
              items={[
                { label: 'Shipment', value: record.shipment?.shipmentNumber ?? '—', mono: true },
                { label: 'Declaration number', value: record.declarationNumber || '—', mono: true },
                { label: 'Customs office', value: record.customsOffice || '—' },
                { label: 'Country', value: record.country || '—' },
                { label: 'Supplier', value: record.supplier?.name ?? '—' },
                { label: 'Clearance date', value: formatDate(record.clearanceDate) },
                { label: 'Notes', value: record.notes || 'No notes.', span: 2 },
              ]}
            />
          </DetailSection>

          <AttachmentPanel entityType="customs_record" entityId={record.id} />

          <DetailSection title="Duties & fees">
            <div className="space-y-2 text-sm">
              {fees.map((fee) => (
                <div key={fee.label} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{fee.label}</span>
                  <span className="font-mono text-xs">
                    {formatMoney(fee.value, record.currency)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-border pt-2.5">
                <span className="font-medium">Total</span>
                <span className="font-mono text-sm font-medium">
                  {formatMoney(record.totalAmount, record.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-muted-foreground">Exchange rate</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {record.exchangeRate}
                </span>
              </div>
            </div>
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Milestones">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Created</span>
                <span className="font-mono text-[11px]">{formatDateTime(record.createdAt)}</span>
              </div>
              {record.reviewedAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Reviewed</span>
                  <span className="font-mono text-[11px]">{formatDateTime(record.reviewedAt)}</span>
                </div>
              ) : null}
              {record.clearedAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Cleared</span>
                  <span className="font-mono text-[11px]">{formatDateTime(record.clearedAt)}</span>
                </div>
              ) : null}
              {record.heldAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Held</span>
                  <span className="font-mono text-[11px]">{formatDateTime(record.heldAt)}</span>
                </div>
              ) : null}
              {record.cancelledAt ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Cancelled</span>
                  <span className="font-mono text-[11px]">
                    {formatDateTime(record.cancelledAt)}
                  </span>
                </div>
              ) : null}
            </div>
          </DetailSection>

          <DetailSection title="Record">
            <DetailList
              items={[
                { label: 'Created by', value: displayUserName(record.createdBy) },
                { label: 'Updated by', value: displayUserName(record.updatedBy) },
                { label: 'Reference', value: record.id, mono: true, span: 2 },
              ]}
            />
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete customs record?"
        description="This removes the record from the customs register. The shipment itself is untouched."
        confirmLabel="Delete record"
        destructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
