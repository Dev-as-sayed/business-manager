import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type {
  Shipment,
  ShipmentListArgs,
  UpdateShipmentInput,
  UpdateShipmentStatusInput,
} from '@/features/shipments/shipments.types';
import type { Paginated } from '@/shared/types';

export const shipmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listShipments: build.query<Paginated<Shipment>, ShipmentListArgs | void>({
      query: (args) => ({ url: '/shipments', params: args ?? {} }),
      transformResponse: unwrapList<Shipment>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Shipment' as const, id: item.id })),
              { type: 'Shipment' as const, id: 'LIST' },
            ]
          : [{ type: 'Shipment' as const, id: 'LIST' }],
    }),
    getShipment: build.query<Shipment, string>({
      query: (id) => `/shipments/${id}`,
      transformResponse: unwrap<Shipment>,
      providesTags: (_result, _error, id) => [{ type: 'Shipment', id }],
    }),
    updateShipment: build.mutation<Shipment, { id: string; body: UpdateShipmentInput }>({
      query: ({ id, body }) => ({ url: `/shipments/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<Shipment>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Shipment', id },
        { type: 'Shipment', id: 'LIST' },
      ],
    }),
    updateShipmentStatus: build.mutation<Shipment, UpdateShipmentStatusInput>({
      query: ({ id, status }) => ({
        url: `/shipments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<Shipment>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Shipment', id },
        { type: 'Shipment', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListShipmentsQuery,
  useGetShipmentQuery,
  useUpdateShipmentMutation,
  useUpdateShipmentStatusMutation,
} = shipmentsApi;
