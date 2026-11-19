import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthStatus, AuthUser } from '@/features/auth/auth.types';

export interface AuthState {
  user: AuthUser | null;
  permissions: string[];
  status: AuthStatus;
  intendedPath: string | null;
}

const initialState: AuthState = {
  user: null,
  permissions: [],
  status: 'idle',
  intendedPath: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    bootstrapStarted(state) {
      state.status = 'loading';
    },
    setLoading(state) {
      state.status = 'loading';
    },
    setCredentials(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.permissions = action.payload.permissions;
      state.status = 'authenticated';
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.permissions = action.payload.permissions;
    },
    setUnauthenticated(state) {
      state.user = null;
      state.permissions = [];
      state.status = 'unauthenticated';
      state.intendedPath = null;
    },
    sessionExpired(state) {
      state.user = null;
      state.permissions = [];
      state.status = 'unauthenticated';
    },
    setIntendedPath(state, action: PayloadAction<string | null>) {
      state.intendedPath = action.payload;
    },
  },
});

export const {
  bootstrapStarted,
  setLoading,
  setCredentials,
  setUser,
  setUnauthenticated,
  sessionExpired,
  setIntendedPath,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

export interface AuthRootState {
  auth: AuthState;
}

export const selectAuthUser = (state: AuthRootState): AuthUser | null => state.auth.user;
export const selectAuthStatus = (state: AuthRootState): AuthStatus => state.auth.status;
export const selectPermissions = (state: AuthRootState): string[] => state.auth.permissions;
export const selectIsAuthenticated = (state: AuthRootState): boolean =>
  state.auth.status === 'authenticated';
export const selectIntendedPath = (state: AuthRootState): string | null => state.auth.intendedPath;
