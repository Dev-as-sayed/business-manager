import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const userFormSchema = z.object({
  email: z.email('Enter a valid email').max(255),
  password: z
    .union([z.string().min(8, 'Use at least 8 characters').max(72), z.literal('')])
    .optional(),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: optionalText(30),
  roleId: z.string().min(1, 'Select a role'),
  customerId: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
