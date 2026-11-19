import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/features/auth/auth.slice';

interface RoleGuardProps {
  roles?: string[];
  children: ReactNode;
}

export const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const user = useAppSelector(selectAuthUser);

  if (!roles || roles.length === 0) return children;

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};
