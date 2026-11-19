import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, X } from 'lucide-react-native';
import { SearchBar } from '@/shared/components/SearchBar';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useListCustomersQuery } from '@/features/customers/customers.api';
import type { Customer } from '@/features/customers/customers.types';

export const CustomerPicker = ({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (customerId: string) => void;
  error?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim());

  const query = useListCustomersQuery({
    page: 1,
    limit: 100,
    status: 'ACTIVE',
    search: debouncedSearch || undefined,
  });

  const selected = useMemo(
    () => query.data?.items.find((customer) => customer.id === value),
    [query.data?.items, value],
  );

  return (
    <View className="gap-1.5">
      <Text className="text-[13px] font-semibold text-ink-700">Customer</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`min-h-12 flex-row items-center justify-between rounded-xl border bg-surface px-3.5 ${
          error ? 'border-coral-400' : 'border-ink-100'
        }`}
      >
        <Text
          className={`text-[15px] ${selected ? 'text-ink-900' : 'text-ink-300'}`}
          numberOfLines={1}
        >
          {selected?.name ?? 'Select the customer for this request'}
        </Text>
        <ChevronDown size={18} color="#718B7F" />
      </Pressable>
      {error ? <Text className="text-[12px] font-medium text-coral-600">{error}</Text> : null}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
            <Text className="text-[22px] font-bold text-ink-900">Select customer</Text>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityLabel="Close customer picker"
              className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            >
              <X size={20} color="#14211C" />
            </Pressable>
          </View>
          <View className="px-5 pb-3">
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search customers" />
          </View>
          <FlatList
            data={query.data?.items ?? []}
            keyExtractor={(item: Customer) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item.id);
                  setOpen(false);
                  setSearch('');
                }}
                className={`rounded-2xl border p-4 ${
                  item.id === value ? 'border-jade-300 bg-jade-50' : 'border-ink-100 bg-surface'
                }`}
              >
                <Text className="text-[15px] font-semibold text-ink-900">{item.name}</Text>
                <Text className="mt-0.5 text-[12px] text-ink-500">
                  {[item.contactName, item.country].filter(Boolean).join(' · ') || 'No contact yet'}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="py-10 text-center text-[13px] text-ink-400">
                {query.isLoading ? 'Loading customers...' : 'No matching customers'}
              </Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};
