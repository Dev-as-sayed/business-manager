import { z } from 'zod';

export const qcFormSchema = z.object({
  purchaseOrderId: z.string().optional(),
  inspectorId: z.string().optional(),
  inspectionDate: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
  photoUrls: z.string().optional(),
});

export type QcFormValues = z.infer<typeof qcFormSchema>;
