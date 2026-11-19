import type { EntityRef, UserRef } from '@/shared/types';

export type QcStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CANCELLED';

export interface QcReport {
  id: string;
  reportNumber: string;
  purchaseOrderId: string;
  customerId: string;
  supplierId: string;
  inspectorId: string | null;
  status: QcStatus;
  inspectionDate: string | null;
  notes: string | null;
  photoUrls: string[];
  createdById: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  purchaseOrder: { id: string; orderNumber: string; status: string } | null;
  customer: EntityRef | null;
  supplier: EntityRef | null;
  inspector: UserRef | null;
  createdBy: UserRef | null;
}

export interface QcReportListArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: QcStatus;
  purchaseOrderId?: string;
  customerId?: string;
  supplierId?: string;
  inspectorId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateQcReportInput {
  purchaseOrderId: string;
  inspectorId?: string;
  inspectionDate?: string;
  notes?: string;
  photoUrls?: string[];
}

export interface UpdateQcReportInput {
  inspectorId?: string;
  inspectionDate?: string;
  notes?: string;
  photoUrls?: string[];
}

export interface UpdateQcReportStatusInput {
  id: string;
  status: QcStatus;
}

export const QC_STATUS_OPTIONS: { label: string; value: QcStatus }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Passed', value: 'PASSED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export const QC_CHECKLIST_ITEMS = [
  { key: 'quantity', label: 'Quantity matches the purchase order' },
  { key: 'packaging', label: 'Packaging and carton labels are correct' },
  { key: 'materials', label: 'Materials and finish meet the approved sample' },
  { key: 'dimensions', label: 'Dimensions and weight are within tolerance' },
  { key: 'defects', label: 'No visible defects or damage' },
] as const;

export type QcChecklistKey = (typeof QC_CHECKLIST_ITEMS)[number]['key'];
export type QcChecklist = Record<QcChecklistKey, boolean>;
