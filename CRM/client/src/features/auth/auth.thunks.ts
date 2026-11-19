import { createAsyncThunk } from '@reduxjs/toolkit';
import { desktopAuth } from '@/api/desktop-auth';
import { tokenStore } from '@/api/token-store';
import { authApi } from '@/features/auth/auth.api';
import type { AuthUser } from '@/features/auth/auth.types';
import type { AppDispatch } from '@/app/store';

let bootstrapPromise: Promise<AuthUser> | null = null;

const runBootstrap = async (dispatch: AppDispatch): Promise<AuthUser> => {
  try {
    await desktopAuth.getRefreshToken();
    await dispatch(authApi.endpoints.refresh.initiate()).unwrap();
    const user = await dispatch(
      authApi.endpoints.me.initiate(undefined, { forceRefetch: true }),
    ).unwrap();
    return user;
  } catch (error) {
    tokenStore.clear();
    await desktopAuth.clearRefreshToken();
    throw error;
  }
};

export const bootstrapSession = createAsyncThunk<AuthUser, void, { dispatch: AppDispatch }>(
  'auth/bootstrap',
  async (_arg, { dispatch }) => {
    if (!bootstrapPromise) {
      bootstrapPromise = runBootstrap(dispatch).catch((error: unknown) => {
        bootstrapPromise = null;
        throw error;
      });
    }

    return bootstrapPromise;
  },
);
