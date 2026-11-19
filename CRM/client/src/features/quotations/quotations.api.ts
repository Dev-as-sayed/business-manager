import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  CreateQuotationInput,
  Quotation,
  QuotationListArgs,
  UpdateQuotationInput,
  UpdateQuotationStatusInput,
} from '@/features/quotations/quotations.types';

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
    createQuotation: build.mutation<Quotation, CreateQuotationInput>({
      query: (body) => ({ url: '/quotations', method: 'POST', body }),
      transformResponse: withSuccessToast<Quotation>(),
      invalidatesTags: [
        { type: 'Quotation', id: 'LIST' },
        { type: 'ProductRequest', id: 'LIST' },
      ],
    }),
    updateQuotation: build.mutation<Quotation, { id: string; body: UpdateQuotationInput }>({
      query: ({ id, body }) => ({ url: `/quotations/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<Quotation>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Quotation', id },
        { type: 'Quotation', id: 'LIST' },
      ],
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
        { type: 'ProductRequest', id: 'LIST' },
      ],
    }),
    approveQuotation: build.mutation<Quotation, string>({
      query: (id) => ({ url: `/quotations/${id}/approve`, method: 'PATCH' }),
      transformResponse: withSuccessToast<Quotation>(),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Quotation', id },
        { type: 'Quotation', id: 'LIST' },
        { type: 'ProductRequest', id: 'LIST' },
      ],
    }),
    deleteQuotation: build.mutation<null, string>({
      query: (id) => ({ url: `/quotations/${id}`, method: 'DELETE' }),
      transformResponse: withSuccessToast<null>(),
      invalidatesTags: [
        { type: 'Quotation', id: 'LIST' },
        { type: 'ProductRequest', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListQuotationsQuery,
  useGetQuotationQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useUpdateQuotationStatusMutation,
  useApproveQuotationMutation,
  useDeleteQuotationMutation,
} = quotationsApi;
