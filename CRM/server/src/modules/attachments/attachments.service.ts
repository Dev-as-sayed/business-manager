import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import { storage } from '@/shared/services/storage/storage.service';
import type { UploadFileInput } from '@/shared/services/storage/storage.types';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import { buildDataScope, customerScope } from '@/shared/utils/dataScope';
import type {
  AttachmentEntityType,
  ListAttachmentsQuery,
  UploadAttachmentInput,
} from '@/modules/attachments/attachments.types';

const attachmentSelect = {
  id: true,
  entityType: true,
  entityId: true,
  originalName: true,
  mimeType: true,
  size: true,
  storageProvider: true,
  storageKey: true,
  resourceType: true,
  format: true,
  uploadedById: true,
  createdAt: true,
  updatedAt: true,
  uploadedBy: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.AttachmentSelect;

type AttachmentDetail = Prisma.AttachmentGetPayload<{
  select: typeof attachmentSelect;
}>;

const entityReadRoles: Record<AttachmentEntityType, string[]> = {
  purchase_order: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'CHINA_OPERATIONS', 'FINANCE', 'CUSTOMER'],
  qc_report: ['SUPER_ADMIN', 'ADMIN', 'CHINA_OPERATIONS', 'CUSTOMER'],
  shipment: [
    'SUPER_ADMIN',
    'ADMIN',
    'SALES',
    'CHINA_OPERATIONS',
    'SHIPPING_AGENT',
    'FINANCE',
    'CUSTOMER',
  ],
  customs_record: ['SUPER_ADMIN', 'ADMIN', 'CHINA_OPERATIONS', 'SHIPPING_AGENT', 'FINANCE'],
  ledger_entry: ['SUPER_ADMIN', 'ADMIN', 'FINANCE'],
  product_request: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'CHINA_OPERATIONS', 'CUSTOMER'],
  quotation: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'FINANCE', 'CUSTOMER'],
};

const assertEntityAccess = (entityType: AttachmentEntityType, actor: AuthUser) => {
  const roles = entityReadRoles[entityType];

  if (!roles?.includes(actor.role)) {
    throw ApiError.forbidden('You do not have access to this entity type');
  }
};

const findEntityOrThrow = async (
  entityType: AttachmentEntityType,
  entityId: string,
  actor: AuthUser,
): Promise<{ customerId: string | null }> => {
  const customerFilter = buildDataScope(actor, [customerScope('customerId')]);

  switch (entityType) {
    case 'purchase_order': {
      const entity = await prisma.purchaseOrder.findFirst({
        where: {
          AND: [
            { id: entityId, deletedAt: null },
            customerFilter as Prisma.PurchaseOrderWhereInput,
          ],
        },
        select: { customerId: true },
      });

      if (!entity) {
        throw ApiError.notFound('Purchase order not found');
      }

      return entity;
    }
    case 'qc_report': {
      const entity = await prisma.qcReport.findFirst({
        where: {
          AND: [
            { id: entityId, deletedAt: null },
            actor.role === 'CHINA_OPERATIONS' ? { inspectorId: actor.id } : {},
            customerFilter as Prisma.QcReportWhereInput,
          ],
        },
        select: { customerId: true },
      });

      if (!entity) {
        throw ApiError.notFound('Quality control report not found');
      }

      return entity;
    }
    case 'shipment': {
      const entity = await prisma.shipment.findFirst({
        where: {
          AND: [{ id: entityId, deletedAt: null }, customerFilter as Prisma.ShipmentWhereInput],
        },
        select: { customerId: true },
      });

      if (!entity) {
        throw ApiError.notFound('Shipment not found');
      }

      return entity;
    }
    case 'customs_record': {
      const entity = await prisma.customsRecord.findFirst({
        where: {
          AND: [
            { id: entityId, deletedAt: null },
            customerFilter as Prisma.CustomsRecordWhereInput,
          ],
        },
        select: { customerId: true },
      });

      if (!entity) {
        throw ApiError.notFound('Customs record not found');
      }

      return entity;
    }
    case 'ledger_entry': {
      const entity = await prisma.ledgerEntry.findFirst({
        where: {
          AND: [{ id: entityId }, customerFilter as Prisma.LedgerEntryWhereInput],
        },
        select: { customerId: true },
      });

      if (!entity) {
        throw ApiError.notFound('Ledger entry not found');
      }

      return entity;
    }
    case 'product_request': {
      const entity = await prisma.productRequest.findFirst({
        where: {
          AND: [
            { id: entityId, deletedAt: null },
            customerFilter as Prisma.ProductRequestWhereInput,
          ],
        },
        select: { customerId: true },
      });

      if (!entity) {
        throw ApiError.notFound('Product request not found');
      }

      return entity;
    }
    case 'quotation': {
      const entity = await prisma.quotation.findFirst({
        where: {
          AND: [{ id: entityId, deletedAt: null }, customerFilter as Prisma.QuotationWhereInput],
        },
        select: { customerId: true },
      });

      if (!entity) {
        throw ApiError.notFound('Quotation not found');
      }

      return entity;
    }
  }
};

