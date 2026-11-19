import { useCallback } from 'react';
import { selectAuthUser } from '@/features/auth/auth.slice';
import { useAppSelector } from '@/store/hooks';

export const usePermission = () => {
  const user = useAppSelector(selectAuthUser);
  const permissions = user?.permissions;

  const can = useCallback(
    (resource: string, action: string): boolean =>
      permissions?.includes(`${resource}:${action}`) ?? false,
    [permissions],
  );

  return {
    user,
    role: user?.role ?? null,
    can,
  };
};
