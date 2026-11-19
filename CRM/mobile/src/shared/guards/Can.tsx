import type { ReactNode } from 'react';
import { usePermission } from '@/shared/hooks/usePermission';

export const Can = ({
  resource,
  action,
  children,
  fallback = null,
}: {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  const { can } = usePermission();
  return <>{can(resource, action) ? children : fallback}</>;
};
