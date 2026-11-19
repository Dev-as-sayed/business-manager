import { z } from 'zod';

const shipmentStatusSchema = z.enum([
  'PENDING',
  'PREPARING',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
]);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? null : value));

const optionalDate = z
  .union([z.literal(''), z.null(), z.coerce.date()])
  .optional()
  .transform((value) => (value === '' || value === null ? null : value));

const shipmentItemSchema = z.object({
  purchaseOrderItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(1_000_000),
});

export const createShipmentBodySchema = z.object({
  carrier: optionalText(200),
  trackingNumber: optionalText(200),
  shippingMethod: optionalText(100),
  origin: optionalText(200),
  destination: optionalText(200),
  estimatedDeliveryDate: optionalDate,
  notes: optionalText(2000),
  items: z.array(shipmentItemSchema).min(1).max(200),
});

export const updateShipmentBodySchema = z
  .object({
    carrier: optionalText(200),
    trackingNumber: optionalText(200),
    shippingMethod: optionalText(100),
    origin: optionalText(200),
    destination: optionalText(200),
    estimatedDeliveryDate: optionalDate,
    notes: optionalText(2000),
    items: z.array(shipmentItemSchema).min(1).max(200).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateShipmentStatusBodySchema = z.object({
  status: z.enum(['PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']),
});

export const shipmentIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listShipmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: shipmentStatusSchema.optional(),
  customerId: z.string().min(1).optional(),
  purchaseOrderId: z.string().min(1).optional(),
  carrier: z.string().trim().max(200).optional(),
  trackingNumber: z.string().trim().max(200).optional(),
  sortBy: z
    .enum([
      'shipmentNumber',
      'createdAt',
      'updatedAt',
      'estimatedDeliveryDate',
      'actualDeliveryDate',
    ])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
