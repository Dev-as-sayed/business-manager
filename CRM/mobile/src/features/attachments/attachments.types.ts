import type { UserRef } from '@/shared/types';

export type AttachmentEntityType =
  | 'purchase_order'
  | 'qc_report'
  | 'shipment'
  | 'customs_record'
  | 'ledger_entry'
  | 'product_request'
  | 'quotation';

export interface Attachment {
  id: string;
  entityType: AttachmentEntityType;
  entityId: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: UserRef | null;
}

export interface AttachmentListArgs {
  entityType: AttachmentEntityType;
  entityId: string;
  page?: number;
  limit?: number;
}

export interface LocalFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface UploadAttachmentInput {
  file: LocalFile;
  entityType: AttachmentEntityType;
  entityId: string;
  onProgress?: (progress: number) => void;
}
