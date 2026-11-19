import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, Paperclip, Upload } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { env } from '@/config/env';
import { useListAttachmentsQuery } from '@/features/attachments/attachments.api';
import { enqueueUpload } from '@/features/attachments/uploadQueue.slice';
import type { AttachmentEntityType, LocalFile } from '@/features/attachments/attachments.types';
import { useAppDispatch } from '@/store/hooks';
import { Button } from '@/shared/components/Button';
import { PhotoUploader } from '@/shared/components/PhotoUploader';
import { DetailSection } from '@/shared/components/DetailSection';
import { formatDateTime } from '@/shared/utils/format';

const absoluteUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${env.apiUrl.replace(/\/api\/v1\/?$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentSection = ({
  entityType,
  entityId,
  canUpload,
}: {
  entityType: AttachmentEntityType;
  entityId: string;
  canUpload: boolean;
}) => {
  const dispatch = useAppDispatch();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState<LocalFile[]>([]);
  const query = useListAttachmentsQuery({ entityType, entityId, limit: 50 });

  const queueFiles = (files: LocalFile[]) => {
    files.forEach((file) => dispatch(enqueueUpload({ file, entityType, entityId })));
    setPending([]);
    setPickerOpen(false);
    toast.success(files.length === 1 ? 'File queued for upload' : `${files.length} files queued`);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      queueFiles(
        result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
          size: asset.size,
        })),
      );
    }
  };

  return (
    <DetailSection
      title="Attachments"
      action={
        canUpload ? (
          <Button
            title={pickerOpen ? 'Close' : 'Add'}
            variant="ghost"
            compact
            icon={<Paperclip size={15} color="#047857" />}
            onPress={() => setPickerOpen((current) => !current)}
          />
        ) : undefined
      }
    >
      {pickerOpen ? (
        <View className="gap-3 rounded-2xl border border-dashed border-ink-200 bg-canvas p-3">
          <PhotoUploader files={pending} onChange={setPending} maxFiles={8} />
          {pending.length > 0 ? (
            <Button
              title={`Queue ${pending.length} ${pending.length === 1 ? 'file' : 'files'}`}
              compact
              icon={<Upload size={15} color="#FFFFFF" />}
              onPress={() => queueFiles(pending)}
            />
          ) : null}
          <Button
            title="Choose document"
            variant="secondary"
            compact
            onPress={() => void pickDocument()}
          />
        </View>
      ) : null}

      {query.isLoading ? (
        <Text className="text-[12px] text-ink-400">Loading attachments...</Text>
      ) : query.data && query.data.items.length > 0 ? (
        <View className="gap-2">
          {query.data.items.map((attachment) => (
            <Pressable
              key={attachment.id}
              onPress={() => void Linking.openURL(absoluteUrl(attachment.url))}
              className="flex-row items-center gap-3 rounded-xl border border-ink-100 bg-canvas p-3 active:opacity-70"
            >
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-jade-50">
                <FileText size={17} color="#047857" />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-[13px] font-semibold text-ink-800" numberOfLines={1}>
                  {attachment.originalName}
                </Text>
                <Text className="text-[11px] text-ink-400">
                  {formatSize(attachment.size)} · {formatDateTime(attachment.createdAt)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text className="text-[12px] text-ink-400">
          {query.isError ? 'Attachments could not be loaded.' : 'No attachments yet.'}
        </Text>
      )}
    </DetailSection>
  );
};
