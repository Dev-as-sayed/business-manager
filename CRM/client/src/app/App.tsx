import { Suspense, useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppDispatch } from '@/app/hooks';
import { AppProviders } from '@/app/providers';
import { router } from '@/app/router';
import { setCredentials, setLoading, setUnauthenticated } from '@/features/auth/auth.slice';
import { bootstrapSession } from '@/features/auth/auth.thunks';
import { SplashScreen } from '@/shared/components/splash-screen';

const SessionBootstrapper = () => {
  const dispatch = useAppDispatch();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    dispatch(setLoading());

    dispatch(bootstrapSession())
      .unwrap()
      .then((user) => {
        dispatch(setCredentials(user));
      })
      .catch(() => {
        dispatch(setUnauthenticated());
      });
  }, [dispatch]);

  return null;
};

export const App = () => (
  <AppProviders>
    <SessionBootstrapper />
    <Suspense fallback={<SplashScreen label="Loading desk" />}>
      <RouterProvider router={router} />
    </Suspense>
  </AppProviders>
);
