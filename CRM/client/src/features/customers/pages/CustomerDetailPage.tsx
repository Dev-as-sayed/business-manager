import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CUSTOMER_STATUS_TRANSITIONS,
  type CustomerStatus,
} from '@/features/customers/customers.types';
import {
  useDeleteCustomerMutation,
  useGetCustomerQuery,
  useUpdateCustomerStatusMutation,
} from '@/features/customers/customers.api';
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

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error, refetch } = useGetCustomerQuery(id ?? '', {
    skip: !id,
  });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateCustomerStatusMutation();
  const [deleteCustomer, { isLoading: deleting }] = useDeleteCustomerMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <SplashScreen label="Loading customer…" />;
  if (error || !customer) return <ErrorState error={error} onRetry={refetch} />;

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({ id, status: status as CustomerStatus }).unwrap();
    } catch (statusError) {
      toastApiError(statusError);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCustomer(id).unwrap();
      navigate('/customers', { replace: true });
    } catch (deleteError) {
      toastApiError(deleteError);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/customers"
        backLabel="All customers"
        eyebrow="Customer record"
        title={customer.name}
        description={
          [customer.city, customer.country].filter(Boolean).join(', ') ||
          'No location on file.'
        }
        actions={
          <>
            <StatusBadge status={customer.status} />
            <Can resource="customers" action="update">
              <StatusTransitionMenu
                currentStatus={customer.status}
                transitions={CUSTOMER_STATUS_TRANSITIONS}
                onSelect={handleStatusChange}
                isLoading={updatingStatus}
              />
              <Button variant="outline" asChild>
                <Link to={`/customers/${customer.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can resource="customers" action="delete">
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
                { label: 'Legal name', value: customer.name },
                { label: 'Tax ID', value: customer.taxId || '—', mono: true },
                { label: 'Contact person', value: customer.contactName || '—' },
                { label: 'Status', value: <StatusBadge status={customer.status} /> },
                { label: 'Email', value: customer.email || '—' },
                { label: 'Phone', value: customer.phone || '—', mono: true },
                { label: 'Address', value: customer.address || '—', span: 2 },
              ]}
            />
          </DetailSection>

          <DetailSection title="Notes">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {customer.notes || 'No notes recorded for this customer.'}
            </p>
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Record">
            <DetailList
              items={[
                { label: 'Created', value: formatDateTime(customer.createdAt) },
                { label: 'Updated', value: formatDateTime(customer.updatedAt) },
                { label: 'Reference', value: customer.id, mono: true, span: 2 },
                { label: 'Customer since', value: formatDate(customer.createdAt) },
              ]}
            />
          </DetailSection>

          <DetailSection title="Status flow">
            <div className="space-y-2 text-sm">
              {(CUSTOMER_STATUS_TRANSITIONS[customer.status] ?? []).length > 0 ? (
                <>
                  <p className="text-muted-foreground">Available next steps:</p>
                  <ul className="space-y-1.5">
                    {(CUSTOMER_STATUS_TRANSITIONS[customer.status] ?? []).map((status) => (
                      <li key={status} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                        <StatusBadge status={status} />
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-muted-foreground">This status is terminal.</p>
              )}
            </div>
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this customer?"
        description="This removes the customer from the directory. Historical links may block deletion."
        confirmLabel="Delete customer"
        destructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
