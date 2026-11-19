import { baseApi } from '@/api/baseApi';
import { unwrapList, withSuccessToast } from '@/api/helpers';
import type { Paginated } from '@/shared/types';
import type {
  Attachment,
  AttachmentEntityType,
  AttachmentListArgs,
} from '@/features/attachments/attachments.types';

export const attachmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listAttachments: build.query<Paginated<Attachment>, AttachmentListArgs>({
      query: (args) => ({ url: '/attachments', params: args }),
      transformResponse: unwrapList<Attachment>,
      providesTags: (result, _error, args) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Attachment' as const, id: item.id })),
              {
                type: 'Attachment' as const,
                id: `LIST-${args.entityType}-${args.entityId}`,
              },
            ]
          : [
              {
                type: 'Attachment' as const,
                id: `LIST-${args.entityType}-${args.entityId}`,
              },
            ],
    }),
    uploadAttachment: build.mutation<Attachment, FormData>({
      query: (body) => ({ url: '/attachments', method: 'POST', body }),
      transformResponse: withSuccessToast<Attachment>(),
      invalidatesTags: [{ type: 'Attachment', id: 'LIST' }],
    }),
    deleteAttachment: build.mutation<null, string>({
      query: (id) => ({ url: `/attachments/${id}`, method: 'DELETE' }),
      transformResponse: withSuccessToast<null>(),
      invalidatesTags: [{ type: 'Attachment', id: 'LIST' }],
    }),
  }),
});

export const {
  useListAttachmentsQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} = attachmentsApi;

export const buildAttachmentFormData = (
  file: File,
  entityType: AttachmentEntityType,
  entityId: string,
): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);

  return formData;
};

export const attachmentUrl = (attachment: Attachment): string => attachment.url;
