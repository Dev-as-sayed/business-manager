import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { baseApi } from '@/api/baseApi';
import { tokenStore } from '@/api/token-store';
import { authReducer, setUnauthenticated } from '@/features/auth/auth.slice';
import type { AuthUser } from '@/features/auth/auth.types';
import { unwrap } from '@/api/helpers';

const user: AuthUser = {
  id: 'user-1',
  email: 'admin@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  phone: null,
  status: 'ACTIVE',
  role: 'ADMIN',
  permissions: ['customers:read'],
  customerId: null,
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const testApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    testPing: build.query<string, void>({
      query: () => '/test/ping',
      transformResponse: unwrap<string>,
    }),
  }),
});

const server = setupServer();
const API = 'http://localhost:4000/api/v1';

const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  server.resetHandlers();
  tokenStore.clear();
});

afterAll(() => server.close());

describe('baseQueryWithReauth', () => {
  it('refreshes once on 401, updates the token and retries the original request', async () => {
    const store = createTestStore();
    tokenStore.set('stale-token');
    let pingCount = 0;

    server.use(
      http.get(`${API}/test/ping`, ({ request }) => {
        pingCount += 1;

        if (pingCount === 1) {
          return HttpResponse.json(
            { success: false, message: 'Expired', errors: [] },
            { status: 401 },
          );
        }

        expect(request.headers.get('authorization')).toBe('Bearer fresh-token');
        return HttpResponse.json({ success: true, message: 'OK', data: 'pong' });
      }),
      http.post(`${API}/auth/refresh`, () =>
        HttpResponse.json({
          success: true,
          message: 'Refreshed',
          data: { user, accessToken: 'fresh-token' },
        }),
      ),
    );

    const result = await store.dispatch(testApi.endpoints.testPing.initiate()).unwrap();

    expect(result).toBe('pong');
    expect(pingCount).toBe(2);
    expect(tokenStore.get()).toBe('fresh-token');
    expect(store.getState().auth.user?.id).toBe(user.id);
  });

  it('clears the session when refresh fails', async () => {
    const store = createTestStore();
    store.dispatch(setUnauthenticated());
    tokenStore.set('stale-token');

    server.use(
      http.get(`${API}/test/ping`, () =>
        HttpResponse.json(
          { success: false, message: 'Expired', errors: [] },
          { status: 401 },
        ),
      ),
      http.post(`${API}/auth/refresh`, () =>
        HttpResponse.json(
          { success: false, message: 'Refresh expired', errors: [] },
          { status: 401 },
        ),
      ),
    );

    await store.dispatch(testApi.endpoints.testPing.initiate());

    expect(tokenStore.get()).toBeNull();
    expect(store.getState().auth.status).toBe('unauthenticated');
  });
});
