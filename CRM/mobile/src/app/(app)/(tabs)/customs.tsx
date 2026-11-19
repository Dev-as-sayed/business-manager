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
import { useListCustomsRecordsQuery } from '@/features/customs/customs.api';
import {
  CUSTOMS_STATUS_OPTIONS,
  type CustomsRecord,
  type CustomsStatus,
} from '@/features/customs/customs.types';
import { formatDate, formatMoney } from '@/shared/utils/format';

export default function CustomsScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomsStatus | undefined>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CustomsRecord[]>([]);
  const debouncedSearch = useDebounce(search.trim());
  const filtersKey = `${debouncedSearch}|${status ?? ''}`;

  const query = useListCustomsRecordsQuery({
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
      emptyTitle="No customs records"
      emptyMessage="Declarations, duties, and clearance status for shipments will appear here."
      header={
        <View className="gap-3">
          <PageHeader
            title="Customs"
            subtitle="Declarations, duties, taxes, and clearance status."
          />
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search declaration, shipment, or country"
          />
          <FilterChips options={CUSTOMS_STATUS_OPTIONS} value={status} onChange={setStatus} />
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={item.recordNumber}
          subtitle={`${item.shipment?.shipmentNumber ?? 'Shipment'} · ${item.customsOffice ?? 'Office pending'} · ${formatDate(item.createdAt)}`}
          onPress={() => router.push({ pathname: '/customs/[id]', params: { id: item.id } })}
          left={
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Text className="text-[11px] font-bold text-amber-700">CUS</Text>
            </View>
          }
          right={
            <View className="items-end gap-1">
              <StatusBadge status={item.status} />
              <Text className="text-[12px] font-bold text-ink-800">
                {formatMoney(item.totalAmount, item.currency)}
              </Text>
            </View>
          }
        />
      )}
    />
  );
}
