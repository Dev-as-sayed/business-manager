import { z } from 'zod';

const roleNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(50)
  .regex(/^[A-Za-z][A-Za-z0-9 _-]*$/, 'Role name contains invalid characters')
  .transform((value) => value.toUpperCase());

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? null : value));

const permissionKeySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z_]+:[a-z]+$/, 'Permission must be in resource:action format');

export const createRoleBodySchema = z.object({
  name: roleNameSchema,
  description: optionalText(255),
  permissions: z.array(permissionKeySchema).max(200).optional(),
});

export const updateRoleBodySchema = z
  .object({
    name: roleNameSchema.optional(),
    description: optionalText(255),
    permissions: z.array(permissionKeySchema).max(200).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const roleIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listRolesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
});
