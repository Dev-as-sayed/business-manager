import type { EntityRef, UserRef } from '@/shared/types';

export type CustomsStatus = 'PENDING' | 'IN_REVIEW' | 'CLEARED' | 'HELD' | 'CANCELLED';

export interface CustomsShipmentRef {
  id: string;
  shipmentNumber: string;
  status: string;
  customerId: string;
}

export interface CustomsRecord {
  id: string;
  recordNumber: string;
  shipmentId: string;
  customerId: string;
  supplierId: string | null;
  status: CustomsStatus;
  declarationNumber: string | null;
  customsOffice: string | null;
  country: string | null;
  dutyAmount: string | number;
  taxAmount: string | number;
  otherFees: string | number;
  totalAmount: string | number;
  currency: string;
  exchangeRate: string | number;
  clearanceDate: string | null;
  notes: string | null;
  createdById: string;
  updatedById: string | null;
  reviewedAt: string | null;
  clearedAt: string | null;
  heldAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  shipment: CustomsShipmentRef | null;
  customer: EntityRef | null;
  supplier: EntityRef | null;
  createdBy: UserRef | null;
  updatedBy: UserRef | null;
}

export interface CustomsListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomsStatus;
  customerId?: string;
  supplierId?: string;
  shipmentId?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCustomsRecordInput {
  shipmentId: string;
  supplierId?: string;
  declarationNumber?: string;
  customsOffice?: string;
  country?: string;
  dutyAmount?: number;
  taxAmount?: number;
  otherFees?: number;
  currency?: string;
  exchangeRate?: number;
  clearanceDate?: string;
  notes?: string;
}

export interface UpdateCustomsRecordInput {
  supplierId?: string;
  declarationNumber?: string;
  customsOffice?: string;
  country?: string;
  dutyAmount?: number;
  taxAmount?: number;
  otherFees?: number;
  currency?: string;
  exchangeRate?: number;
  clearanceDate?: string;
  notes?: string;
}

export interface UpdateCustomsStatusInput {
  id: string;
  status: CustomsStatus;
}

export const CUSTOMS_STATUS_OPTIONS: { label: string; value: CustomsStatus }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'In review', value: 'IN_REVIEW' },
  { label: 'Cleared', value: 'CLEARED' },
  { label: 'Held', value: 'HELD' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const CUSTOMS_TRANSITIONS: Record<CustomsStatus, CustomsStatus[]> = {
  PENDING: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['CLEARED', 'HELD', 'CANCELLED'],
  HELD: ['IN_REVIEW', 'CANCELLED'],
  CLEARED: [],
  CANCELLED: [],
};
