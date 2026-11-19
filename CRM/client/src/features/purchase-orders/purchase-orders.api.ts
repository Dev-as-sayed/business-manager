import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  CreatePurchaseOrderInput,
  PurchaseOrder,
  PurchaseOrderListArgs,
  UpdatePurchaseOrderInput,
  UpdatePurchaseOrderStatusInput,
} from '@/features/purchase-orders/purchase-orders.types';

export const purchaseOrdersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listPurchaseOrders: build.query<Paginated<PurchaseOrder>, PurchaseOrderListArgs | void>({
      query: (args) => ({ url: '/purchase-orders', params: args ?? {} }),
      transformResponse: unwrapList<PurchaseOrder>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'PurchaseOrder' as const, id: item.id })),
              { type: 'PurchaseOrder' as const, id: 'LIST' },
            ]
          : [{ type: 'PurchaseOrder' as const, id: 'LIST' }],
    }),
    getPurchaseOrder: build.query<PurchaseOrder, string>({
      query: (id) => `/purchase-orders/${id}`,
      transformResponse: unwrap<PurchaseOrder>,
      providesTags: (_result, _error, id) => [{ type: 'PurchaseOrder', id }],
    }),
    createPurchaseOrder: build.mutation<PurchaseOrder, CreatePurchaseOrderInput>({
      query: (body) => ({ url: '/purchase-orders', method: 'POST', body }),
      transformResponse: withSuccessToast<PurchaseOrder>(),
      invalidatesTags: [{ type: 'PurchaseOrder', id: 'LIST' }],
    }),
    updatePurchaseOrder: build.mutation<
      PurchaseOrder,
      { id: string; body: UpdatePurchaseOrderInput }
    >({
      query: ({ id, body }) => ({ url: `/purchase-orders/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<PurchaseOrder>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
      ],
    }),
    updatePurchaseOrderStatus: build.mutation<PurchaseOrder, UpdatePurchaseOrderStatusInput>({
      query: ({ id, status }) => ({
        url: `/purchase-orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<PurchaseOrder>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
      ],
    }),
    approvePurchaseOrder: build.mutation<PurchaseOrder, string>({
      query: (id) => ({ url: `/purchase-orders/${id}/approve`, method: 'PATCH' }),
      transformResponse: withSuccessToast<PurchaseOrder>(),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
      ],
    }),
    deletePurchaseOrder: build.mutation<null, string>({
      query: (id) => ({ url: `/purchase-orders/${id}`, method: 'DELETE' }),
      transformResponse: withSuccessToast<null>(),
      invalidatesTags: [{ type: 'PurchaseOrder', id: 'LIST' }],
    }),
  }),
});

export const {
  useListPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useApprovePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} = purchaseOrdersApi;
