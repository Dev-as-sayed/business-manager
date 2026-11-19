import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const shipmentFormSchema = z.object({
  purchaseOrderId: z.string().optional(),
  carrier: optionalText(200),
  trackingNumber: optionalText(200),
  shippingMethod: optionalText(100),
  origin: optionalText(200),
  destination: optionalText(200),
  estimatedDeliveryDate: z.string().optional(),
  notes: optionalText(2000),
});

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;
