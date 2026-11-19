import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const customsFormSchema = z.object({
  shipmentId: z.string().optional(),
  supplierId: z.string().optional(),
  declarationNumber: optionalText(100),
  customsOffice: optionalText(200),
  country: optionalText(100),
  dutyAmount: z.string().trim().optional(),
  taxAmount: z.string().trim().optional(),
  otherFees: z.string().trim().optional(),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Use a 3-letter currency code')
    .default('USD'),
  exchangeRate: z.string().trim().optional(),
  clearanceDate: z.string().optional(),
  notes: optionalText(2000),
});

export type CustomsFormValues = z.input<typeof customsFormSchema>;
