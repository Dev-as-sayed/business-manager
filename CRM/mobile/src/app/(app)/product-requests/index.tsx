/* eslint-disable react-hooks/set-state-in-effect -- accumulate paginated RTK Query results into a local list */
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { ListScreen } from '@/shared/components/ListScreen';
import { PageHeader } from '@/shared/components/Screen';
import { SearchBar } from '@/shared/components/SearchBar';
import { FilterChips } from '@/shared/components/FilterChips';
import { ListRow } from '@/shared/components/StateViews';
import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { usePermission } from '@/shared/hooks/usePermission';
import { useListProductRequestsQuery } from '@/features/product-requests/product-requests.api';
import {
  PRODUCT_REQUEST_STATUS_OPTIONS,
  type ProductRequest,
  type ProductRequestStatus,
} from '@/features/product-requests/product-requests.types';
import { formatDate } from '@/shared/utils/format';

export default function ProductRequestsScreen() {
  const { can } = usePermission();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProductRequestStatus | undefined>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ProductRequest[]>([]);
  const debouncedSearch = useDebounce(search.trim());
  const filtersKey = `${debouncedSearch}|${status ?? ''}`;

  const query = useListProductRequestsQuery({
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
      if (page === 1) {
        return data.items;
      }

      const known = new Set(previous.map((item) => item.id));
      return [...previous, ...data.items.filter((item) => !known.has(item.id))];
    });
  }, [page, query.data]);

  const hasMore = Boolean(query.data && items.length < query.data.meta.total);
  const error = query.error?.message;

  return (
    <ListScreen
      data={items}
      keyExtractor={(item) => item.id}
      loading={query.isLoading}
      refreshing={query.isFetching && page === 1 && items.length > 0}
      fetchingMore={query.isFetching && page > 1}
      error={items.length === 0 ? error : null}
      onRetry={() => void query.refetch()}
      onRefresh={() => {
        setPage(1);
        setItems([]);
        void query.refetch();
      }}
      onEndReached={() => {
        if (hasMore && !query.isFetching) setPage((current) => current + 1);
      }}
      emptyTitle="No product requests yet"
      emptyMessage="New requests from customers and sales will appear here."
      emptyAction={
        can('product_requests', 'create') ? (
          <Button
            title="New request"
            compact
            icon={<Plus size={16} color="#FFFFFF" />}
            onPress={() => router.push('/product-requests/new')}
          />
        ) : undefined
      }
      header={
        <View className="gap-3">
          <PageHeader
            title="Product requests"
            subtitle="Customer briefs moving through sourcing and quotation."
            right={
              can('product_requests', 'create') ? (
                <Button
                  title="New"
                  compact
                  icon={<Plus size={16} color="#FFFFFF" />}
                  onPress={() => router.push('/product-requests/new')}
                />
              ) : undefined
            }
          />
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search requests or customers"
          />
          <FilterChips
            options={PRODUCT_REQUEST_STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={item.title}
          subtitle={`${item.requestNumber} · ${item.customer?.name ?? 'Internal'} · ${formatDate(item.createdAt)}`}
          onPress={() =>
            router.push({ pathname: '/product-requests/[id]', params: { id: item.id } })
          }
          left={
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-jade-50">
              <Text className="text-[13px] font-bold text-jade-700">{item._count.items}</Text>
            </View>
          }
          right={
            <View className="items-end gap-1">
              <StatusBadge status={item.status} />
              <Text className="text-[11px] text-ink-400">
                {item._count.items === 1 ? '1 item' : `${item._count.items} items`}
              </Text>
            </View>
          }
        />
      )}
    />
  );
}
