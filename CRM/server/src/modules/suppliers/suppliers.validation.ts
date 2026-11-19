import { z } from 'zod';

const supplierStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? null : value));

const optionalEmail = z
  .union([z.email(), z.literal('')])
  .optional()
  .transform((value) => (value === '' ? null : value));

export const createSupplierBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  contactName: optionalText(150),
  email: optionalEmail,
  phone: optionalText(30),
  address: optionalText(500),
  city: optionalText(100),
  country: optionalText(100),
  taxId: optionalText(50),
  notes: optionalText(2000),
});

export const updateSupplierBodySchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    contactName: optionalText(150),
    email: optionalEmail,
    phone: optionalText(30),
    address: optionalText(500),
    city: optionalText(100),
    country: optionalText(100),
    taxId: optionalText(50),
    notes: optionalText(2000),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateSupplierStatusBodySchema = z.object({
  status: supplierStatusSchema,
});

export const supplierIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listSuppliersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: supplierStatusSchema.optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
