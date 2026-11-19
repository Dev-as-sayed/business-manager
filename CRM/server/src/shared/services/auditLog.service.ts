import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface AuditLogInput {
  actorId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const writeAuditLog = async (input: AuditLogInput): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        metadata: input.metadata,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    logger.error(
      { err: error, action: input.action, resource: input.resource },
      'Failed to write audit log',
    );
  }
};
