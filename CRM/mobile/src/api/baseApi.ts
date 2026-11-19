import { Mutex } from 'async-mutex';
import { toast } from 'sonner-native';
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
} from '@reduxjs/toolkit/query/react';
import { env } from '@/config/env';
import { normalizeApiError } from '@/api/error';
import { tokenStore } from '@/api/token-store';
import { secureStorage } from '@/shared/storage/secureStorage';
import { sessionExpired, setCredentials } from '@/features/auth/auth.slice';
import type { AuthPayload } from '@/features/auth/auth.types';
import type { ApiEnvelope, NormalizedApiError } from '@/shared/types';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
  timeout: 20000,
  prepareHeaders: (headers) => {
    const token = tokenStore.get();

    headers.set('X-Client', 'mobile');

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
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/register') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password')
  );
};

const isGetRequest = (args: string | FetchArgs): boolean =>
  typeof args === 'string' || (args.method ?? 'GET').toUpperCase() === 'GET';

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const rawQueryWithRetry = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: object,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (isGetRequest(args) && result.error?.status === 'FETCH_ERROR') {
    await delay(500);
    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

const resetSession = async (api: BaseQueryApi): Promise<void> => {
  await secureStorage.clear();
  api.dispatch(sessionExpired());
  api.dispatch(baseApi.util.resetApiState());
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, NormalizedApiError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawQueryWithRetry(args, api, extraOptions);

  if (!result.error || result.error.status !== 401 || isPublicAuthCall(args)) {
    return result.error ? { ...result, error: normalizeApiError(result.error) } : result;
  }

  const tokenBeforeRefresh = tokenStore.get();

  const refreshed = await refreshMutex.runExclusive(async () => {
    if (tokenStore.get() !== tokenBeforeRefresh) {
      return true;
    }

    const refreshToken = await secureStorage.getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        headers: { 'X-Client': 'mobile' },
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    if (!refreshResult.data) {
      return false;
    }

    const envelope = refreshResult.data as ApiEnvelope<AuthPayload>;

    if (!envelope.data.refreshToken) {
      return false;
    }

    await secureStorage.setTokens({
      accessToken: envelope.data.accessToken,
      refreshToken: envelope.data.refreshToken,
    });

    if (envelope.data.user) {
      api.dispatch(setCredentials(envelope.data.user));
    }

    return true;
  });

  if (!refreshed) {
    await resetSession(api);
    toast.error('Your session has expired. Sign in again.');
    return { ...result, error: normalizeApiError(result.error) };
  }

  result = await rawQueryWithRetry(args, api, extraOptions);

  if (result.error) {
    if (result.error.status === 401) {
      await resetSession(api);
      toast.error('Your session has expired. Sign in again.');
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
    'ProductRequest',
    'Quotation',
    'PurchaseOrder',
    'QcReport',
    'Shipment',
    'CustomsRecord',
    'LedgerEntry',
    'Attachment',
    'Notification',
    'Dashboard',
  ],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

export type { NormalizedApiError };
