import { baseApi } from '@/api/baseApi';
import { unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  CreateQcReportInput,
  QcReport,
  QcReportListArgs,
  UpdateQcReportInput,
  UpdateQcReportStatusInput,
} from '@/features/quality-control/quality-control.types';

export const qualityControlApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listQcReports: build.query<Paginated<QcReport>, QcReportListArgs | void>({
      query: (args) => ({ url: '/quality-control', params: args ?? {} }),
      transformResponse: unwrapList<QcReport>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'QcReport' as const, id: item.id })),
              { type: 'QcReport' as const, id: 'LIST' },
            ]
          : [{ type: 'QcReport' as const, id: 'LIST' }],
    }),
    getQcReport: build.query<QcReport, string>({
      query: (id) => `/quality-control/${id}`,
      transformResponse: unwrap<QcReport>,
      providesTags: (_result, _error, id) => [{ type: 'QcReport', id }],
    }),
    createQcReport: build.mutation<QcReport, CreateQcReportInput>({
      query: (body) => ({ url: '/quality-control', method: 'POST', body }),
      transformResponse: withSuccessToast<QcReport>(),
      invalidatesTags: [{ type: 'QcReport', id: 'LIST' }],
    }),
    updateQcReport: build.mutation<QcReport, { id: string; body: UpdateQcReportInput }>({
      query: ({ id, body }) => ({ url: `/quality-control/${id}`, method: 'PATCH', body }),
      transformResponse: withSuccessToast<QcReport>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'QcReport', id },
        { type: 'QcReport', id: 'LIST' },
      ],
    }),
    updateQcReportStatus: build.mutation<QcReport, UpdateQcReportStatusInput>({
      query: ({ id, status }) => ({
        url: `/quality-control/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: withSuccessToast<QcReport>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'QcReport', id },
        { type: 'QcReport', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListQcReportsQuery,
  useGetQcReportQuery,
  useCreateQcReportMutation,
  useUpdateQcReportMutation,
  useUpdateQcReportStatusMutation,
} = qualityControlApi;
