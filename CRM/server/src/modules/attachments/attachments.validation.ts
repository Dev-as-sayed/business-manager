import { z } from 'zod';
import { ATTACHMENT_ENTITY_TYPES } from '@/modules/attachments/attachments.types';

const entityTypeSchema = z.enum(ATTACHMENT_ENTITY_TYPES);

export const uploadAttachmentBodySchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().min(1),
});

export const listAttachmentsQuerySchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().min(1),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(200).optional(),
  sortBy: z.enum(['createdAt', 'originalName', 'size']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const attachmentIdParamsSchema = z.object({
  id: z.string().min(1),
});
