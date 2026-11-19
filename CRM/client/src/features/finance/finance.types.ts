import type { EntityRef, UserRef } from '@/shared/types';

export type LedgerEntryType = 'REVENUE' | 'COST' | 'PAYMENT' | 'REFUND' | 'ADJUSTMENT';
export type LedgerEntryStatus = 'PENDING' | 'APPROVED' | 'VOID';

export interface LedgerPurchaseOrderRef {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  total: string | number;
}

export interface LedgerShipmentRef {
  id: string;
  shipmentNumber: string;
  status: string;
}

export interface LedgerEntry {
  id: string;
  entryNumber: string;
  purchaseOrderId: string | null;
  shipmentId: string | null;
  customerId: string;
  supplierId: string | null;
  type: LedgerEntryType;
  status: LedgerEntryStatus;
  amount: string | number;
  currency: string;
  exchangeRate: string | number;
  amountInBaseCurrency: string | number;
  description: string | null;
  reference: string | null;
  occurredAt: string;
  createdById: string;
  approvedById: string | null;
  approvedAt: string | null;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  purchaseOrder: LedgerPurchaseOrderRef | null;
  shipment: LedgerShipmentRef | null;
  customer: EntityRef | null;
  supplier: EntityRef | null;
  createdBy: UserRef | null;
  approvedBy: UserRef | null;
}

export interface LedgerListArgs {
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
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateLedgerEntryInput {
  purchaseOrderId?: string;
  shipmentId?: string;
  supplierId?: string;
  type: LedgerEntryType;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  description?: string;
  reference?: string;
  occurredAt?: string;
}

export interface UpdateLedgerEntryInput {
  supplierId?: string | null;
  amount?: number;
  currency?: string;
  exchangeRate?: number;
  description?: string;
  reference?: string;
  occurredAt?: string;
}

export interface PurchaseOrderProfit {
  purchaseOrderId: string;
  orderNumber: string;
  orderStatus: string;
  orderCurrency: string;
  orderTotal: string | number;
  baseCurrency: string;
  revenue: string | number;
  costs: string | number;
  refunds: string | number;
  adjustments: string | number;
  payments: string | number;
  profit: string | number;
  entryCount: number;
}

export const LEDGER_TYPE_OPTIONS: { label: string; value: LedgerEntryType }[] = [
  { label: 'Revenue', value: 'REVENUE' },
  { label: 'Cost', value: 'COST' },
  { label: 'Payment', value: 'PAYMENT' },
  { label: 'Refund', value: 'REFUND' },
  { label: 'Adjustment', value: 'ADJUSTMENT' },
];

export const LEDGER_STATUS_OPTIONS: { label: string; value: LedgerEntryStatus }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Void', value: 'VOID' },
];
