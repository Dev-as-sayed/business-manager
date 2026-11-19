/* eslint-disable react-hooks/set-state-in-effect -- accumulate paginated RTK Query results into a local list */
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { ListScreen } from '@/shared/components/ListScreen';
import { PageHeader } from '@/shared/components/Screen';
import { SearchBar } from '@/shared/components/SearchBar';
import { FilterChips } from '@/shared/components/FilterChips';
import { ListRow } from '@/shared/components/StateViews';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useListQuotationsQuery } from '@/features/quotations/quotations.api';
import {
  QUOTATION_STATUS_OPTIONS,
  type Quotation,
  type QuotationStatus,
} from '@/features/quotations/quotations.types';
import { formatDate, formatMoney } from '@/shared/utils/format';

export default function QuotationsScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QuotationStatus | undefined>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Quotation[]>([]);
  const debouncedSearch = useDebounce(search.trim());
  const filtersKey = `${debouncedSearch}|${status ?? ''}`;

  const query = useListQuotationsQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status,
  });

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [filtersKey]);

  useEffect(() => {
    if (!query.data) return;
    const data = query.data;

    setItems((previous) => {
      if (page === 1) return data.items;
      const known = new Set(previous.map((item) => item.id));
      return [...previous, ...data.items.filter((item) => !known.has(item.id))];
    });
  }, [page, query.data]);

  const hasMore = Boolean(query.data && items.length < query.data.meta.total);

  return (
    <ListScreen
      data={items}
      keyExtractor={(item) => item.id}
      loading={query.isLoading}
      refreshing={query.isFetching && page === 1 && items.length > 0}
      fetchingMore={query.isFetching && page > 1}
      error={items.length === 0 ? query.error?.message : null}
      onRetry={() => void query.refetch()}
      onRefresh={() => {
        setPage(1);
        setItems([]);
        void query.refetch();
      }}
      onEndReached={() => {
        if (hasMore && !query.isFetching) setPage((current) => current + 1);
      }}
      emptyTitle="No quotations yet"
      emptyMessage="Quotes sent to customers will appear here for review and approval."
      header={
        <View className="gap-3">
          <PageHeader title="Quotations" subtitle="Pricing, validity, and customer approvals." />
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search quotation or customer"
          />
          <FilterChips options={QUOTATION_STATUS_OPTIONS} value={status} onChange={setStatus} />
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={item.quotationNumber}
          subtitle={`${item.customer?.name ?? 'Customer'} · ${item.productRequest?.title ?? 'Direct quote'} · ${formatDate(item.createdAt)}`}
          onPress={() => router.push({ pathname: '/quotations/[id]', params: { id: item.id } })}
          left={
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Text className="text-[12px] font-bold text-amber-700">
                {item.currency.slice(0, 3)}
              </Text>
            </View>
          }
          right={
            <View className="items-end gap-1">
              <StatusBadge status={item.status} />
              <Text className="text-[13px] font-bold text-ink-800">
                {formatMoney(item.total, item.currency)}
              </Text>
            </View>
          }
        />
      )}
    />
  );
}
