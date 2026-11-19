import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateRoleMutation,
  useGetRoleQuery,
  useListPermissionsQuery,
  useUpdateRoleMutation,
} from '@/features/roles/roles.api';
import { roleFormSchema, type RoleFormValues } from '@/features/roles/roles.schema';
import type { PermissionOption } from '@/features/roles/roles.types';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, TextField, TextareaField } from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

const emptyValues: RoleFormValues = { name: '', description: '' };

export const RoleFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: role, isLoading } = useGetRoleQuery(id ?? '', { skip: !isEdit });
  const { data: permissions, isLoading: loadingPermissions } = useListPermissionsQuery();
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [selected, setSelected] = useState<string[]>([]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: emptyValues,
  });
  const { reset, handleSubmit, setError, formState } = form;

  useEffect(() => {
    if (!role) return;
    reset({ name: role.name, description: role.description ?? '' });
    setSelected(role.permissions);
  }, [role, reset]);

  const grouped = useMemo(() => {
    return (permissions ?? []).reduce<Record<string, PermissionOption[]>>((acc, permission) => {
      acc[permission.resource] = [...(acc[permission.resource] ?? []), permission];
      return acc;
    }, {});
  }, [permissions]);

  const togglePermission = (key: string) => {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const toggleResource = (resourcePermissions: PermissionOption[]) => {
    const keys = resourcePermissions.map((permission) => permission.key);
    const allSelected = keys.every((key) => selected.includes(key));

    setSelected((current) =>
      allSelected ? current.filter((key) => !keys.includes(key)) : [...new Set([...current, ...keys])],
    );
  };

  const isSuperAdmin = role?.name === 'SUPER_ADMIN';
  const permissionsLocked = isSuperAdmin;

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && role) {
        const body = {
          ...(role.isSystem ? {} : { name: values.name.toUpperCase() }),
          description: values.description ?? '',
          ...(isSuperAdmin ? {} : { permissions: selected }),
        };
        const saved = await updateRole({ id: role.id, body }).unwrap();
        navigate(`/roles/${saved.id}`);
      } else {
        const saved = await createRole({
          name: values.name.toUpperCase(),
          description: values.description ?? '',
          permissions: selected,
        }).unwrap();
        navigate(`/roles/${saved.id}`);
      }
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading role…" />;

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/roles/${id}` : '/roles'}
        backLabel={isEdit ? 'Back to role' : 'All roles'}
        eyebrow={isEdit ? 'Edit access' : 'New access bundle'}
        title={isEdit ? 'Edit role' : 'New role'}
        description="Bundle permissions that can be assigned to staff and customer accounts."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Role details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGrid>
                <TextField
                  name="name"
                  label="Role name"
                  placeholder="Sales manager"
                  required
                  disabled={role?.isSystem}
                  hint={role?.isSystem ? 'System role names cannot be changed.' : undefined}
                />
                <div className="hidden sm:block" aria-hidden />
                <TextareaField
                  name="description"
                  label="Description"
                  placeholder="What this role is responsible for…"
                  rows={3}
                  className="sm:col-span-2"
                />
              </FieldGrid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Permissions
              </CardTitle>
              <Badge variant="neutral">{selected.length} selected</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              {permissionsLocked ? (
                <p className="text-sm text-muted-foreground">
                  SUPER_ADMIN always has full access. Permissions cannot be modified.
                </p>
              ) : null}

              {loadingPermissions ? (
                <p className="text-sm text-muted-foreground">Loading permission catalog…</p>
              ) : (
                Object.entries(grouped).map(([resource, resourcePermissions]) => {
                  const keys = resourcePermissions.map((permission) => permission.key);
                  const selectedCount = keys.filter((key) => selected.includes(key)).length;
                  const allSelected = selectedCount === keys.length;
                  const someSelected = selectedCount > 0 && !allSelected;

                  return (
                    <div key={resource} className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            id={`resource-${resource}`}
                            checked={
                              allSelected ? true : someSelected ? 'indeterminate' : false
                            }
                            disabled={permissionsLocked}
                            onCheckedChange={() => toggleResource(resourcePermissions)}
                          />
                          <Label htmlFor={`resource-${resource}`} className="cursor-pointer">
                            {resource.replaceAll('_', ' ')}
                          </Label>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {selectedCount}/{keys.length}
                        </span>
                      </div>

                      <div className="grid gap-2 pl-7 sm:grid-cols-3 lg:grid-cols-4">
                        {resourcePermissions.map((permission) => (
                          <label
                            key={permission.key}
                            htmlFor={permission.key}
                            className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"
                          >
                            <Checkbox
                              id={permission.key}
                              checked={selected.includes(permission.key)}
                              disabled={permissionsLocked}
                              onCheckedChange={() => togglePermission(permission.key)}
                            />
                            {permission.action}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/roles/${id}` : '/roles'}
            submitLabel={isEdit ? 'Save changes' : 'Create role'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
