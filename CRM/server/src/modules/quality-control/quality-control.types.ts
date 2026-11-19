import type { QcStatus } from '@prisma/client';

export interface CreateQcReportInput {
  purchaseOrderId: string;
  inspectorId?: string;
  inspectionDate?: Date | null;
  notes?: string | null;
  photoUrls?: string[];
}

export interface UpdateQcReportInput {
  inspectorId?: string;
  inspectionDate?: Date | null;
  notes?: string | null;
  photoUrls?: string[];
}

export interface UpdateQcReportStatusInput {
  status: QcStatus;
}

export type QcReportSortField = 'reportNumber' | 'createdAt' | 'updatedAt' | 'inspectionDate';

export type SortOrder = 'asc' | 'desc';

export interface ListQcReportsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: QcStatus;
  purchaseOrderId?: string;
  customerId?: string;
  supplierId?: string;
  inspectorId?: string;
  sortBy?: QcReportSortField;
  sortOrder?: SortOrder;
}
