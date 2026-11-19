import { baseApi } from '@/api/baseApi';
import { unwrapList } from '@/api/helpers';
import type { Customer, CustomerListArgs } from '@/features/customers/customers.types';
import type { Paginated } from '@/shared/types';

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
  }),
});

export const { useListCustomersQuery } = customersApi;
