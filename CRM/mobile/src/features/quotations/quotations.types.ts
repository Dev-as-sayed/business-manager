import type { EntityRef, UserRef } from '@/shared/types';

export type QuotationStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface QuotationItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: string | number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationProductRequestRef {
  id: string;
  requestNumber: string;
  title: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  productRequestId: string;
  customerId: string;
  status: QuotationStatus;
  currency: string;
  serviceFeeRate: string | number;
  subtotal: string | number;
  serviceFee: string | number;
  shippingFee: string | number;
  tax: string | number;
  total: string | number;
  validUntil: string | null;
  notes: string | null;
  createdById: string;
  approvedById: string | null;
  approvedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: EntityRef | null;
  productRequest: QuotationProductRequestRef | null;
  createdBy: UserRef | null;
  approvedBy: UserRef | null;
  _count: { items: number };
  items?: QuotationItem[];
}

export interface QuotationListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  customerId?: string;
  productRequestId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateQuotationStatusInput {
  id: string;
  status: Exclude<QuotationStatus, 'APPROVED'>;
}

export const QUOTATION_STATUS_OPTIONS: { label: string; value: QuotationStatus }[] = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Expired', value: 'EXPIRED' },
];
