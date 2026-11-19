import { z } from 'zod';

const optionalMoney = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
    'Enter a valid amount',
  );

export const updateCustomsSchema = z.object({
  declarationNumber: z.string().trim().max(100).optional(),
  customsOffice: z.string().trim().max(200).optional(),
  country: z.string().trim().max(100).optional(),
  dutyAmount: optionalMoney,
  taxAmount: optionalMoney,
  otherFees: optionalMoney,
  currency: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.length === 3, 'Use a 3-letter currency code'),
  exchangeRate: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || (Number.isFinite(Number(value)) && Number(value) > 0),
      'Enter a valid rate',
    ),
  clearanceDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Use the format YYYY-MM-DD'),
  notes: z.string().trim().max(2000).optional(),
});

export type UpdateCustomsFormValues = z.infer<typeof updateCustomsSchema>;
