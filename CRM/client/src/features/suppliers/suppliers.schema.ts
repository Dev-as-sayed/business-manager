import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  contactName: optionalText(150),
  email: z.union([z.email('Enter a valid email'), z.literal('')]).optional(),
  phone: optionalText(30),
  address: optionalText(500),
  city: optionalText(100),
  country: optionalText(100),
  taxId: optionalText(50),
  notes: optionalText(2000),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
