import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { baseApi } from '@/api/baseApi';
import {
  authReducer,
  setCredentials,
  setUnauthenticated,
} from '@/features/auth/auth.slice';
import type { AuthUser } from '@/features/auth/auth.types';
import { PermissionGuard } from '@/shared/guards/PermissionGuard';
import { ProtectedRoute } from '@/shared/guards/ProtectedRoute';
import { RoleGuard } from '@/shared/guards/RoleGuard';

const user: AuthUser = {
  id: 'user-1',
  email: 'sales@example.com',
  firstName: 'Grace',
  lastName: 'Hopper',
  phone: null,
  status: 'ACTIVE',
  role: 'SALES',
  permissions: ['customers:read'],
  customerId: null,
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const createTestStore = (currentUser: AuthUser | null) => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

  store.dispatch(currentUser ? setCredentials(currentUser) : setUnauthenticated());
  return store;
};

const renderRoute = (component: ReactNode, currentUser: AuthUser | null) => {
  const store = createTestStore(currentUser);

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/403" element={<div>Restricted page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/secret" element={component} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('route guards', () => {
  it('redirects unauthenticated visitors to login', () => {
    renderRoute(<div>Protected content</div>, null);

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    renderRoute(<div>Protected content</div>, user);

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects users without the required permission to /403', () => {
    renderRoute(
      <PermissionGuard resource="users" action="read">
        <div>User admin</div>
      </PermissionGuard>,
      user,
    );

    expect(screen.getByText('Restricted page')).toBeInTheDocument();
  });

  it('allows users with the required permission', () => {
    renderRoute(
      <PermissionGuard resource="customers" action="read">
        <div>Customer list</div>
      </PermissionGuard>,
      user,
    );

    expect(screen.getByText('Customer list')).toBeInTheDocument();
  });

  it('blocks roles outside the allowed list', () => {
    renderRoute(
      <RoleGuard roles={['ADMIN']}>
        <div>Admin area</div>
      </RoleGuard>,
      user,
    );

    expect(screen.getByText('Restricted page')).toBeInTheDocument();
  });
});
