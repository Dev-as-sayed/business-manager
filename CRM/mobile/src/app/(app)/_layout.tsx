import { useCallback, useEffect } from 'react';
import {
  Redirect,
  Stack,
  useLocalSearchParams,
  usePathname,
  type ErrorBoundaryProps,
} from 'expo-router';
import { selectAuthStatus, setIntendedPath, setUser } from '@/features/auth/auth.slice';
import { UploadQueueRunner } from '@/features/attachments/useUploadQueueRunner';
import { usePushNotifications } from '@/features/notifications/usePushNotifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authApi } from '@/features/auth/auth.api';
import { useAppForeground } from '@/shared/hooks/useAppForeground';
import { RouteErrorBoundary } from '@/shared/components/RouteErrorBoundary';

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteErrorBoundary {...props} />;
}

const SessionRefresh = () => {
  const dispatch = useAppDispatch();

  const refresh = useCallback(() => {
    void dispatch(authApi.endpoints.me.initiate(undefined, { forceRefetch: true }))
      .unwrap()
      .then((user) => dispatch(setUser(user)))
      .catch(() => undefined);
  }, [dispatch]);

  useAppForeground(refresh);
  return null;
};

const PushNotificationsGate = () => {
  usePushNotifications();
  return null;
};

export default function AppLayout() {
  const status = useAppSelector(selectAuthStatus);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const query = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      Array.isArray(value) ? value.map((entry) => [key, entry]) : [[key, value as string]],
    ),
  ).toString();
  const intendedPath = `${pathname}${query ? `?${query}` : ''}`;

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/') {
      dispatch(setIntendedPath(intendedPath));
    }
  }, [dispatch, intendedPath, pathname, status]);

  if (status === 'unauthenticated') {
    return <Redirect href={{ pathname: '/login', params: { next: intendedPath } }} />;
  }

  return (
    <>
      <UploadQueueRunner />
      <PushNotificationsGate />
      <SessionRefresh />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F4F6F2' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product-requests/new"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="qc/new"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="upload-queue"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}
