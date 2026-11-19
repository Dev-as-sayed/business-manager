import { z } from 'zod';

const emailSchema = z.email().transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8).max(72);
const nameSchema = z.string().trim().min(1).max(100);

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

export const createUserBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: optionalText(30),
  roleId: z.string().min(1),
  customerId: optionalId,
});

export const updateUserBodySchema = z
  .object({
    email: emailSchema.optional(),
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    phone: optionalText(30),
    roleId: z.string().min(1).optional(),
    customerId: optionalId,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateUserStatusBodySchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export const userIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  role: z
    .string()
    .trim()
    .max(50)
    .transform((value) => value.toUpperCase())
    .optional(),
  customerId: z.string().min(1).optional(),
  sortBy: z
    .enum(['email', 'firstName', 'lastName', 'createdAt', 'lastLoginAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
