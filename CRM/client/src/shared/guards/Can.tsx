import type { ReactNode } from 'react';
import { usePermission } from '@/shared/hooks/usePermission';

interface CanProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can = ({ resource, action, children, fallback = null }: CanProps) => {
  const { can } = usePermission();
  return can(resource, action) ? children : fallback;
};
