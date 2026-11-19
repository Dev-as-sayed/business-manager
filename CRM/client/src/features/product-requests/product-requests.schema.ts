import { z } from 'zod';

export const productRequestFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  customerId: z.string().optional(),
  assignedUserId: z.string().optional(),
});

export type ProductRequestFormValues = z.infer<typeof productRequestFormSchema>;
