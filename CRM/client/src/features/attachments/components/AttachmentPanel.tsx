import { Download, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  buildAttachmentFormData,
  useDeleteAttachmentMutation,
  useListAttachmentsQuery,
  useUploadAttachmentMutation,
} from '@/features/attachments/attachments.api';
import type {
  Attachment,
  AttachmentEntityType,
} from '@/features/attachments/attachments.types';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { DetailSection } from '@/shared/components/detail-list';
import { FileUploader } from '@/shared/components/file-uploader';
import { Button } from '@/shared/components/ui/button';
import { Can } from '@/shared/guards/Can';
import { displayUserName, formatDateTime, formatFileSize } from '@/shared/utils/format';
import { toastApiError } from '@/shared/utils/toast';

interface AttachmentPanelProps {
  entityType: AttachmentEntityType;
  entityId: string;
}

export const AttachmentPanel = ({ entityType, entityId }: AttachmentPanelProps) => {
  const [pendingDelete, setPendingDelete] = useState<Attachment | null>(null);
  const { data, isLoading } = useListAttachmentsQuery(
    { entityType, entityId, limit: 100 },
    { skip: !entityId },
  );
  const [uploadAttachment, { isLoading: uploading }] = useUploadAttachmentMutation();
  const [deleteAttachment, { isLoading: deleting }] = useDeleteAttachmentMutation();

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        await uploadAttachment(buildAttachmentFormData(file, entityType, entityId)).unwrap();
      } catch (error) {
        toastApiError(error);
        return;
      }
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteAttachment(pendingDelete.id).unwrap();
      setPendingDelete(null);
    } catch (error) {
      toastApiError(error);
    }
  };

  return (
    <DetailSection title={`Attachments (${data?.items.length ?? 0})`}>
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading attachments…</p>
        ) : data?.items.length ? (
          <ul className="divide-y divide-border">
            {data.items.map((attachment) => (
              <li key={attachment.id} className="flex items-center gap-3 py-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-muted text-muted-foreground">
                  {attachment.mimeType.startsWith('image/') ? (
                    <ImageIcon className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-medium underline decoration-border underline-offset-4 hover:text-accent"
                  >
                    {attachment.originalName}
                  </a>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {formatFileSize(attachment.size)} ·{' '}
                    {displayUserName(attachment.uploadedBy)} ·{' '}
                    {formatDateTime(attachment.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    asChild
                    aria-label={`Download ${attachment.originalName}`}
                  >
                    <a href={attachment.url} target="_blank" rel="noreferrer">
                      <Download className="size-4" />
                    </a>
                  </Button>
                  <Can resource="attachments" action="delete">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(attachment)}
                      aria-label={`Delete ${attachment.originalName}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </Can>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No attachments yet.</p>
        )}

        <Can resource="attachments" action="create">
          <FileUploader
            onUpload={handleUpload}
            isUploading={uploading}
            multiple
            label="Drop files here or browse"
            hint="Images and PDFs up to 10MB"
          />
        </Can>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete attachment?"
        description={
          pendingDelete
            ? `${pendingDelete.originalName} will be removed from this record.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </DetailSection>
  );
};
