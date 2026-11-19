import { Mutex } from 'async-mutex';
import { toast } from 'sonner';
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
} from '@reduxjs/toolkit/query/react';
import { desktopAuth } from '@/api/desktop-auth';
import { normalizeApiError } from '@/api/error';
import { tokenStore } from '@/api/token-store';
import { env } from '@/app/env';
import { setCredentials, sessionExpired } from '@/features/auth/auth.slice';
import type { AuthPayload } from '@/features/auth/auth.types';
import type { ApiEnvelope, NormalizedApiError } from '@/shared/types';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = tokenStore.get();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const refreshMutex = new Mutex();

const isPublicAuthCall = (args: string | FetchArgs): boolean => {
  const url = typeof args === 'string' ? args : args.url;
  return (
    url.startsWith('/auth/login') ||
    url.startsWith('/auth/refresh') ||
    url.startsWith('/auth/register') ||
    url.startsWith('/auth/forgot-password') ||
    url.startsWith('/auth/reset-password')
  );
};

const expiredSession = (api: BaseQueryApi): void => {
  tokenStore.clear();
  void desktopAuth.clearRefreshToken();
  api.dispatch(sessionExpired());
  api.dispatch(baseApi.util.resetApiState());
  toast.error('Your session has expired. Sign in again.');
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, NormalizedApiError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (!result.error || result.error.status !== 401 || isPublicAuthCall(args)) {
    return result.error ? { ...result, error: normalizeApiError(result.error) } : result;
  }

  const tokenBeforeRefresh = tokenStore.get();

  const refreshed = await refreshMutex.runExclusive(async () => {
    if (tokenStore.get() !== tokenBeforeRefresh) {
      return true;
    }

    const refreshToken = await desktopAuth.getRefreshToken();
    const refreshResult = await rawBaseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: refreshToken ? { refreshToken } : {},
      },
      api,
      extraOptions,
    );

    if (!refreshResult.data) {
      return false;
    }

    const envelope = refreshResult.data as ApiEnvelope<AuthPayload>;
    tokenStore.set(envelope.data.accessToken);
    await desktopAuth.persistRefreshToken(envelope.data.refreshToken);

    if (envelope.data.user) {
      api.dispatch(setCredentials(envelope.data.user));
    }

    return true;
  });

  if (!refreshed) {
    expiredSession(api);
    return { ...result, error: normalizeApiError(result.error) };
  }

  result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      expiredSession(api);
    }

    return { ...result, error: normalizeApiError(result.error) };
  }

  return result;
};

const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  NormalizedApiError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithReauth(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 403) {
      toast.error(result.error.message || 'You do not have permission to do that.');
    }

    if (result.error.status === 429) {
      toast.warning('Too many requests. Wait a moment and try again.');
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'Auth',
    'Customer',
    'Supplier',
    'User',
    'Role',
    'ProductRequest',
    'Quotation',
    'PurchaseOrder',
    'QcReport',
    'Shipment',
    'CustomsRecord',
    'LedgerEntry',
    'Attachment',
  ],
  endpoints: () => ({}),
});

export type { NormalizedApiError };
