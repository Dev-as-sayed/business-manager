import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  Customer,
  CustomerInput,
  CustomerListArgs,
  CustomerStatus,
  UpdateCustomerStatusInput,
} from '@/features/customers/customers.types';

export const customersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listCustomers: build.query<Paginated<Customer>, CustomerListArgs | void>({
      query: (args) => ({ url: '/customers', params: args ?? {} }),
      transformResponse: unwrapList<Customer>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Customer' as const, id: item.id })),
              { type: 'Customer' as const, id: 'LIST' },
            ]
          : [{ type: 'Customer' as const, id: 'LIST' }],
    }),
    getCustomer: build.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      transformResponse: unwrap<Customer>,
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: build.mutation<Customer, CustomerInput>({
      query: (body) => ({ url: '/customers', method: 'POST', body }),
      transformResponse: withSuccessToast<Customer>(),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    updateCustomer: build.mutation<Customer, { id: string; body: Partial<CustomerInput> }>({
      query: ({ id, body }) => ({ url: `/customers/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<Customer>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
    updateCustomerStatus: build.mutation<Customer, UpdateCustomerStatusInput>({
      query: ({ id, status }) => ({
        url: `/customers/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<Customer>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
    deleteCustomer: build.mutation<null, string>({
      query: (id) => ({ url: `/customers/${id}`, method: 'DELETE' }),
      transformResponse: withSuccessToast<null>(),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
  }),
});

export const {
  useListCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useUpdateCustomerStatusMutation,
  useDeleteCustomerMutation,
} = customersApi;

export type { CustomerStatus };
