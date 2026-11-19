import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthStatus, AuthUser } from '@/features/auth/auth.types';
import type { RootState } from '@/app/store';

interface AuthState {
  user: AuthUser | null;
  permissions: string[];
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  permissions: [],
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
    },
    sessionExpired(state) {
      state.user = null;
      state.permissions = [];
      state.status = 'unauthenticated';
    },
  },
});

export const { setLoading, setCredentials, setUser, setUnauthenticated, sessionExpired } =
  authSlice.actions;

export const authReducer = authSlice.reducer;

export const selectAuthUser = (state: RootState): AuthUser | null => state.auth.user;
export const selectAuthStatus = (state: RootState): AuthStatus => state.auth.status;
export const selectPermissions = (state: RootState): string[] => state.auth.permissions;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.status === 'authenticated';
