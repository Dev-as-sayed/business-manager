import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AttachmentEntityType, LocalFile } from '@/features/attachments/attachments.types';

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'failed';

export interface UploadQueueItem {
  id: string;
  file: LocalFile;
  entityType: AttachmentEntityType;
  entityId: string;
  progress: number;
  status: UploadStatus;
  error: string | null;
  createdAt: string;
}

export interface UploadQueueState {
  items: UploadQueueItem[];
}

const initialState: UploadQueueState = { items: [] };

const uploadQueueSlice = createSlice({
  name: 'uploadQueue',
  initialState,
  reducers: {
    enqueueUpload(
      state,
      action: PayloadAction<{
        file: LocalFile;
        entityType: AttachmentEntityType;
        entityId: string;
      }>,
    ) {
      state.items.unshift({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: action.payload.file,
        entityType: action.payload.entityType,
        entityId: action.payload.entityId,
        progress: 0,
        status: 'queued',
        error: null,
        createdAt: new Date().toISOString(),
      });
    },
    markUploading(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item) {
        item.status = 'uploading';
        item.progress = 0;
      }
    },
    setUploadProgress(state, action: PayloadAction<{ id: string; progress: number }>) {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (item) {
        item.progress = action.payload.progress;
      }
    },
    markUploadDone(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item) {
        item.status = 'done';
        item.progress = 100;
      }
    },
    markUploadFailed(state, action: PayloadAction<{ id: string; error: string }>) {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (item) {
        item.status = 'failed';
        item.error = action.payload.error;
      }
    },
    retryUpload(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item) {
        item.status = 'queued';
        item.progress = 0;
        item.error = null;
      }
    },
    removeUpload(state, action: PayloadAction<string>) {
      state.items = state.items.filter((entry) => entry.id !== action.payload);
    },
    clearFinishedUploads(state) {
      state.items = state.items.filter(
        (entry) => entry.status !== 'done' && entry.status !== 'failed',
      );
    },
    resetUploadQueue(state) {
      state.items = [];
    },
  },
});

export const {
  enqueueUpload,
  markUploading,
  setUploadProgress,
  markUploadDone,
  markUploadFailed,
  retryUpload,
  removeUpload,
  clearFinishedUploads,
  resetUploadQueue,
} = uploadQueueSlice.actions;

export const uploadQueueReducer = uploadQueueSlice.reducer;

interface UploadQueueRootState {
  uploadQueue: UploadQueueState;
}

export const selectUploadQueue = (state: UploadQueueRootState) => state.uploadQueue.items;
export const selectActiveUploadCount = (state: UploadQueueRootState) =>
  state.uploadQueue.items.filter((item) => item.status === 'queued' || item.status === 'uploading')
    .length;
