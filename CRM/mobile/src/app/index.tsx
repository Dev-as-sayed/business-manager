import { Redirect, type Href } from 'expo-router';
import { selectAuthStatus, selectAuthUser } from '@/features/auth/auth.slice';
import { useAppSelector } from '@/store/hooks';
import { getHomeForRole } from '@/config/routes.config';

export default function Index() {
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);

  if (status === 'authenticated' && user) {
    return <Redirect href={getHomeForRole(user.role) as Href} />;
  }

  return <Redirect href="/login" />;
}
