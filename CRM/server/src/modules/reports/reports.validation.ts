import { z } from 'zod';
import { consignmentStatusSchema } from '@/modules/consignments/consignments.validation';

export const reportsQuerySchema = z.object({
  period: z.enum(['all', 'today', 'week', 'month', 'year', 'custom']).default('all'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: consignmentStatusSchema.optional(),
  customerId: z.string().min(1).optional(),
  supplierId: z.string().min(1).optional(),
});
