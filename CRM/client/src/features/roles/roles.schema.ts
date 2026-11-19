import { z } from 'zod';

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters')
    .max(50)
    .regex(/^[A-Za-z][A-Za-z0-9 _-]*$/, 'Letters, numbers, spaces, _ and - only'),
  description: z.string().trim().max(255).optional(),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
