import type { LedgerEntryStatus, LedgerEntryType } from '@prisma/client';

export interface CreateLedgerEntryInput {
  purchaseOrderId?: string;
  shipmentId?: string;
  supplierId?: string;
  type: LedgerEntryType;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  description?: string | null;
  reference?: string | null;
  occurredAt?: Date;
}

export interface UpdateLedgerEntryInput {
  supplierId?: string | null;
  amount?: number;
  currency?: string;
  exchangeRate?: number;
  description?: string | null;
  reference?: string | null;
  occurredAt?: Date;
}

export type LedgerSortField =
  'entryNumber' | 'createdAt' | 'updatedAt' | 'amount' | 'amountInBaseCurrency' | 'occurredAt';

export type SortOrder = 'asc' | 'desc';

export interface ListLedgerEntriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: LedgerEntryType;
  status?: LedgerEntryStatus;
  purchaseOrderId?: string;
  shipmentId?: string;
  customerId?: string;
  supplierId?: string;
  currency?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: LedgerSortField;
  sortOrder?: SortOrder;
}

export type LedgerExportQuery = Omit<ListLedgerEntriesQuery, 'page' | 'limit'>;

export interface PurchaseOrderProfitQuery {
  purchaseOrderId: string;
}
