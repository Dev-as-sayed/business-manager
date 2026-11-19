import type { QuotationStatus } from '@prisma/client';

export interface QuotationItemInput {
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
}

export interface CreateQuotationInput {
  productRequestId: string;
  currency?: string;
  serviceFeeRate?: number;
  shippingFee?: number;
  tax?: number;
  validUntil?: Date | null;
  notes?: string | null;
  items: QuotationItemInput[];
}

export interface UpdateQuotationInput {
  currency?: string;
  serviceFeeRate?: number;
  shippingFee?: number;
  tax?: number;
  validUntil?: Date | null;
  notes?: string | null;
  items?: QuotationItemInput[];
}

export interface UpdateQuotationStatusInput {
  status: QuotationStatus;
}

export type QuotationSortField =
  'quotationNumber' | 'createdAt' | 'updatedAt' | 'total' | 'validUntil';

export type SortOrder = 'asc' | 'desc';

export interface ListQuotationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  customerId?: string;
  productRequestId?: string;
  sortBy?: QuotationSortField;
  sortOrder?: SortOrder;
}
