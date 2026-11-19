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
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/Button';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { usePermission } from '@/shared/hooks/usePermission';
import { useListQcReportsQuery } from '@/features/quality-control/quality-control.api';
import {
  QC_STATUS_OPTIONS,
  type QcReport,
  type QcStatus,
} from '@/features/quality-control/quality-control.types';
import { formatDate } from '@/shared/utils/format';

export default function QualityControlScreen() {
  const { can } = usePermission();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<QcStatus | undefined>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<QcReport[]>([]);
  const debouncedSearch = useDebounce(search.trim());
  const filtersKey = `${debouncedSearch}|${status ?? ''}`;

  const query = useListQcReportsQuery({
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
      emptyTitle="No inspections yet"
      emptyMessage="Quality control reports for purchase orders will appear here."
      emptyAction={
        can('quality_control', 'create') ? (
          <Button title="New inspection" compact onPress={() => router.push('/qc/new')} />
        ) : undefined
      }
      header={
        <View className="gap-3">
          <PageHeader
            title="Quality control"
            subtitle="Inspection checklists, defects, and factory photos."
            right={
              can('quality_control', 'create') ? (
                <Button
                  title="New"
                  compact
                  icon={<Plus size={16} color="#FFFFFF" />}
                  onPress={() => router.push('/qc/new')}
                />
              ) : undefined
            }
          />
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search report or order" />
          <FilterChips options={QC_STATUS_OPTIONS} value={status} onChange={setStatus} />
        </View>
      }
      renderItem={({ item }) => (
        <ListRow
          title={item.reportNumber}
          subtitle={`${item.purchaseOrder?.orderNumber ?? 'Order'} · ${item.supplier?.name ?? 'Supplier'} · ${formatDate(item.inspectionDate ?? item.createdAt)}`}
          onPress={() => router.push({ pathname: '/qc/[id]', params: { id: item.id } })}
          left={
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-jade-50">
              <Text className="text-[12px] font-bold text-jade-700">QC</Text>
            </View>
          }
          right={<StatusBadge status={item.status} />}
        />
      )}
    />
  );
}
