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
import { useListPurchaseOrdersQuery } from '@/features/purchase-orders/purchase-orders.api';
import {
  PURCHASE_ORDER_STATUS_OPTIONS,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from '@/features/purchase-orders/purchase-orders.types';
import { formatDate, formatMoney } from '@/shared/utils/format';

export default function OrdersScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PurchaseOrderStatus | undefined>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PurchaseOrder[]>([]);
  const debouncedSearch = useDebounce(search.trim());
  const filtersKey = `${debouncedSearch}|${status ?? ''}`;

  const query = useListPurchaseOrdersQuery({
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
      emptyTitle="No purchase orders yet"
      emptyMessage="Approved quotations become purchase orders that you can track here."
      header={
        <View className="gap-3">
          <PageHeader
            title="Orders"
            subtitle="Production and delivery status for every purchase order."
          />
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search order, supplier, or customer"
          />
          <FilterChips
            options={PURCHASE_ORDER_STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={item.orderNumber}
          subtitle={`${item.supplier?.name ?? 'Supplier'} · ${item._count.items} items · Expected ${formatDate(item.expectedDeliveryDate)}`}
          onPress={() =>
            router.push({ pathname: '/purchase-orders/[id]', params: { id: item.id } })
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
