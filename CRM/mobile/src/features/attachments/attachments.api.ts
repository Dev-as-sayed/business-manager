import { baseApi } from '@/api/baseApi';
import { unwrapList } from '@/api/helpers';
import { env } from '@/config/env';
import { tokenStore } from '@/api/token-store';
import type {
  Attachment,
  AttachmentListArgs,
  UploadAttachmentInput,
} from '@/features/attachments/attachments.types';
import type { ApiEnvelope, NormalizedApiError, Paginated } from '@/shared/types';

export const attachmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listAttachments: build.query<Paginated<Attachment>, AttachmentListArgs>({
      query: (args) => ({ url: '/attachments', params: args }),
      transformResponse: unwrapList<Attachment>,
      providesTags: (result, _error, args) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Attachment' as const, id: item.id })),
              { type: 'Attachment' as const, id: `LIST-${args.entityType}-${args.entityId}` },
            ]
          : [{ type: 'Attachment' as const, id: `LIST-${args.entityType}-${args.entityId}` }],
    }),
  }),
});

export const { useListAttachmentsQuery } = attachmentsApi;

const uploadError = (status: number, message: string): NormalizedApiError => ({
  status,
  message,
  errors: [],
});

export const uploadAttachment = (input: UploadAttachmentInput): Promise<Attachment> =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('entityType', input.entityType);
    formData.append('entityId', input.entityId);
    formData.append('file', {
      uri: input.file.uri,
      name: input.file.name,
      type: input.file.mimeType,
    } as unknown as Blob);

    const request = new XMLHttpRequest();
    request.open('POST', `${env.apiUrl}/attachments`);
    request.setRequestHeader('X-Client', 'mobile');

    const token = tokenStore.get();
    if (token) {
      request.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        input.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onerror = () => {
      reject(uploadError(0, 'Upload failed. Check your connection and try again.'));
    };

    request.onload = () => {
      try {
        const envelope = JSON.parse(request.responseText) as ApiEnvelope<Attachment>;

        if (request.status >= 200 && request.status < 300) {
          resolve(envelope.data);
          return;
        }

        reject(uploadError(request.status, envelope.message || 'Upload failed'));
      } catch {
        reject(uploadError(request.status, 'Upload failed'));
      }
    };

    request.send(formData);
  });
