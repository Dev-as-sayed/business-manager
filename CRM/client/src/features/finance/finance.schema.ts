import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const ledgerFormSchema = z.object({
  sourceType: z.enum(['PURCHASE_ORDER', 'SHIPMENT']).default('PURCHASE_ORDER'),
  purchaseOrderId: z.string().optional(),
  shipmentId: z.string().optional(),
  supplierId: z.string().optional(),
  type: z.enum(['REVENUE', 'COST', 'PAYMENT', 'REFUND', 'ADJUSTMENT']).default('REVENUE'),
  amount: z
    .string()
    .trim()
    .min(1, 'Enter an amount')
    .refine((value) => Number(value) > 0, 'Amount must be greater than zero'),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Use a 3-letter currency code')
    .default('USD'),
  exchangeRate: z.string().trim().optional(),
  description: optionalText(2000),
  reference: optionalText(200),
  occurredAt: z.string().optional(),
});

export type LedgerFormValues = z.input<typeof ledgerFormSchema>;
