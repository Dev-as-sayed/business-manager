import { Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useDeleteRoleMutation,
  useGetRoleQuery,
  useListPermissionsQuery,
} from '@/features/roles/roles.api';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { DetailList, DetailSection } from '@/shared/components/detail-list';
import { ErrorState } from '@/shared/components/error-state';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import { formatDateTime } from '@/shared/utils/format';
import { roleLabel } from '@/shared/utils/roles';
import { toastApiError } from '@/shared/utils/toast';

export const RoleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading, error, refetch } = useGetRoleQuery(id ?? '', { skip: !id });
  const { data: permissions } = useListPermissionsQuery();
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const grouped = useMemo(() => {
    if (!role || !permissions) return [];

    return permissions.reduce<Record<string, typeof permissions>>((acc, permission) => {
      acc[permission.resource] = [...(acc[permission.resource] ?? []), permission];
      return acc;
    }, {});
  }, [permissions, role]);

  if (isLoading) return <SplashScreen label="Loading role…" />;
  if (error || !role) return <ErrorState error={error} onRetry={refetch} />;

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRole(id).unwrap();
      navigate('/roles', { replace: true });
    } catch (deleteError) {
      toastApiError(deleteError);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        backTo="/roles"
        backLabel="All roles"
        eyebrow="Role record"
        title={roleLabel(role.name)}
        description={role.description || 'No description recorded for this role.'}
        actions={
          <>
            {role.isSystem ? <Badge variant="neutral">System role</Badge> : null}
            <Can resource="roles" action="update">
              <Button variant="outline" asChild>
                <Link to={`/roles/${role.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can resource="roles" action="delete">
              {!role.isSystem ? (
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
        <DetailSection title="Permissions">
          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">No permissions granted.</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([resource, resourcePermissions]) => {
                const granted = resourcePermissions.filter((permission) =>
                  role.permissions.includes(permission.key),
                );

                return (
                  <div key={resource} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {resource.replaceAll('_', ' ')}
                      </p>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {granted.length}/{resourcePermissions.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {resourcePermissions.map((permission) =>
                        role.permissions.includes(permission.key) ? (
                          <Badge key={permission.key} variant="success">
                            {permission.action}
                          </Badge>
                        ) : (
                          <Badge key={permission.key} variant="outline" className="opacity-50">
                            {permission.action}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DetailSection>

        <div className="space-y-5">
          <DetailSection title="Record">
            <DetailList
              items={[
                { label: 'Name', value: role.name, mono: true },
                { label: 'Assigned users', value: String(role.userCount) },
                { label: 'Permission grants', value: String(role.permissions.length) },
                { label: 'Type', value: role.isSystem ? 'System' : 'Custom' },
                { label: 'Created', value: formatDateTime(role.createdAt) },
                { label: 'Updated', value: formatDateTime(role.updatedAt) },
                { label: 'Reference', value: role.id, mono: true, span: 2 },
              ]}
            />
          </DetailSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this role?"
        description="Roles with assigned users cannot be deleted. This action cannot be undone."
        confirmLabel="Delete role"
        destructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
