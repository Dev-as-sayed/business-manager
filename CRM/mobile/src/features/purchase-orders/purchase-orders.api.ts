import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type {
  PurchaseOrder,
  PurchaseOrderListArgs,
  PurchaseOrderStatus,
} from '@/features/purchase-orders/purchase-orders.types';
import type { Paginated } from '@/shared/types';

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
    approvePurchaseOrder: build.mutation<PurchaseOrder, string>({
      query: (id) => ({ url: `/purchase-orders/${id}/approve`, method: 'PATCH' }),
      transformResponse: withSuccessToast<PurchaseOrder>(),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
      ],
    }),
    updatePurchaseOrderStatus: build.mutation<
      PurchaseOrder,
      { id: string; status: PurchaseOrderStatus }
    >({
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
  }),
});

export const {
  useListPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useApprovePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
} = purchaseOrdersApi;
