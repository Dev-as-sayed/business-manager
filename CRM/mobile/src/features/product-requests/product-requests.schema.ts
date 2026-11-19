import { z } from 'zod';

export const productRequestItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  description: z.string().trim().optional(),
  quantity: z
    .string()
    .trim()
    .min(1, 'Quantity is required')
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, 'Use a whole number'),
  targetPrice: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
      'Enter a valid price',
    ),
  notes: z.string().trim().optional(),
});

export const createProductRequestSchema = z.object({
  title: z.string().trim().min(3, 'Give the request a title'),
  description: z.string().trim().optional(),
  items: z.array(productRequestItemSchema).min(1, 'Add at least one item'),
});

export type ProductRequestItemFormValues = z.infer<typeof productRequestItemSchema>;
export type CreateProductRequestFormValues = z.infer<typeof createProductRequestSchema>;
