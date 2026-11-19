import { useEffect } from 'react';
import { baseApi } from '@/api/baseApi';
import { uploadAttachment } from '@/features/attachments/attachments.api';
import {
  markUploadDone,
  markUploadFailed,
  markUploading,
  selectUploadQueue,
  setUploadProgress,
} from '@/features/attachments/uploadQueue.slice';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const MAX_CONCURRENT_UPLOADS = 2;

export const useUploadQueueRunner = (): void => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectUploadQueue);
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const online = isConnected && isInternetReachable;

  useEffect(() => {
    if (!online) return;

    const active = items.filter((item) => item.status === 'uploading').length;
    const slots = Math.max(0, MAX_CONCURRENT_UPLOADS - active);
    const next = items.filter((item) => item.status === 'queued').slice(0, slots);

    next.forEach((item) => {
      dispatch(markUploading(item.id));

      void uploadAttachment({
        file: item.file,
        entityType: item.entityType,
        entityId: item.entityId,
        onProgress: (progress) => dispatch(setUploadProgress({ id: item.id, progress })),
      })
        .then(() => {
          dispatch(markUploadDone(item.id));
          dispatch(
            baseApi.util.invalidateTags([
              { type: 'Attachment', id: `LIST-${item.entityType}-${item.entityId}` },
            ]),
          );
        })
        .catch((caught: unknown) => {
          const message =
            caught && typeof caught === 'object' && 'message' in caught
              ? String((caught as { message: unknown }).message)
              : 'Upload failed';
          dispatch(markUploadFailed({ id: item.id, error: message }));
        });
    });
  }, [dispatch, items, online]);
};

export const UploadQueueRunner = () => {
  useUploadQueueRunner();
  return null;
};
