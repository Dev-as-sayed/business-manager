import { z } from 'zod';

const emailSchema = z.email().transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8).max(72);
const nameSchema = z.string().trim().min(1).max(100);

export const registerBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: z.string().trim().max(30).optional(),
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});

export const refreshBodySchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
  })
  .optional()
  .default({});

export const logoutBodySchema = refreshBodySchema;

export const forgotPasswordBodySchema = z.object({
  email: emailSchema,
});

export const resetPasswordBodySchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: passwordSchema,
});
