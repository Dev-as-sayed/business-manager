import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, X } from 'lucide-react-native';
import { SearchBar } from '@/shared/components/SearchBar';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useListPurchaseOrdersQuery } from '@/features/purchase-orders/purchase-orders.api';
import type { PurchaseOrder } from '@/features/purchase-orders/purchase-orders.types';
import { formatDate, formatMoney } from '@/shared/utils/format';

const ELIGIBLE = new Set(['APPROVED', 'IN_PRODUCTION']);

export const PurchaseOrderPicker = ({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (order: PurchaseOrder) => void;
  error?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim());
  const query = useListPurchaseOrdersQuery({
    page: 1,
    limit: 100,
    search: debouncedSearch || undefined,
  });

  const eligible = useMemo(
    () => (query.data?.items ?? []).filter((order) => ELIGIBLE.has(order.status)),
    [query.data?.items],
  );

  const selected = useMemo(
    () => (query.data?.items ?? []).find((order) => order.id === value),
    [query.data?.items, value],
  );

  return (
    <View className="gap-1.5">
      <Text className="text-[13px] font-semibold text-ink-700">Purchase order</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`min-h-12 flex-row items-center justify-between rounded-xl border bg-surface px-3.5 ${
          error ? 'border-coral-400' : 'border-ink-100'
        }`}
      >
        <Text
          className={`flex-1 text-[15px] ${selected ? 'text-ink-900' : 'text-ink-300'}`}
          numberOfLines={1}
        >
          {selected
            ? `${selected.orderNumber} · ${selected.supplier?.name ?? 'Supplier'}`
            : 'Select an approved purchase order'}
        </Text>
        <ChevronDown size={18} color="#718B7F" />
      </Pressable>
      {error ? <Text className="text-[12px] font-medium text-coral-600">{error}</Text> : null}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
            <Text className="text-[22px] font-bold text-ink-900">Choose order</Text>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityLabel="Close order picker"
              className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            >
              <X size={20} color="#14211C" />
            </Pressable>
          </View>
          <View className="px-5 pb-3">
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search order number" />
          </View>
          <FlatList
            data={eligible}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                  setSearch('');
                }}
                className={`rounded-2xl border p-4 ${
                  item.id === value ? 'border-jade-300 bg-jade-50' : 'border-ink-100 bg-surface'
                }`}
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="text-[15px] font-semibold text-ink-900">{item.orderNumber}</Text>
                  <Text className="text-[13px] font-bold text-ink-700">
                    {formatMoney(item.total, item.currency)}
                  </Text>
                </View>
                <Text className="mt-0.5 text-[12px] text-ink-500">
                  {item.supplier?.name ?? 'Supplier'} · Expected{' '}
                  {formatDate(item.expectedDeliveryDate)}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="py-10 text-center text-[13px] text-ink-400">
                {query.isLoading
                  ? 'Loading purchase orders...'
                  : 'No approved or in-production orders found'}
              </Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};
