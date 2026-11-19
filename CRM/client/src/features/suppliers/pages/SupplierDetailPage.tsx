import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  SUPPLIER_STATUS_TRANSITIONS,
  type SupplierStatus,
} from '@/features/suppliers/suppliers.types';
import {
  useDeleteSupplierMutation,
  useGetSupplierQuery,
  useUpdateSupplierStatusMutation,
} from '@/features/suppliers/suppliers.api';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { ErrorState } from '@/shared/components/error-state';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { StatusBadge } from '@/shared/components/status-badge';
import { StatusTransitionMenu } from '@/shared/components/status-transition-menu';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import { formatDate, formatDateTime } from '@/shared/utils/format';
import { toastApiError } from '@/shared/utils/toast';

export const SupplierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: supplier, isLoading, error, refetch } = useGetSupplierQuery(id ?? '', {
    skip: !id,
  });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateSupplierStatusMutation();
  const [deleteSupplier, { isLoading: deleting }] = useDeleteSupplierMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <SplashScreen label="Loading supplier…" />;
  if (error || !supplier) return <ErrorState error={error} onRetry={refetch} />;

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({ id, status: status as SupplierStatus }).unwrap();
    } catch (statusError) {
      toastApiError(statusError);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteSupplier(id).unwrap();
      navigate('/suppliers', { replace: true });
    } catch (deleteError) {
      toastApiError(deleteError);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/suppliers"
        backLabel="All suppliers"
        eyebrow="Supplier record"
        title={supplier.name}
        description={
          [supplier.city, supplier.country].filter(Boolean).join(', ') ||
          'No location on file.'
        }
        actions={
          <>
            <StatusBadge status={supplier.status} />
            <Can resource="suppliers" action="update">
              <StatusTransitionMenu
                currentStatus={supplier.status}
                transitions={SUPPLIER_STATUS_TRANSITIONS}
                onSelect={handleStatusChange}
                isLoading={updatingStatus}
              />
              <Button variant="outline" asChild>
                <Link to={`/suppliers/${supplier.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can resource="suppliers" action="delete">
              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="size-4" />
                Delete
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <DetailSection title="Company">
            <DetailList
              items={[
                { label: 'Legal name', value: supplier.name },
                { label: 'Tax ID', value: supplier.taxId || '—', mono: true },
                { label: 'Contact person', value: supplier.contactName || '—' },
                { label: 'Status', value: <StatusBadge status={supplier.status} /> },
                { label: 'Email', value: supplier.email || '—' },
                { label: 'Phone', value: supplier.phone || '—', mono: true },
                { label: 'Address', value: supplier.address || '—', span: 2 },
              ]}
            />
          </DetailSection>

          <DetailSection title="Notes">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {supplier.notes || 'No notes recorded for this supplier.'}
            </p>
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Record">
            <DetailList
              items={[
                { label: 'Created', value: formatDateTime(supplier.createdAt) },
                { label: 'Updated', value: formatDateTime(supplier.updatedAt) },
                { label: 'Reference', value: supplier.id, mono: true, span: 2 },
                { label: 'Supplier since', value: formatDate(supplier.createdAt) },
              ]}
            />
          </DetailSection>

          <DetailSection title="Status flow">
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Available next steps:</p>
              <div className="flex flex-wrap gap-1.5">
                {(SUPPLIER_STATUS_TRANSITIONS[supplier.status] ?? []).map((status) => (
                  <StatusBadge key={status} status={status} />
                ))}
              </div>
            </div>
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this supplier?"
        description="This archives the supplier. Purchase orders that reference it may block deletion."
        confirmLabel="Delete supplier"
        destructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
