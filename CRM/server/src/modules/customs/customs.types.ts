import type { CustomsStatus } from '@prisma/client';

export interface CreateCustomsRecordInput {
  shipmentId: string;
  supplierId?: string;
  declarationNumber?: string | null;
  customsOffice?: string | null;
  country?: string | null;
  dutyAmount?: number;
  taxAmount?: number;
  otherFees?: number;
  currency?: string;
  exchangeRate?: number;
  clearanceDate?: Date | null;
  notes?: string | null;
}

export interface UpdateCustomsRecordInput {
  supplierId?: string | null;
  declarationNumber?: string | null;
  customsOffice?: string | null;
  country?: string | null;
  dutyAmount?: number;
  taxAmount?: number;
  otherFees?: number;
  currency?: string;
  exchangeRate?: number;
  clearanceDate?: Date | null;
  notes?: string | null;
}

export interface UpdateCustomsStatusInput {
  status: CustomsStatus;
}

export type CustomsSortField =
  'recordNumber' | 'createdAt' | 'updatedAt' | 'totalAmount' | 'clearanceDate';

export type SortOrder = 'asc' | 'desc';

export interface ListCustomsRecordsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomsStatus;
  customerId?: string;
  supplierId?: string;
  shipmentId?: string;
  country?: string;
  sortBy?: CustomsSortField;
  sortOrder?: SortOrder;
}
