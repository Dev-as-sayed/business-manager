import { baseApi } from '@/api/baseApi';
import { buildQuery, unwrap, unwrapList, withSuccessToast } from '@/api/helpers';
import { tokenStore } from '@/api/token-store';
import { env } from '@/app/env';
import type { Paginated } from '@/shared/types';
import type {
  CreateLedgerEntryInput,
  LedgerEntry,
  LedgerListArgs,
  PurchaseOrderProfit,
  UpdateLedgerEntryInput,
} from '@/features/finance/finance.types';

export const financeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listLedgerEntries: build.query<Paginated<LedgerEntry>, LedgerListArgs | void>({
      query: (args) => ({ url: '/finance/ledger-entries', params: args ?? {} }),
      transformResponse: unwrapList<LedgerEntry>,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'LedgerEntry' as const, id: item.id })),
              { type: 'LedgerEntry' as const, id: 'LIST' },
            ]
          : [{ type: 'LedgerEntry' as const, id: 'LIST' }],
    }),
    getLedgerEntry: build.query<LedgerEntry, string>({
      query: (id) => `/finance/ledger-entries/${id}`,
      transformResponse: unwrap<LedgerEntry>,
      providesTags: (_result, _error, id) => [{ type: 'LedgerEntry', id }],
    }),
    createLedgerEntry: build.mutation<LedgerEntry, CreateLedgerEntryInput>({
      query: (body) => ({ url: '/finance/ledger-entries', method: 'POST', body }),
      transformResponse: withSuccessToast<LedgerEntry>(),
      invalidatesTags: [{ type: 'LedgerEntry', id: 'LIST' }],
    }),
    updateLedgerEntry: build.mutation<
      LedgerEntry,
      { id: string; body: UpdateLedgerEntryInput }
    >({
      query: ({ id, body }) => ({
        url: `/finance/ledger-entries/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: withSuccessToast<LedgerEntry>(),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'LedgerEntry', id },
        { type: 'LedgerEntry', id: 'LIST' },
      ],
    }),
    approveLedgerEntry: build.mutation<LedgerEntry, string>({
      query: (id) => ({
        url: `/finance/ledger-entries/${id}/approve`,
        method: 'PATCH',
      }),
      transformResponse: withSuccessToast<LedgerEntry>(),
      invalidatesTags: (_result, _error, id) => [
        { type: 'LedgerEntry', id },
        { type: 'LedgerEntry', id: 'LIST' },
      ],
    }),
    voidLedgerEntry: build.mutation<LedgerEntry, string>({
      query: (id) => ({
        url: `/finance/ledger-entries/${id}/void`,
        method: 'PATCH',
      }),
      transformResponse: withSuccessToast<LedgerEntry>(),
      invalidatesTags: (_result, _error, id) => [
        { type: 'LedgerEntry', id },
        { type: 'LedgerEntry', id: 'LIST' },
      ],
    }),
    getPurchaseOrderProfit: build.query<PurchaseOrderProfit, string>({
      query: (purchaseOrderId) => ({
        url: '/finance/profit',
        params: { purchaseOrderId },
      }),
      transformResponse: unwrap<PurchaseOrderProfit>,
      providesTags: (_result, _error, purchaseOrderId) => [
        { type: 'LedgerEntry', id: `PROFIT-${purchaseOrderId}` },
      ],
    }),
  }),
});

export const {
  useListLedgerEntriesQuery,
  useGetLedgerEntryQuery,
  useCreateLedgerEntryMutation,
  useUpdateLedgerEntryMutation,
  useApproveLedgerEntryMutation,
  useVoidLedgerEntryMutation,
  useGetPurchaseOrderProfitQuery,
} = financeApi;

export const downloadLedgerCsv = async (
  args: Omit<LedgerListArgs, 'page' | 'limit'> = {},
): Promise<void> => {
  const token = tokenStore.get();
  const response = await fetch(
    `${env.VITE_API_URL}/finance/ledger-entries/export${buildQuery(args)}`,
    {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error('Ledger export failed. Please try again.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ledger-entries.csv';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
