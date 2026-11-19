import { z } from 'zod';

const ledgerEntryTypeSchema = z.enum(['REVENUE', 'COST', 'PAYMENT', 'REFUND', 'ADJUSTMENT']);

const ledgerEntryStatusSchema = z.enum(['PENDING', 'APPROVED', 'VOID']);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? null : value));

const amountSchema = z.coerce.number().positive().max(9_999_999_999.99);
const exchangeRateSchema = z.coerce.number().positive().max(1_000_000);
const currencySchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase());

export const createLedgerEntryBodySchema = z
  .object({
    purchaseOrderId: z.string().min(1).optional(),
    shipmentId: z.string().min(1).optional(),
    supplierId: z.string().min(1).optional(),
    type: ledgerEntryTypeSchema,
    amount: amountSchema,
    currency: currencySchema.optional(),
    exchangeRate: exchangeRateSchema.optional(),
    description: optionalText(2000),
    reference: optionalText(200),
    occurredAt: z.coerce.date().optional(),
  })
  .refine((data) => Boolean(data.purchaseOrderId || data.shipmentId), {
    message: 'purchaseOrderId or shipmentId is required',
  });

export const updateLedgerEntryBodySchema = z
  .object({
    supplierId: z.string().min(1).nullable().optional(),
    amount: amountSchema.optional(),
    currency: currencySchema.optional(),
    exchangeRate: exchangeRateSchema.optional(),
    description: optionalText(2000),
    reference: optionalText(200),
    occurredAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const ledgerEntryIdParamsSchema = z.object({
  id: z.string().min(1),
});

const ledgerListQueryBaseSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  type: ledgerEntryTypeSchema.optional(),
  status: ledgerEntryStatusSchema.optional(),
  purchaseOrderId: z.string().min(1).optional(),
  shipmentId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  supplierId: z.string().min(1).optional(),
  currency: currencySchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z
    .enum(['entryNumber', 'createdAt', 'updatedAt', 'amount', 'amountInBaseCurrency', 'occurredAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const listLedgerEntriesQuerySchema = ledgerListQueryBaseSchema;

export const exportLedgerEntriesQuerySchema = ledgerListQueryBaseSchema.omit({
  page: true,
  limit: true,
});

export const purchaseOrderProfitQuerySchema = z.object({
  purchaseOrderId: z.string().min(1),
});
