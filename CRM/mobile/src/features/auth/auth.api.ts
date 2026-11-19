import { baseApi } from '@/api/baseApi';
import { unwrap, withSuccessToast } from '@/api/helpers';
import { secureStorage } from '@/shared/storage/secureStorage';
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

const persistSession = async (payload: AuthPayload): Promise<AuthPayload> => {
  await secureStorage.setTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
  return payload;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthPayload, LoginInput>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: async (response) => persistSession(unwrap<AuthPayload>(response)),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.user));
        } catch {
          return;
        }
      },
      invalidatesTags: ['Auth'],
    }),
    logout: build.mutation<null, void>({
      query: () => {
        const refreshToken = secureStorage.peekRefreshToken();
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
          return;
        } finally {
          await secureStorage.clear();
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
        const refreshToken = secureStorage.peekRefreshToken();
        return {
          url: '/auth/refresh',
          method: 'POST',
          headers: { 'X-Client': 'mobile' },
          body: refreshToken ? { refreshToken } : {},
        };
      },
      transformResponse: async (response) => persistSession(unwrap<AuthPayload>(response)),
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
          await secureStorage.clear();
        } catch {
          return;
        }
      },
    }),
    changePassword: build.mutation<null, ChangePasswordInput>({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
      transformResponse: withSuccessToast<null>(),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          await secureStorage.clear();
          dispatch(setUnauthenticated());
          dispatch(baseApi.util.resetApiState());
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
