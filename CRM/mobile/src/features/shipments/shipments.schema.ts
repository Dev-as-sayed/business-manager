import { z } from 'zod';

export const updateShipmentSchema = z.object({
  carrier: z.string().trim().max(200).optional(),
  trackingNumber: z.string().trim().max(200).optional(),
  shippingMethod: z.string().trim().max(100).optional(),
  origin: z.string().trim().max(200).optional(),
  destination: z.string().trim().max(200).optional(),
  estimatedDeliveryDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Use the format YYYY-MM-DD'),
  notes: z.string().trim().max(2000).optional(),
});

export type UpdateShipmentFormValues = z.infer<typeof updateShipmentSchema>;
