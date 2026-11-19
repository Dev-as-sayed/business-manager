import { z } from 'zod';

export const purchaseOrderFormSchema = z.object({
  quotationId: z.string().optional(),
  supplierId: z.string().min(1, 'Select a supplier'),
  shippingFee: z.string().trim().optional(),
  tax: z.string().trim().optional(),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;
