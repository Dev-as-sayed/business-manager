import { z } from 'zod';

const productRequestStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'REVIEWING',
  'QUOTED',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? null : value));

const optionalId = z
  .union([z.string().min(1), z.literal('')])
  .optional()
  .transform((value) => (value === '' ? null : value));

const optionalPrice = z
  .union([z.literal(''), z.null(), z.coerce.number().nonnegative()])
  .optional()
  .transform((value) => (value === '' || value === null ? null : value));

const productRequestItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: optionalText(1000),
  quantity: z.coerce.number().int().min(1),
  targetPrice: optionalPrice,
  notes: optionalText(1000),
});

export const createProductRequestBodySchema = z.object({
  customerId: optionalId,
  title: z.string().trim().min(1).max(200),
  description: optionalText(2000),
  assignedUserId: optionalId,
  items: z.array(productRequestItemSchema).min(1).max(100),
});

export const updateProductRequestBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: optionalText(2000),
    items: z.array(productRequestItemSchema).min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateProductRequestStatusBodySchema = z.object({
  status: productRequestStatusSchema,
});

export const assignProductRequestBodySchema = z.object({
  assignedUserId: z
    .union([z.string().min(1), z.literal(''), z.null()])
    .transform((value) => (value === '' ? null : value)),
});

export const productRequestIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listProductRequestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: productRequestStatusSchema.optional(),
  customerId: z.string().min(1).optional(),
  assignedUserId: z.string().min(1).optional(),
  sortBy: z.enum(['requestNumber', 'title', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
