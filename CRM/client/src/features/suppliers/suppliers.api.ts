import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  Supplier,
  SupplierInput,
  SupplierListArgs,
  SupplierStatus,
  UpdateSupplierStatusInput,
} from '@/features/suppliers/suppliers.types';

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listSuppliers: build.query<Paginated<Supplier>, SupplierListArgs | void>({
      query: (args) => ({ url: '/suppliers', params: args ?? {} }),
      transformResponse: unwrapList<Supplier>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Supplier' as const, id: item.id })),
              { type: 'Supplier' as const, id: 'LIST' },
            ]
          : [{ type: 'Supplier' as const, id: 'LIST' }],
    }),
    getSupplier: build.query<Supplier, string>({
      query: (id) => `/suppliers/${id}`,
      transformResponse: unwrap<Supplier>,
      providesTags: (_result, _error, id) => [{ type: 'Supplier', id }],
    }),
    createSupplier: build.mutation<Supplier, SupplierInput>({
      query: (body) => ({ url: '/suppliers', method: 'POST', body }),
      transformResponse: withSuccessToast<Supplier>(),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
    updateSupplier: build.mutation<Supplier, { id: string; body: Partial<SupplierInput> }>({
      query: ({ id, body }) => ({ url: `/suppliers/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<Supplier>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),
    updateSupplierStatus: build.mutation<Supplier, UpdateSupplierStatusInput>({
      query: ({ id, status }) => ({
        url: `/suppliers/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<Supplier>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),
    deleteSupplier: build.mutation<null, string>({
      query: (id) => ({ url: `/suppliers/${id}`, method: 'DELETE' }),
      transformResponse: withSuccessToast<null>(),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
  }),
});

export const {
  useListSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useUpdateSupplierStatusMutation,
  useDeleteSupplierMutation,
} = suppliersApi;

export type { SupplierStatus };
