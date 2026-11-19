import { Redirect, Stack, type ErrorBoundaryProps, type Href } from 'expo-router';
import { getHomeForRole } from '@/config/routes.config';
import { selectAuthStatus, selectAuthUser, selectIntendedPath } from '@/features/auth/auth.slice';
import { useAppSelector } from '@/store/hooks';
import { RouteErrorBoundary } from '@/shared/components/RouteErrorBoundary';

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorBoundary {...props} />;
}

export default function AuthLayout() {
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);
  const intendedPath = useAppSelector(selectIntendedPath);

  if (status === 'authenticated' && user) {
    return <Redirect href={(intendedPath ?? getHomeForRole(user.role)) as Href} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F4F6F2' },
      }}
    />
  );
}
