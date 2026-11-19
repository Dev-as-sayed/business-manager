import { z } from 'zod';

export const quotationFormSchema = z.object({
  productRequestId: z.string().optional(),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Use a 3-letter currency code')
    .default('USD'),
  serviceFeePercent: z.string().trim().optional(),
  shippingFee: z.string().trim().optional(),
  tax: z.string().trim().optional(),
  validUntil: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type QuotationFormValues = z.input<typeof quotationFormSchema>;
