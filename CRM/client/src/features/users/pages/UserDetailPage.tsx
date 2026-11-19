import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/features/auth/auth.slice';
import {
  USER_STATUS_TRANSITIONS,
  type UserStatus,
} from '@/features/users/users.types';
import {
  useDeleteUserMutation,
  useGetUserQuery,
  useUpdateUserStatusMutation,
} from '@/features/users/users.api';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { ErrorState } from '@/shared/components/error-state';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { StatusBadge } from '@/shared/components/status-badge';
import { StatusTransitionMenu } from '@/shared/components/status-transition-menu';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import { formatDateTime, formatRelative } from '@/shared/utils/format';
import { roleLabel } from '@/shared/utils/roles';
import { toastApiError } from '@/shared/utils/toast';

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectAuthUser);
  const { data: user, isLoading, error, refetch } = useGetUserQuery(id ?? '', { skip: !id });
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <SplashScreen label="Loading user…" />;
  if (error || !user) return <ErrorState error={error} onRetry={refetch} />;

  const isSelf = currentUser?.id === user.id;

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateStatus({ id, status: status as UserStatus }).unwrap();
    } catch (statusError) {
      toastApiError(statusError);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteUser(id).unwrap();
      navigate('/users', { replace: true });
    } catch (deleteError) {
      toastApiError(deleteError);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/users"
        backLabel="All users"
        eyebrow="Access record"
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
        actions={
          <>
            <StatusBadge status={user.status} />
            <Can resource="users" action="update">
              <StatusTransitionMenu
                currentStatus={user.status}
                transitions={USER_STATUS_TRANSITIONS}
                onSelect={handleStatusChange}
                isLoading={updatingStatus}
                disabled={isSelf}
              />
              <Button variant="outline" asChild>
                <Link to={`/users/${user.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can resource="users" action="delete">
              {!isSelf ? (
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
          <DetailSection title="Identity">
            <DetailList
              items={[
                { label: 'First name', value: user.firstName },
                { label: 'Last name', value: user.lastName },
                { label: 'Email', value: user.email },
                { label: 'Phone', value: user.phone || '—', mono: true },
                { label: 'Status', value: <StatusBadge status={user.status} /> },
                { label: 'Role', value: roleLabel(user.role.name) },
              ]}
            />
          </DetailSection>

          <DetailSection title="Access">
            <DetailList
              items={[
                { label: 'Role name', value: user.role.name, mono: true },
                { label: 'Customer link', value: user.customer?.name ?? 'Not linked' },
                {
                  label: 'Customer reference',
                  value: user.customerId ?? '—',
                  mono: true,
                  span: 2,
                },
              ]}
            />
            {isSelf ? (
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                This is your own account. You cannot deactivate or delete it here.
              </p>
            ) : null}
          </DetailSection>
        </div>

        <div className="space-y-5">
          <DetailSection title="Session">
            <DetailList
              items={[
                {
                  label: 'Last login',
                  value: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never',
                },
                {
                  label: 'Seen',
                  value: user.lastLoginAt ? formatRelative(user.lastLoginAt) : '—',
                },
                { label: 'Created', value: formatDateTime(user.createdAt) },
                { label: 'Updated', value: formatDateTime(user.updatedAt) },
                { label: 'User reference', value: user.id, mono: true, span: 2 },
              ]}
            />
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this user?"
        description="The account is deactivated and its active sessions are revoked. This cannot be undone from the desk."
        confirmLabel="Delete user"
        destructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
