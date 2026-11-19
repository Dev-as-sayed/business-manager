import { useCallback } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectAuthUser, selectPermissions } from '@/features/auth/auth.slice';

export interface Permission {
  resource: string;
  action: string;
}

export const usePermission = () => {
  const permissions = useAppSelector(selectPermissions);
  const role = useAppSelector(selectAuthUser)?.role ?? null;

  const can = useCallback(
    (resource: string, action: string): boolean =>
      role === 'SUPER_ADMIN' || permissions.includes(`${resource}:${action}`),
    [permissions, role],
  );

  const canAny = useCallback(
    (checks: Permission[]): boolean => checks.some(({ resource, action }) => can(resource, action)),
    [can],
  );

  const canAll = useCallback(
    (checks: Permission[]): boolean => checks.every(({ resource, action }) => can(resource, action)),
    [can],
  );

  return { can, canAny, canAll, permissions, role };
};
