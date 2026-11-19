import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  CreateCustomsRecordInput,
  CustomsRecord,
  CustomsListArgs,
  UpdateCustomsRecordInput,
  UpdateCustomsStatusInput,
} from '@/features/customs/customs.types';

export const customsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listCustomsRecords: build.query<Paginated<CustomsRecord>, CustomsListArgs | void>({
      query: (args) => ({ url: '/customs', params: args ?? {} }),
      transformResponse: unwrapList<CustomsRecord>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'CustomsRecord' as const, id: item.id })),
              { type: 'CustomsRecord' as const, id: 'LIST' },
            ]
          : [{ type: 'CustomsRecord' as const, id: 'LIST' }],
    }),
    getCustomsRecord: build.query<CustomsRecord, string>({
      query: (id) => `/customs/${id}`,
      transformResponse: unwrap<CustomsRecord>,
      providesTags: (_result, _error, id) => [{ type: 'CustomsRecord', id }],
    }),
    createCustomsRecord: build.mutation<CustomsRecord, CreateCustomsRecordInput>({
      query: (body) => ({ url: '/customs', method: 'POST', body }),
      transformResponse: withSuccessToast<CustomsRecord>(),
      invalidatesTags: [{ type: 'CustomsRecord', id: 'LIST' }],
    }),
    updateCustomsRecord: build.mutation<
      CustomsRecord,
      { id: string; body: UpdateCustomsRecordInput }
    >({
      query: ({ id, body }) => ({ url: `/customs/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<CustomsRecord>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CustomsRecord', id },
        { type: 'CustomsRecord', id: 'LIST' },
      ],
    }),
    updateCustomsStatus: build.mutation<CustomsRecord, UpdateCustomsStatusInput>({
      query: ({ id, status }) => ({
        url: `/customs/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<CustomsRecord>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CustomsRecord', id },
        { type: 'CustomsRecord', id: 'LIST' },
      ],
    }),
    deleteCustomsRecord: build.mutation<null, string>({
      query: (id) => ({ url: `/customs/${id}`, method: 'DELETE' }),
      transformResponse: withSuccessToast<null>(),
      invalidatesTags: [{ type: 'CustomsRecord', id: 'LIST' }],
    }),
  }),
});

export const {
  useListCustomsRecordsQuery,
  useGetCustomsRecordQuery,
  useCreateCustomsRecordMutation,
  useUpdateCustomsRecordMutation,
  useUpdateCustomsStatusMutation,
  useDeleteCustomsRecordMutation,
} = customsApi;
