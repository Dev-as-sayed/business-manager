import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthStatus } from '@/features/auth/auth.slice';
import { SplashScreen } from '@/shared/components/splash-screen';

export const ProtectedRoute = () => {
  const status = useAppSelector(selectAuthStatus);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <SplashScreen />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
};
