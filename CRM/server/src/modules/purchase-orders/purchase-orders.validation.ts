import { z } from 'zod';

const purchaseOrderStatusSchema = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'IN_PRODUCTION',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
]);

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
const quantitySchema = z.coerce.number().int().min(1).max(1_000_000);

const purchaseOrderItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: optionalText(1000),
  quantity: quantitySchema,
  unitCost: moneySchema,
  notes: optionalText(1000),
});

export const createPurchaseOrderBodySchema = z.object({
  quotationId: z.string().min(1),
  supplierId: z.string().min(1),
  shippingFee: moneySchema.optional(),
  tax: moneySchema.optional(),
  expectedDeliveryDate: optionalDate,
  notes: optionalText(2000),
  items: z.array(purchaseOrderItemSchema).min(1).max(100),
});

export const updatePurchaseOrderBodySchema = z
  .object({
    supplierId: z.string().min(1).optional(),
    shippingFee: moneySchema.optional(),
    tax: moneySchema.optional(),
    expectedDeliveryDate: optionalDate,
    notes: optionalText(2000),
    items: z.array(purchaseOrderItemSchema).min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updatePurchaseOrderStatusBodySchema = z.object({
  status: z.enum(['PENDING_APPROVAL', 'CANCELLED', 'IN_PRODUCTION', 'SHIPPED', 'COMPLETED']),
});

export const purchaseOrderIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listPurchaseOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: purchaseOrderStatusSchema.optional(),
  customerId: z.string().min(1).optional(),
  supplierId: z.string().min(1).optional(),
  quotationId: z.string().min(1).optional(),
  sortBy: z
    .enum(['orderNumber', 'createdAt', 'updatedAt', 'total', 'expectedDeliveryDate'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
