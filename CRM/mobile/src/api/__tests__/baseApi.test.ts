import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { baseApi } from '@/api/baseApi';
import { tokenStore } from '@/api/token-store';
import { authApi } from '@/features/auth/auth.api';
import { authReducer } from '@/features/auth/auth.slice';
import type { AuthUser } from '@/features/auth/auth.types';
import { secureStorage } from '@/shared/storage/secureStorage';

jest.mock('sonner-native', () => ({
  toast: { error: jest.fn(), success: jest.fn(), warning: jest.fn() },
}));

jest.mock('@/shared/storage/secureStorage', () => ({
  secureStorage: {
    getRefreshToken: jest.fn(),
    peekRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clear: jest.fn(),
  },
}));

const apiUrl = 'http://localhost:4000/api/v1';

const user: AuthUser = {
  id: 'user-1',
  email: 'admin@crm.local',
  firstName: 'Ada',
  lastName: 'Admin',
  role: 'ADMIN',
  permissions: ['orders:read'],
  phone: null,
  status: 'ACTIVE',
  customerId: null,
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

let meCalls = 0;
let refreshCalls = 0;

const server = setupServer(
  http.get(`${apiUrl}/auth/me`, ({ request }) => {
    meCalls += 1;

    if (request.headers.get('authorization') === 'Bearer new-access-token') {
      return HttpResponse.json({ data: user });
    }

    return HttpResponse.json({ message: 'Expired' }, { status: 401 });
  }),
  http.post(`${apiUrl}/auth/refresh`, async ({ request }) => {
    refreshCalls += 1;
    const body = (await request.json()) as { refreshToken?: string };

    if (body.refreshToken !== 'refresh-token') {
      return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
    }

    return HttpResponse.json({
      data: {
        user,
        accessToken: 'new-access-token',
        refreshToken: 'rotated-refresh-token',
      },
    });
  }),
);

const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

beforeAll(() => {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    callback(Date.now());
    return 0;
  };
  globalThis.cancelAnimationFrame = () => undefined;
  server.listen({ onUnhandledRequest: 'error' });
});

beforeEach(() => {
  meCalls = 0;
  refreshCalls = 0;
  tokenStore.set('expired-access-token');
  jest.mocked(secureStorage.getRefreshToken).mockResolvedValue('refresh-token');
  jest.mocked(secureStorage.peekRefreshToken).mockReturnValue('refresh-token');
  jest.mocked(secureStorage.setTokens).mockImplementation(async ({ accessToken }) => {
    tokenStore.set(accessToken);
  });
  jest.mocked(secureStorage.clear).mockImplementation(async () => {
    tokenStore.clear();
  });
});

afterEach(() => {
  server.resetHandlers();
  tokenStore.clear();
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
  globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
});

describe('baseQueryWithReauth', () => {
  it('refreshes an expired access token once and retries the request', async () => {
    const store = makeStore();

    const data = await store.dispatch(authApi.endpoints.me.initiate()).unwrap();

    expect(data).toEqual(user);
    expect(meCalls).toBe(2);
    expect(refreshCalls).toBe(1);
    expect(tokenStore.get()).toBe('new-access-token');
    expect(secureStorage.setTokens).toHaveBeenCalledWith({
      accessToken: 'new-access-token',
      refreshToken: 'rotated-refresh-token',
    });
    expect(store.getState().auth.status).toBe('authenticated');
  });

  it('clears the session when refresh fails', async () => {
    const store = makeStore();
    jest.mocked(secureStorage.getRefreshToken).mockResolvedValue('invalid-refresh-token');

    await store
      .dispatch(authApi.endpoints.me.initiate())
      .unwrap()
      .catch(() => undefined);
    expect(meCalls).toBe(1);
    expect(refreshCalls).toBe(1);
    expect(tokenStore.get()).toBeNull();
    expect(secureStorage.clear).toHaveBeenCalled();
    expect(store.getState().auth.status).toBe('unauthenticated');
  });
});
