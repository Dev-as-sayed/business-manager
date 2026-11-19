import { z } from 'zod';

const directoryRoleSchema = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .pipe(z.enum(['ADMIN', 'CUSTOMER', 'SUPPLIER']));

const emailSchema = z.email().transform((value) => value.toLowerCase());

const optionalText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.null()])
    .optional()
    .transform((value) => (value === '' ? null : value));

export const createDirectoryUserBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: emailSchema,
  password: z.string().min(8).max(72).optional(),
  role: directoryRoleSchema,
  phone: optionalText(30),
  address: optionalText(500),
  avatar: optionalText(500),
});

export const updateDirectoryUserBodySchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    email: emailSchema.optional(),
    password: z.string().min(8).max(72).optional(),
    phone: optionalText(30),
    address: optionalText(500),
    avatar: optionalText(500),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const directoryUserParamsSchema = z.object({
  id: z.string().min(1),
});

export const listDirectoryUsersQuerySchema = z.object({
  role: directoryRoleSchema,
});
