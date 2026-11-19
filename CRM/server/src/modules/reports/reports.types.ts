import type { ConsignmentStatus } from '@prisma/client';

export type ReportPeriod = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export interface ReportsQuery {
  period?: ReportPeriod;
  startDate?: Date;
  endDate?: Date;
  status?: ConsignmentStatus;
  customerId?: string;
  supplierId?: string;
}
