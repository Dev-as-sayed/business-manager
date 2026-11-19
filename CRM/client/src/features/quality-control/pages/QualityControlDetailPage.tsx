import { ExternalLink, Pencil } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  QC_TRANSITIONS,
  type QcStatus,
} from '@/features/quality-control/quality-control.types';
import {
  useGetQcReportQuery,
  useUpdateQcReportStatusMutation,
} from '@/features/quality-control/quality-control.api';
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

export const QualityControlDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, error, refetch } = useGetQcReportQuery(id ?? '', {
    skip: !id,
  });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateQcReportStatusMutation();

  if (isLoading) return <SplashScreen label="Loading QC report…" />;
  if (error || !report) return <ErrorState error={error} onRetry={refetch} />;

  const canEdit = ['PENDING', 'IN_PROGRESS'].includes(report.status);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({ id, status: status as QcStatus }).unwrap();
    } catch (statusError) {
      toastApiError(statusError);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/quality-control"
        backLabel="All QC reports"
        eyebrow={report.reportNumber}
        title={report.purchaseOrder?.orderNumber ?? 'Inspection'}
        description={report.supplier?.name ?? 'No supplier linked'}
        actions={
          <>
            <StatusBadge status={report.status} />
            <Can resource="quality_control" action="update">
              {canEdit ? (
                <>
                  <StatusTransitionMenu
                    currentStatus={report.status}
                    transitions={QC_TRANSITIONS}
                    onSelect={handleStatusChange}
                    isLoading={updatingStatus}
                  />
                  <Button variant="outline" asChild>
                    <Link to={`/quality-control/${report.id}/edit`}>
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
          <DetailSection title="Inspection">
            <DetailList
              items={[
                {
                  label: 'Purchase order',
                  value: report.purchaseOrder ? (
                    <Link
                      className="underline decoration-border underline-offset-4 hover:text-accent"
                      to={`/purchase-orders/${report.purchaseOrder.id}`}
                    >
                      {report.purchaseOrder.orderNumber}
                    </Link>
                  ) : (
                    '—'
                  ),
                  mono: true,
                },
                { label: 'Customer', value: report.customer?.name ?? '—' },
                { label: 'Supplier', value: report.supplier?.name ?? '—' },
                {
                  label: 'Inspector',
                  value: report.inspector ? displayUserName(report.inspector) : 'Unassigned',
                },
                { label: 'Inspection date', value: formatDate(report.inspectionDate) },
                {
                  label: 'Completed',
                  value: report.completedAt ? formatDateTime(report.completedAt) : 'Not completed',
                },
                { label: 'Notes', value: report.notes || 'No notes.', span: 2 },
              ]}
            />
          </DetailSection>

          <AttachmentPanel entityType="qc_report" entityId={report.id} />

          <DetailSection title={`Photos (${report.photoUrls.length})`}>
            {report.photoUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photo evidence attached.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {report.photoUrls.map((url, index) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-accent/50 hover:bg-muted/40"
                  >
                    <span className="truncate font-mono text-[11px]">
                      Photo {index + 1} · {url}
                    </span>
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Record">
            <DetailList
              items={[
                { label: 'Report number', value: report.reportNumber, mono: true },
                { label: 'Created by', value: displayUserName(report.createdBy) },
                { label: 'Created', value: formatDateTime(report.createdAt) },
                { label: 'Updated', value: formatDateTime(report.updatedAt) },
                { label: 'Reference', value: report.id, mono: true, span: 2 },
              ]}
            />
          </DetailSection>

          <DetailSection title="Status flow">
            <div className="flex flex-wrap gap-1.5">
              {(QC_TRANSITIONS[report.status] ?? []).length > 0 ? (
                (QC_TRANSITIONS[report.status] ?? []).map((status) => (
                  <StatusBadge key={status} status={status} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">This report is closed.</p>
              )}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};
