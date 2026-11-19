import { z } from 'zod';

const qcStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CANCELLED']);

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

const photoUrlsSchema = z.array(z.url()).max(20);

export const createQcReportBodySchema = z.object({
  purchaseOrderId: z.string().min(1),
  inspectorId: z.string().min(1).optional(),
  inspectionDate: optionalDate,
  notes: optionalText(2000),
  photoUrls: photoUrlsSchema.optional(),
});

export const updateQcReportBodySchema = z
  .object({
    inspectorId: z.string().min(1).optional(),
    inspectionDate: optionalDate,
    notes: optionalText(2000),
    photoUrls: photoUrlsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const updateQcReportStatusBodySchema = z.object({
  status: z.enum(['IN_PROGRESS', 'PASSED', 'FAILED', 'CANCELLED']),
});

export const qcReportIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listQcReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: qcStatusSchema.optional(),
  purchaseOrderId: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
  supplierId: z.string().min(1).optional(),
  inspectorId: z.string().min(1).optional(),
  sortBy: z.enum(['reportNumber', 'createdAt', 'updatedAt', 'inspectionDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
