import {
  authReducer,
  bootstrapStarted,
  sessionExpired,
  setCredentials,
  setIntendedPath,
  setUnauthenticated,
} from '@/features/auth/auth.slice';
import type { AuthUser } from '@/features/auth/auth.types';

const user: AuthUser = {
  id: 'user-1',
  email: 'admin@crm.local',
  firstName: 'Ada',
  lastName: 'Admin',
  role: 'ADMIN',
  permissions: ['quotations:read', 'quotations:approve'],
  phone: null,
  status: 'ACTIVE',
  customerId: null,
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('auth slice', () => {
  it('starts in idle and enters loading during bootstrap', () => {
    const initial = authReducer(undefined, { type: 'unknown' });
    expect(initial.status).toBe('idle');

    const loading = authReducer(initial, bootstrapStarted());
    expect(loading.status).toBe('loading');
  });

  it('stores credentials and exposes permissions', () => {
    const authenticated = authReducer(undefined, setCredentials(user));

    expect(authenticated.status).toBe('authenticated');
    expect(authenticated.user?.email).toBe('admin@crm.local');
    expect(authenticated.permissions).toEqual(['quotations:read', 'quotations:approve']);
  });

  it('clears session data on logout and preserves intended path only until sign-out', () => {
    let state = authReducer(undefined, setCredentials(user));
    state = authReducer(state, setIntendedPath('/orders/123'));
    expect(state.intendedPath).toBe('/orders/123');

    state = authReducer(state, setUnauthenticated());
    expect(state.user).toBeNull();
    expect(state.permissions).toEqual([]);
    expect(state.status).toBe('unauthenticated');
    expect(state.intendedPath).toBeNull();
  });

  it('expires a session without needing an API call', () => {
    const state = authReducer(authReducer(undefined, setCredentials(user)), sessionExpired());

    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
  });
});
