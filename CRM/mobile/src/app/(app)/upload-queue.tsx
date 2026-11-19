import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { RefreshCw, Trash2, UploadCloud } from 'lucide-react-native';
import {
  clearFinishedUploads,
  removeUpload,
  retryUpload,
  selectUploadQueue,
} from '@/features/attachments/uploadQueue.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { cn } from '@/shared/utils/cn';

const statusLabel = {
  queued: 'Waiting for connection',
  uploading: 'Uploading',
  done: 'Uploaded',
  failed: 'Failed',
} as const;

export default function UploadQueueScreen() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectUploadQueue);
  const finished = items.filter((item) => item.status === 'done' || item.status === 'failed');

  return (
    <Screen edges={['top', 'bottom']}>
      <PageHeader
        title="Upload queue"
        subtitle="Photos and documents upload in the background and retry when you reconnect."
        back={() => router.back()}
        right={
          finished.length > 0 ? (
            <Button
              title="Clear"
              compact
              variant="ghost"
              onPress={() => dispatch(clearFinishedUploads())}
            />
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<UploadCloud size={24} color="#526C60" />}
          title="Nothing in the queue"
          message="Photos you add to a QC report, shipment, or customs record will appear here."
        />
      ) : (
        <View className="gap-2.5">
          {items.map((item) => (
            <View key={item.id} className="rounded-2xl border border-ink-100 bg-surface p-4">
              <View className="flex-row items-center gap-3">
                {item.file.mimeType.startsWith('image/') ? (
                  <Image
                    source={{ uri: item.file.uri }}
                    className="h-12 w-12 rounded-xl bg-ink-50"
                  />
                ) : (
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-ink-50">
                    <UploadCloud size={20} color="#718B7F" />
                  </View>
                )}
                <View className="flex-1 gap-0.5">
                  <Text className="text-[13px] font-semibold text-ink-900" numberOfLines={1}>
                    {item.file.name}
                  </Text>
                  <Text
                    className={cn(
                      'text-[11px] font-medium',
                      item.status === 'failed'
                        ? 'text-coral-600'
                        : item.status === 'done'
                          ? 'text-jade-700'
                          : 'text-ink-400',
                    )}
                  >
                    {statusLabel[item.status]}
                    {item.status === 'uploading' ? ` · ${item.progress}%` : ''}
                  </Text>
                </View>
                {item.status === 'failed' ? (
                  <Pressable
                    onPress={() => dispatch(retryUpload(item.id))}
                    accessibilityLabel="Retry upload"
                    className="h-9 w-9 items-center justify-center rounded-full bg-jade-50"
                  >
                    <RefreshCw size={16} color="#047857" />
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => dispatch(removeUpload(item.id))}
                  accessibilityLabel="Remove upload"
                  className="h-9 w-9 items-center justify-center rounded-full bg-coral-50"
                >
                  <Trash2 size={16} color="#E11D48" />
                </Pressable>
              </View>

              {item.status === 'uploading' || item.status === 'queued' ? (
                <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <View
                    className="h-full rounded-full bg-jade-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </View>
              ) : null}

              {item.error ? (
                <Text className="mt-2 text-[11px] text-coral-600">{item.error}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
