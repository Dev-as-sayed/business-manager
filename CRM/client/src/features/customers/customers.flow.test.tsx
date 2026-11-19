import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { baseApi } from '@/api/baseApi';
import { authReducer, setCredentials } from '@/features/auth/auth.slice';
import type { AuthUser } from '@/features/auth/auth.types';
import type { Customer } from '@/features/customers/customers.types';
import { CustomerDetailPage } from '@/features/customers/pages/CustomerDetailPage';
import { CustomersListPage } from '@/features/customers/pages/CustomersListPage';

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

const customer: Customer = {
  id: 'customer-1',
  name: 'Acme Trading',
  contactName: 'Nadia Rahman',
  email: 'nadia@acme.example',
  phone: '+8801700000000',
  address: '12 Port Road',
  city: 'Chattogram',
  country: 'Bangladesh',
  taxId: 'TIN-2048',
  notes: 'Prefers air freight.',
  status: 'ACTIVE',
  createdAt: '2026-01-10T09:00:00.000Z',
  updatedAt: '2026-02-10T09:00:00.000Z',
};

const server = setupServer(
  http.get('http://localhost:4000/api/v1/customers', () =>
    HttpResponse.json({
      success: true,
      message: 'Customers retrieved',
      data: [customer],
      meta: { page: 1, limit: 20, total: 1 },
    }),
  ),
  http.get('http://localhost:4000/api/v1/customers/customer-1', () =>
    HttpResponse.json({
      success: true,
      message: 'Customer retrieved',
      data: customer,
    }),
  ),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => server.close());

describe('customer flow', () => {
  it('lists customers and opens the detail record', async () => {
    const store = configureStore({
      reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    });
    store.dispatch(setCredentials(user));

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/customers']}>
          <Routes>
            <Route path="/customers" element={<CustomersListPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    const row = await screen.findByText('Acme Trading');
    expect(row).toBeInTheDocument();
    expect(screen.getByText('nadia@acme.example')).toBeInTheDocument();

    await userEvent.click(row);

    expect(await screen.findByText('Legal name')).toBeInTheDocument();
    expect(screen.getByText('TIN-2048')).toBeInTheDocument();
    expect(screen.getByText('Prefers air freight.')).toBeInTheDocument();
  });
});
