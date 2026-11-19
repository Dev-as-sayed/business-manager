import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use at most 72 characters');

export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required').max(72),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is missing'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm the new password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(72),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm the new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
