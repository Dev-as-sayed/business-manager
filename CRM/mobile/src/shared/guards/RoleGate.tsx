import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import type { AppRole } from '@/config/routes.config';
import { hasRole } from '@/config/routes.config';
import { usePermission } from '@/shared/hooks/usePermission';

export const RoleGate = ({ allowed, children }: { allowed: AppRole[]; children: ReactNode }) => {
  const { role } = usePermission();

  if (!hasRole(role, allowed)) {
    return <Redirect href="/forbidden" />;
  }

  return <>{children}</>;
};
