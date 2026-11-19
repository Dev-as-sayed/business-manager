import { useEffect, useRef } from 'react';
import { toast } from 'sonner-native';
import { authApi } from '@/features/auth/auth.api';
import {
  bootstrapStarted,
  selectAuthStatus,
  setCredentials,
  setUnauthenticated,
  setUser,
} from '@/features/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { secureStorage } from '@/shared/storage/secureStorage';

export const useAppBootstrap = (): void => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }

    started.current = true;
    dispatch(bootstrapStarted());

    void (async () => {
      try {
        const refreshToken = await secureStorage.getRefreshToken();

        if (!refreshToken) {
          dispatch(setUnauthenticated());
          return;
        }

        const refreshResult = await dispatch(
          authApi.endpoints.refresh.initiate(undefined),
        ).unwrap();

        dispatch(setCredentials(refreshResult.user));

        const user = await dispatch(
          authApi.endpoints.me.initiate(undefined, { forceRefetch: true }),
        ).unwrap();

        dispatch(setUser(user));
      } catch {
        await secureStorage.clear();
        dispatch(setUnauthenticated());
        toast.error('Your session could not be restored. Sign in again.');
      }
    })();
  }, [dispatch, status]);
};
