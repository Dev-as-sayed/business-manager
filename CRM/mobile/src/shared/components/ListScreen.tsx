import type { ReactElement } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList, type FlashListProps } from '@shopify/flash-list';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StateViews';

interface ListScreenProps<T> {
  data: T[];
  renderItem: FlashListProps<T>['renderItem'];
  keyExtractor: (item: T) => string;
  header?: ReactElement;
  loading?: boolean;
  refreshing?: boolean;
  fetchingMore?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRefresh?: () => void;
  onEndReached?: () => void;
  emptyTitle: string;
  emptyMessage?: string;
  emptyAction?: ReactElement;
  footer?: ReactElement;
}

export const ListScreen = <T,>({
  data,
  renderItem,
  keyExtractor,
  header,
  loading = false,
  refreshing = false,
  fetchingMore = false,
  error,
  onRetry,
  onRefresh,
  onEndReached,
  emptyTitle,
  emptyMessage,
  emptyAction,
  footer,
}: ListScreenProps<T>) => (
  <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      ItemSeparatorComponent={() => <View className="h-2.5" />}
      keyboardShouldPersistTaps="handled"
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        <View className="gap-4 pb-4">
          <OfflineBanner />
          {header}
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <LoadingState label="Loading records" />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : (
          <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
        )
      }
      ListFooterComponent={
        <View className="gap-3 pt-4">
          {fetchingMore ? <ActivityIndicator color="#047857" /> : null}
          {footer}
        </View>
      }
    />
  </SafeAreaView>
);
