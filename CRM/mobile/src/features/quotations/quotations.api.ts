import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type {
  Quotation,
  QuotationListArgs,
  UpdateQuotationStatusInput,
} from '@/features/quotations/quotations.types';
import type { Paginated } from '@/shared/types';

export const quotationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listQuotations: build.query<Paginated<Quotation>, QuotationListArgs | void>({
      query: (args) => ({ url: '/quotations', params: args ?? {} }),
      transformResponse: unwrapList<Quotation>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Quotation' as const, id: item.id })),
              { type: 'Quotation' as const, id: 'LIST' },
            ]
          : [{ type: 'Quotation' as const, id: 'LIST' }],
    }),
    getQuotation: build.query<Quotation, string>({
      query: (id) => `/quotations/${id}`,
      transformResponse: unwrap<Quotation>,
      providesTags: (_result, _error, id) => [{ type: 'Quotation', id }],
    }),
    updateQuotationStatus: build.mutation<Quotation, UpdateQuotationStatusInput>({
      query: ({ id, status }) => ({
        url: `/quotations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<Quotation>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Quotation', id },
        { type: 'Quotation', id: 'LIST' },
      ],
    }),
    approveQuotation: build.mutation<Quotation, string>({
      query: (id) => ({ url: `/quotations/${id}/approve`, method: 'PATCH' }),
      transformResponse: withSuccessToast<Quotation>(),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Quotation', id },
        { type: 'Quotation', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListQuotationsQuery,
  useGetQuotationQuery,
  useUpdateQuotationStatusMutation,
  useApproveQuotationMutation,
} = quotationsApi;
