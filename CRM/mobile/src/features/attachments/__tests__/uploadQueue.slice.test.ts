import {
  clearFinishedUploads,
  enqueueUpload,
  markUploadDone,
  markUploadFailed,
  markUploading,
  removeUpload,
  resetUploadQueue,
  retryUpload,
  selectActiveUploadCount,
  setUploadProgress,
  uploadQueueReducer,
} from '@/features/attachments/uploadQueue.slice';

const file = {
  uri: 'file:///tmp/qc-photo.jpg',
  name: 'qc-photo.jpg',
  mimeType: 'image/jpeg',
  size: 1024,
};

const enqueue = () => enqueueUpload({ file, entityType: 'qc_report', entityId: 'qc-1' });

describe('upload queue', () => {
  it('enqueues uploads with queued state', () => {
    const state = uploadQueueReducer(undefined, enqueue());

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      entityType: 'qc_report',
      entityId: 'qc-1',
      status: 'queued',
      progress: 0,
    });
    expect(selectActiveUploadCount({ uploadQueue: state })).toBe(1);
  });

  it('tracks upload progress and completion', () => {
    let state = uploadQueueReducer(undefined, enqueue());
    const id = state.items[0].id;

    state = uploadQueueReducer(state, markUploading(id));
    state = uploadQueueReducer(state, setUploadProgress({ id, progress: 64 }));
    expect(state.items[0].progress).toBe(64);

    state = uploadQueueReducer(state, markUploadDone(id));
    expect(state.items[0].status).toBe('done');
    expect(selectActiveUploadCount({ uploadQueue: state })).toBe(0);
  });

  it('retries, removes, and clears failed or completed uploads', () => {
    let state = uploadQueueReducer(undefined, enqueue());
    const id = state.items[0].id;

    state = uploadQueueReducer(state, markUploadFailed({ id, error: 'Network down' }));
    expect(state.items[0].error).toBe('Network down');

    state = uploadQueueReducer(state, retryUpload(id));
    expect(state.items[0]).toMatchObject({ status: 'queued', error: null, progress: 0 });

    state = uploadQueueReducer(state, markUploadDone(id));
    state = uploadQueueReducer(state, enqueue());
    const secondId = state.items[0].id;
    state = uploadQueueReducer(state, markUploadFailed({ id: secondId, error: 'Rejected' }));
    state = uploadQueueReducer(state, clearFinishedUploads());
    expect(state.items).toHaveLength(0);

    state = uploadQueueReducer(state, enqueue());
    state = uploadQueueReducer(state, removeUpload(state.items[0].id));
    expect(state.items).toHaveLength(0);
  });

  it('resets the queue on sign-out', () => {
    const state = uploadQueueReducer(uploadQueueReducer(undefined, enqueue()), resetUploadQueue());
    expect(state.items).toEqual([]);
  });
});
