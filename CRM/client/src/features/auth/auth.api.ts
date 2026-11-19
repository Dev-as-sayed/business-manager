import { baseApi } from '@/api/baseApi';
import { desktopAuth } from '@/api/desktop-auth';
import { unwrap, withSuccessToast } from '@/api/helpers';
import { tokenStore } from '@/api/token-store';
import { setCredentials, setUnauthenticated } from '@/features/auth/auth.slice';
import type {
  AuthPayload,
  AuthUser,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  PasswordResetResult,
  ResetPasswordInput,
} from '@/features/auth/auth.types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthPayload, LoginInput>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: async (response) => {
        const payload = unwrap<AuthPayload>(response);
        tokenStore.set(payload.accessToken);
        await desktopAuth.persistRefreshToken(payload.refreshToken);
        return payload;
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.user));
        } catch {
          // The submit handler owns the error UI.
        }
      },
      invalidatesTags: ['Auth'],
    }),
    logout: build.mutation<null, void>({
      query: () => {
        const refreshToken = desktopAuth.peekRefreshToken();
        return {
          url: '/auth/logout',
          method: 'POST',
          body: refreshToken ? { refreshToken } : {},
        };
      },
      transformResponse: unwrap<null>,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch {
          // Logging out locally still matters if the server call fails.
        } finally {
          await desktopAuth.clearRefreshToken();
          tokenStore.clear();
          dispatch(setUnauthenticated());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
    me: build.query<AuthUser, void>({
      query: () => '/auth/me',
      transformResponse: unwrap<AuthUser>,
      providesTags: ['Auth'],
    }),
    refresh: build.mutation<AuthPayload, void>({
      query: () => {
        const refreshToken = desktopAuth.peekRefreshToken();
        return {
          url: '/auth/refresh',
          method: 'POST',
          body: refreshToken ? { refreshToken } : {},
        };
      },
      transformResponse: async (response) => {
        const payload = unwrap<AuthPayload>(response);
        tokenStore.set(payload.accessToken);
        await desktopAuth.persistRefreshToken(payload.refreshToken);
        return payload;
      },
    }),
    forgotPassword: build.mutation<PasswordResetResult | null, ForgotPasswordInput>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
      transformResponse: unwrap<PasswordResetResult | null>,
    }),
    resetPassword: build.mutation<null, ResetPasswordInput>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
      transformResponse: withSuccessToast<null>(),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          await desktopAuth.clearRefreshToken();
        } catch {
          return;
        }
      },
    }),
    changePassword: build.mutation<null, ChangePasswordInput>({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
      transformResponse: withSuccessToast<null>(),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          await desktopAuth.clearRefreshToken();
        } catch {
          return;
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useRefreshMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
