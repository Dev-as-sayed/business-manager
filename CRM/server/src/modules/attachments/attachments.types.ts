export const ATTACHMENT_ENTITY_TYPES = [
  'purchase_order',
  'qc_report',
  'shipment',
  'customs_record',
  'ledger_entry',
  'product_request',
  'quotation',
] as const;

export type AttachmentEntityType = (typeof ATTACHMENT_ENTITY_TYPES)[number];

export interface UploadAttachmentInput {
  entityType: AttachmentEntityType;
  entityId: string;
}

export type AttachmentSortField = 'createdAt' | 'originalName' | 'size';

export interface ListAttachmentsQuery {
  entityType: AttachmentEntityType;
  entityId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: AttachmentSortField;
  sortOrder?: 'asc' | 'desc';
}