const findAttachmentOrThrow = async (id: string, actor: AuthUser): Promise<AttachmentDetail> => {
  const attachment = await prisma.attachment.findFirst({
    where: { id, deletedAt: null },
    select: attachmentSelect,
  });

  if (!attachment) {
    throw ApiError.notFound('Attachment not found');
  }

  const entityType = attachment.entityType as AttachmentEntityType;
  assertEntityAccess(entityType, actor);
  await findEntityOrThrow(entityType, attachment.entityId, actor);

  return attachment;
};

const toAttachmentResponse = async (attachment: AttachmentDetail) => {
  const {
    storageKey,
    storageProvider: _storageProvider,
    resourceType,
    format,
    ...response
  } = attachment;

  return {
    ...response,
    url: await storage.getSignedUrl({ storageKey, resourceType, format }),
  };
};

export const createAttachment = async (
  file: UploadFileInput,
  input: UploadAttachmentInput,
  actor: AuthUser,
  meta: RequestMeta,
) => {
  assertEntityAccess(input.entityType, actor);
  await findEntityOrThrow(input.entityType, input.entityId, actor);

  const stored = await storage.upload(file);

  let attachment: AttachmentDetail;

  try {
    attachment = await prisma.attachment.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        storageProvider: stored.storageProvider,
        storageKey: stored.storageKey,
        resourceType: stored.resourceType,
        format: stored.format,
        uploadedById: actor.id,
      },
      select: attachmentSelect,
    });
  } catch (error) {
    await storage.delete(stored).catch((cleanupError: unknown) => {
      logger.warn(
        { err: cleanupError, storageKey: stored.storageKey },
        'Attachment cleanup failed',
      );
    });
    throw error;
  }

  await writeAuditLog({
    actorId: actor.id,
    action: 'attachments.create',
    resource: 'attachments',
    resourceId: attachment.id,
    metadata: {
      entityType: attachment.entityType,
      entityId: attachment.entityId,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return toAttachmentResponse(attachment);
};

export const listAttachments = async (query: ListAttachmentsQuery, actor: AuthUser) => {
  assertEntityAccess(query.entityType, actor);
  await findEntityOrThrow(query.entityType, query.entityId, actor);

  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const where: Prisma.AttachmentWhereInput = {
    entityType: query.entityType,
    entityId: query.entityId,
    deletedAt: null,
    ...(query.search
      ? {
          OR: [
            { originalName: { contains: query.search, mode: 'insensitive' } },
            { mimeType: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.AttachmentOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.attachment.findMany({
      where,
      orderBy,
      skip,
      take,
      select: attachmentSelect,
    }),
    prisma.attachment.count({ where }),
  ]);

  return {
    items: await Promise.all(items.map(toAttachmentResponse)),
    meta: buildMeta(total, page, limit),
  };
};

export const getAttachment = async (id: string, actor: AuthUser) => {
  const attachment = await findAttachmentOrThrow(id, actor);
  return toAttachmentResponse(attachment);
};

export const deleteAttachment = async (
  id: string,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<void> => {
  const existing = await findAttachmentOrThrow(id, actor);

  await prisma.attachment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  try {
    await storage.delete({
      storageKey: existing.storageKey,
      resourceType: existing.resourceType,
      format: existing.format,
    });
  } catch (error) {
    logger.warn(
      { err: error, storageKey: existing.storageKey },
      'Failed to delete attachment from storage',
    );
  }

  await writeAuditLog({
    actorId: actor.id,
    action: 'attachments.delete',
    resource: 'attachments',
    resourceId: id,
    metadata: {
      entityType: existing.entityType,
      entityId: existing.entityId,
      originalName: existing.originalName,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });
};
