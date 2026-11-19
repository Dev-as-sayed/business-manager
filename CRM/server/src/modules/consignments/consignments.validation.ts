import { z } from 'zod';

const normalizeKey = (value: string): string =>
  value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

export const consignmentStatusSchema = z
  .string()
  .transform(normalizeKey)
  .pipe(
    z.enum(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'PARTIALLY_DELIVERED', 'REFUNDED']),
  );

const productCategorySchema = z
  .string()
  .transform(normalizeKey)
  .pipe(z.enum(['MOBILE', 'LAPTOP', 'ACCESSORY', 'OTHER']));

const productStatusSchema = z
  .string()
  .transform(normalizeKey)
  .pipe(z.enum(['PENDING', 'DELIVERED', 'REFUNDED', 'RETURNED', 'DAMAGED']));

const transactionMethodSchema = z
  .string()
  .transform(normalizeKey)
  .pipe(z.enum(['CASH', 'BANK', 'MOBILE', 'CARD', 'OTHER']));

const transactionTypeSchema = z
  .string()
  .transform(normalizeKey)
  .pipe(z.enum(['ADVANCE', 'PAYMENT', 'REFUND', 'PAY_IN', 'PAY_OUT']));

const transactionDirectionSchema = z
  .string()
  .transform(normalizeKey)
  .pipe(z.enum(['IN', 'OUT']));

const transactionPartySchema = z
  .string()
  .transform(normalizeKey)
  .pipe(z.enum(['CUSTOMER', 'SUPPLIER', 'COMPANY']));

const transactionStatusSchema = z
  .string()
  .transform(normalizeKey)
  .pipe(z.enum(['PENDING', 'COMPLETED', 'FAILED']));

const optionalText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.null()])
    .optional()
    .transform((value) => (value === '' ? null : value));

const optionalNullableDate = z
  .preprocess(
    (value) => (value === '' || value === null || value === undefined ? null : value),
    z.coerce.date().nullable(),
  )
  .optional();

const productBodySchema = z.object({
  category: productCategorySchema,
  brand: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(200),
  specs: optionalText(2000),
  buyingPrice: z.coerce.number().nonnegative(),
  sellingPrice: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().positive(),
  status: productStatusSchema.optional(),
  deliveredQuantity: z.coerce.number().int().nonnegative().optional(),
  refundedQuantity: z.coerce.number().int().nonnegative().optional(),
});

const transactionBodySchema = z.object({
  transactionId: z.string().trim().min(1).max(100),
  date: z.coerce.date().optional(),
  amount: z.coerce.number().nonnegative(),
  method: transactionMethodSchema,
  type: transactionTypeSchema,
  direction: transactionDirectionSchema,
  party: transactionPartySchema,
  note: optionalText(1000),
  addBy: z.union([z.string().trim().min(1), z.null()]).optional(),
  status: transactionStatusSchema.optional(),
});

export const createConsignmentBodySchema = z.object({
  consignmentId: z.string().trim().min(1).max(100),
  admin: z.string().trim().min(1),
  supplier: z.string().trim().min(1),
  customer: z.string().trim().min(1),
  products: z.array(productBodySchema).min(1),
  transactions: z.array(transactionBodySchema).optional().default([]),
  startDate: z.coerce.date().optional(),
  shippingDate: optionalNullableDate,
  deliveryDate: optionalNullableDate,
  shippingCost: z.coerce.number().nonnegative().optional().default(0),
  status: consignmentStatusSchema.optional(),
  destination: z.string().trim().min(1).max(200).optional().default('Bangladesh'),
});

export const updateConsignmentBodySchema = z
  .object({
    consignmentId: z.string().trim().min(1).max(100).optional(),
    admin: z.string().trim().min(1).optional(),
    supplier: z.string().trim().min(1).optional(),
    customer: z.string().trim().min(1).optional(),
    products: z.array(productBodySchema).min(1).optional(),
    transactions: z.array(transactionBodySchema).optional(),
    startDate: z.coerce.date().optional(),
    shippingDate: optionalNullableDate,
    deliveryDate: optionalNullableDate,
    shippingCost: z.coerce.number().nonnegative().optional(),
    status: consignmentStatusSchema.optional(),
    destination: z.string().trim().min(1).max(200).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateProductBodySchema = z.object({
  index: z.coerce.number().int().nonnegative(),
  product: productBodySchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'At least one product field is required',
  }),
});

export const addProductBodySchema = productBodySchema;
export const addTransactionBodySchema = transactionBodySchema;

export const consignmentIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listConsignmentsQuerySchema = z.object({
  status: consignmentStatusSchema.optional(),
  customerId: z.string().min(1).optional(),
  supplierId: z.string().min(1).optional(),
  destination: z.string().trim().max(200).optional(),
  search: z.string().trim().max(200).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const consignmentUsersQuerySchema = z.object({
  id: z.string().min(1),
  role: z
    .string()
    .transform(normalizeKey)
    .pipe(z.enum(['ADMIN', 'CUSTOMER', 'SUPPLIER'])),
});
