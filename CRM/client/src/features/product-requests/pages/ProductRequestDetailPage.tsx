import { FilePlus2, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/features/auth/auth.slice';
import {
  getProductRequestTransitions,
  type ProductRequestStatus,
} from '@/features/product-requests/product-requests.types';
import {
  useAssignProductRequestMutation,
  useDeleteProductRequestMutation,
  useGetProductRequestQuery,
  useUpdateProductRequestStatusMutation,
} from '@/features/product-requests/product-requests.api';
import { useListUsersQuery } from '@/features/users/users.api';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { ErrorState } from '@/shared/components/error-state';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { StatusBadge } from '@/shared/components/status-badge';
import { StatusTransitionMenu } from '@/shared/components/status-transition-menu';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Can } from '@/shared/guards/Can';
import { usePermission } from '@/shared/hooks/usePermission';
import { displayUserName, formatDateTime, formatMoney } from '@/shared/utils/format';
import { toastApiError } from '@/shared/utils/toast';

const TERMINAL: ProductRequestStatus[] = ['APPROVED', 'REJECTED', 'CANCELLED'];

export const ProductRequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectAuthUser);
  const { can } = usePermission();
  const { data: request, isLoading, error, refetch } = useGetProductRequestQuery(id ?? '', {
    skip: !id,
  });
  const canAssign = can('product_requests', 'update') && currentUser?.role !== 'CUSTOMER';
  const { data: opsUsers } = useListUsersQuery(
    { limit: 100, status: 'ACTIVE', role: 'CHINA_OPERATIONS', sortBy: 'firstName', sortOrder: 'asc' },
    { skip: !canAssign },
  );
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateProductRequestStatusMutation();
  const [assign, { isLoading: assigning }] = useAssignProductRequestMutation();
  const [deleteRequest, { isLoading: deleting }] = useDeleteProductRequestMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <SplashScreen label="Loading request…" />;
  if (error || !request) return <ErrorState error={error} onRetry={refetch} />;

  const transitions = getProductRequestTransitions(currentUser?.role);
  const isTerminal = TERMINAL.includes(request.status);
  const canQuote = ['REVIEWING', 'QUOTED'].includes(request.status) && can('quotations', 'create');

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({ id, status: status as ProductRequestStatus }).unwrap();
    } catch (statusError) {
      toastApiError(statusError);
    }
  };

  const handleAssign = async (value: string) => {
    if (!id) return;
    try {
      await assign({ id, assignedUserId: value === 'UNASSIGNED' ? '' : value }).unwrap();
    } catch (assignError) {
      toastApiError(assignError);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRequest(id).unwrap();
      navigate('/product-requests', { replace: true });
    } catch (deleteError) {
      toastApiError(deleteError);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/product-requests"
        backLabel="All requests"
        eyebrow={request.requestNumber}
        title={request.title}
        description={request.customer?.name ?? 'No customer linked'}
        actions={
          <>
            <StatusBadge status={request.status} />
            {canQuote ? (
              <Button asChild>
                <Link to={`/quotations/new?productRequestId=${request.id}`}>
                  <FilePlus2 className="size-4" />
                  Create quotation
                </Link>
              </Button>
            ) : null}
            <Can resource="product_requests" action="update">
              {!isTerminal ? (
                <>
                  <StatusTransitionMenu
                    currentStatus={request.status}
                    transitions={transitions}
                    onSelect={handleStatusChange}
                    isLoading={updatingStatus}
                  />
                  <Button variant="outline" asChild>
                    <Link to={`/product-requests/${request.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                </>
              ) : null}
            </Can>
            <Can resource="product_requests" action="delete">
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
          <DetailSection title="Brief">
            <DetailList
              items={[
                { label: 'Request number', value: request.requestNumber, mono: true },
                { label: 'Customer', value: request.customer?.name ?? '—' },
                { label: 'Created by', value: displayUserName(request.createdBy) },
                { label: 'Created', value: formatDateTime(request.createdAt) },
                { label: 'Updated', value: formatDateTime(request.updatedAt) },
                {
                  label: 'Description',
                  value: request.description || 'No description provided.',
                  span: 2,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title={`Line items (${request.items?.length ?? request._count.items})`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Item
                    </th>
                    <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Qty
                    </th>
                    <th className="py-2 pl-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Target price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(request.items ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-border/70 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-medium">{item.name}</p>
                        {item.description ? (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs">{item.quantity}</td>
                      <td className="py-3 pl-3 text-right font-mono text-xs">
                        {formatMoney(item.targetPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Assignment">
            {canAssign ? (
              <div className="space-y-2">
                <Select
                  value={request.assignedUserId ?? 'UNASSIGNED'}
                  onValueChange={handleAssign}
                  disabled={assigning || isTerminal}
                >
                  <SelectTrigger aria-label="Assigned operations user">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    {(opsUsers?.items ?? []).map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only China operations users can be assigned.
                </p>
              </div>
            ) : (
              <p className="text-sm">
                {request.assignedUser ? displayUserName(request.assignedUser) : 'Unassigned'}
              </p>
            )}
          </DetailSection>

          <DetailSection title="Status flow">
            <div className="flex flex-wrap gap-1.5">
              {(transitions[request.status] ?? []).length > 0 ? (
                (transitions[request.status] ?? []).map((status) => (
                  <StatusBadge key={status} status={status} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isTerminal ? 'This request is closed.' : 'No further transitions.'}
                </p>
              )}
            </div>
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this product request?"
        description="The request and its line items are removed. Quotations linked to it may block deletion."
        confirmLabel="Delete request"
        destructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
