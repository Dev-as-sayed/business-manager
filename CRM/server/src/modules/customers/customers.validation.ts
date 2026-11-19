import { z } from 'zod';

const customerStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']);

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

export const createCustomerBodySchema = z.object({
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

export const updateCustomerBodySchema = z
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

export const updateCustomerStatusBodySchema = z.object({
  status: customerStatusSchema,
});

export const customerIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: customerStatusSchema.optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
