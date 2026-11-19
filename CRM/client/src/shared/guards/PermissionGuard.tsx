import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '@/shared/hooks/usePermission';

interface PermissionGuardProps {
  resource?: string;
  action?: string;
  children: ReactNode;
}

export const PermissionGuard = ({ resource, action, children }: PermissionGuardProps) => {
  const { can } = usePermission();

  if (!resource || !action) return children;

  if (!can(resource, action)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
