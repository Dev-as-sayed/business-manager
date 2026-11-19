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
import { useListShipmentsQuery } from '@/features/shipments/shipments.api';
import {
  SHIPMENT_STATUS_OPTIONS,
  type Shipment,
  type ShipmentStatus,
} from '@/features/shipments/shipments.types';
import { formatDate } from '@/shared/utils/format';

export default function ShipmentsScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ShipmentStatus | undefined>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Shipment[]>([]);
  const debouncedSearch = useDebounce(search.trim());
  const filtersKey = `${debouncedSearch}|${status ?? ''}`;

  const query = useListShipmentsQuery({
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
      emptyTitle="No shipments yet"
      emptyMessage="Shipments created from purchase orders will appear here with live tracking."
      header={
        <View className="gap-3">
          <PageHeader
            title="Shipments"
            subtitle="Carrier tracking, delivery dates, and package status."
          />
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search shipment, tracking, or customer"
          />
          <FilterChips options={SHIPMENT_STATUS_OPTIONS} value={status} onChange={setStatus} />
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={item.shipmentNumber}
          subtitle={`${item.customer?.name ?? 'Customer'} · ${item.carrier ?? 'Carrier pending'} · ETA ${formatDate(item.estimatedDeliveryDate)}`}
          onPress={() => router.push({ pathname: '/shipments/[id]', params: { id: item.id } })}
          left={
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-jade-50">
              <Text className="text-[11px] font-bold text-jade-700">SHP</Text>
            </View>
          }
          right={
            <View className="items-end gap-1">
              <StatusBadge status={item.status} />
              <Text className="text-[11px] text-ink-400">
                {item._count.items} {item._count.items === 1 ? 'item' : 'items'}
              </Text>
            </View>
          }
        />
      )}
    />
  );
}
