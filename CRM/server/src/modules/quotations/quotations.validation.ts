import { z } from 'zod';

const quotationStatusSchema = z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED']);

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

const currencySchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, 'Currency must be a 3-letter code')
  .transform((value) => value.toUpperCase());

const serviceFeeRateSchema = z.coerce.number().min(0).max(1);
const moneySchema = z.coerce.number().nonnegative().max(9_999_999_999.99);
const quantitySchema = z.coerce.number().int().min(1).max(1_000_000);

const quotationItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: optionalText(1000),
  quantity: quantitySchema,
  unitPrice: moneySchema,
  notes: optionalText(1000),
});

export const createQuotationBodySchema = z.object({
  productRequestId: z.string().min(1),
  currency: currencySchema.optional(),
  serviceFeeRate: serviceFeeRateSchema.optional(),
  shippingFee: moneySchema.optional(),
  tax: moneySchema.optional(),
  validUntil: optionalDate,
  notes: optionalText(2000),
  items: z.array(quotationItemSchema).min(1).max(100),
});

export const updateQuotationBodySchema = z
  .object({
    currency: currencySchema.optional(),
    serviceFeeRate: serviceFeeRateSchema.optional(),
    shippingFee: moneySchema.optional(),
    tax: moneySchema.optional(),
    validUntil: optionalDate,
    notes: optionalText(2000),
    items: z.array(quotationItemSchema).min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateQuotationStatusBodySchema = z.object({
  status: z.enum(['SENT', 'REJECTED', 'EXPIRED']),
});

export const quotationIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listQuotationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: quotationStatusSchema.optional(),
  customerId: z.string().min(1).optional(),
  productRequestId: z.string().min(1).optional(),
  sortBy: z
    .enum(['quotationNumber', 'createdAt', 'updatedAt', 'total', 'validUntil'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
