import { z } from 'zod';

const customsStatusSchema = z.enum(['PENDING', 'IN_REVIEW', 'CLEARED', 'HELD', 'CANCELLED']);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? null : value));

const optionalDate = z
  .union([z.literal(''), z.null(), z.coerce.date()])
  .optional()
  .transform((value) => (value === '' || value === null ? null : value));

const moneySchema = z.coerce.number().nonnegative().max(9_999_999_999.99);
const exchangeRateSchema = z.coerce.number().positive().max(1_000_000);
const currencySchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase());

export const createCustomsRecordBodySchema = z.object({
  shipmentId: z.string().min(1),
  supplierId: z.string().min(1).optional(),
  declarationNumber: optionalText(100),
  customsOffice: optionalText(200),
  country: optionalText(100),
  dutyAmount: moneySchema.optional(),
  taxAmount: moneySchema.optional(),
  otherFees: moneySchema.optional(),
  currency: currencySchema.optional(),
  exchangeRate: exchangeRateSchema.optional(),
  clearanceDate: optionalDate,
  notes: optionalText(2000),
});

export const updateCustomsRecordBodySchema = z
  .object({
    supplierId: z.string().min(1).nullable().optional(),
    declarationNumber: optionalText(100),
    customsOffice: optionalText(200),
    country: optionalText(100),
    dutyAmount: moneySchema.optional(),
    taxAmount: moneySchema.optional(),
    otherFees: moneySchema.optional(),
    currency: currencySchema.optional(),
    exchangeRate: exchangeRateSchema.optional(),
    clearanceDate: optionalDate,
    notes: optionalText(2000),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateCustomsStatusBodySchema = z.object({
  status: z.enum(['IN_REVIEW', 'CLEARED', 'HELD', 'CANCELLED']),
});

export const customsRecordIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listCustomsRecordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: customsStatusSchema.optional(),
  customerId: z.string().min(1).optional(),
  supplierId: z.string().min(1).optional(),
  shipmentId: z.string().min(1).optional(),
  country: z.string().trim().max(100).optional(),
  sortBy: z
    .enum(['recordNumber', 'createdAt', 'updatedAt', 'totalAmount', 'clearanceDate'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
