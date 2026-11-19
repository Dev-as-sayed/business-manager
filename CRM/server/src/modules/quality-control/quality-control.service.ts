import { randomUUID } from 'node:crypto';
import { Prisma, PurchaseOrderStatus, QcStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/shared/errors/ApiError';
import { writeAuditLog } from '@/shared/services/auditLog.service';
import type { AuthUser, RequestMeta } from '@/shared/types';
import { buildDataScope, customerScope } from '@/shared/utils/dataScope';
import { buildMeta, parsePagination } from '@/shared/utils/pagination';
import type {
  CreateQcReportInput,
  ListQcReportsQuery,
  UpdateQcReportInput,
  UpdateQcReportStatusInput,
} from '@/modules/quality-control/quality-control.types';

const qcReportSelect = {
  id: true,
  reportNumber: true,
  purchaseOrderId: true,
  customerId: true,
  supplierId: true,
  inspectorId: true,
  status: true,
  inspectionDate: true,
  notes: true,
  photoUrls: true,
  createdById: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  purchaseOrder: { select: { id: true, orderNumber: true, status: true } },
  customer: { select: { id: true, name: true } },
  supplier: { select: { id: true, name: true } },
  inspector: { select: { id: true, firstName: true, lastName: true, email: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.QcReportSelect;

type QcReportDetail = Prisma.QcReportGetPayload<{
  select: typeof qcReportSelect;
}>;

const qcStatusTransitions: Record<QcStatus, QcStatus[]> = {
  [QcStatus.PENDING]: [QcStatus.IN_PROGRESS, QcStatus.CANCELLED],
  [QcStatus.IN_PROGRESS]: [QcStatus.PASSED, QcStatus.FAILED, QcStatus.CANCELLED],
  [QcStatus.FAILED]: [QcStatus.IN_PROGRESS],
  [QcStatus.PASSED]: [],
  [QcStatus.CANCELLED]: [],
};

const qcReportScope = (actor: AuthUser): Prisma.QcReportWhereInput =>
  actor.role === 'CHINA_OPERATIONS'
    ? { inspectorId: actor.id }
    : (buildDataScope(actor, [customerScope('customerId')]) as Prisma.QcReportWhereInput);

const findQcReportOrThrow = async (id: string, actor: AuthUser): Promise<QcReportDetail> => {
  const qcReport = await prisma.qcReport.findFirst({
    where: {
      AND: [{ id, deletedAt: null }, qcReportScope(actor)],
    },
    select: qcReportSelect,
  });

  if (!qcReport) {
    throw ApiError.notFound('Quality control report not found');
  }

  return qcReport;
};

const ensureOpsUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      status: 'ACTIVE',
      role: { name: 'CHINA_OPERATIONS' },
    },
    select: { id: true },
  });

  if (!user) {
    throw ApiError.badRequest('Inspector must be an active China operations user');
  }

  return user;
};

const resolveInspector = async (inspectorId: string | undefined, actor: AuthUser) => {
  if (actor.role === 'CHINA_OPERATIONS') {
    if (inspectorId && inspectorId !== actor.id) {
      throw ApiError.forbidden('Cannot assign an inspection to another user');
    }

    return actor.id;
  }

  if (!inspectorId) {
    throw ApiError.badRequest('inspectorId is required');
  }

  await ensureOpsUser(inspectorId);

  return inspectorId;
};

const resolveInspectorForUpdate = async (
  inspectorId: string | undefined,
  actor: AuthUser,
): Promise<string | undefined> => {
  if (inspectorId === undefined) {
    return undefined;
  }

  if (actor.role === 'CHINA_OPERATIONS') {
    if (inspectorId !== actor.id) {
      throw ApiError.forbidden('Cannot assign an inspection to another user');
    }

    return actor.id;
  }

  await ensureOpsUser(inspectorId);

  return inspectorId;
};

const getPurchaseOrderForQc = async (tx: Prisma.TransactionClient, purchaseOrderId: string) => {
  const purchaseOrder = await tx.purchaseOrder.findFirst({
    where: { id: purchaseOrderId, deletedAt: null },
    select: {
      id: true,
      orderNumber: true,
      customerId: true,
      supplierId: true,
      status: true,
    },
  });

  if (!purchaseOrder) {
    throw ApiError.notFound('Purchase order not found');
  }

  if (
    purchaseOrder.status !== PurchaseOrderStatus.APPROVED &&
    purchaseOrder.status !== PurchaseOrderStatus.IN_PRODUCTION
  ) {
    throw ApiError.badRequest(
      'Purchase order must be approved or in production before quality control',
    );
  }

  return purchaseOrder;
};

const generateReportNumber = () => `QC-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const createQcReport = async (
  input: CreateQcReportInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<QcReportDetail> => {
  const inspectorId = await resolveInspector(input.inspectorId, actor);

  const qcReport = await prisma.$transaction(async (tx) => {
    const purchaseOrder = await getPurchaseOrderForQc(tx, input.purchaseOrderId);

    return tx.qcReport.create({
      data: {
        reportNumber: generateReportNumber(),
        purchaseOrderId: purchaseOrder.id,
        customerId: purchaseOrder.customerId,
        supplierId: purchaseOrder.supplierId,
        inspectorId,
        inspectionDate: input.inspectionDate ?? null,
        notes: input.notes ?? null,
        photoUrls: input.photoUrls ?? [],
        createdById: actor.id,
      },
      select: qcReportSelect,
    });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'quality_control.create',
    resource: 'quality_control',
    resourceId: qcReport.id,
    metadata: {
      reportNumber: qcReport.reportNumber,
      purchaseOrderId: qcReport.purchaseOrderId,
      inspectorId: qcReport.inspectorId,
    },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return qcReport;
};

export const listQcReports = async (query: ListQcReportsQuery, actor: AuthUser) => {
  const { page, limit, skip, take } = parsePagination({
    page: query.page,
    limit: query.limit,
  });

  const conditions: Prisma.QcReportWhereInput[] = [{ deletedAt: null }, qcReportScope(actor)];

  if (query.status) {
    conditions.push({ status: query.status });
  }

  if (query.purchaseOrderId) {
    conditions.push({ purchaseOrderId: query.purchaseOrderId });
  }

  if (query.customerId) {
    conditions.push({ customerId: query.customerId });
  }

  if (query.supplierId) {
    conditions.push({ supplierId: query.supplierId });
  }

  if (query.inspectorId) {
    conditions.push({ inspectorId: query.inspectorId });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { reportNumber: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        {
          purchaseOrder: {
            orderNumber: { contains: query.search, mode: 'insensitive' },
          },
        },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
      ],
    });
  }

  const where: Prisma.QcReportWhereInput = { AND: conditions };

  const orderBy = {
    [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
  } as Prisma.QcReportOrderByWithRelationInput;

  const [items, total] = await prisma.$transaction([
    prisma.qcReport.findMany({
      where,
      orderBy,
      skip,
      take,
      select: qcReportSelect,
    }),
    prisma.qcReport.count({ where }),
  ]);

  return { items, meta: buildMeta(total, page, limit) };
};

export const getQcReport = async (id: string, actor: AuthUser): Promise<QcReportDetail> =>
  findQcReportOrThrow(id, actor);

export const updateQcReport = async (
  id: string,
  input: UpdateQcReportInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<QcReportDetail> => {
  const existing = await findQcReportOrThrow(id, actor);

  if (existing.status !== QcStatus.PENDING && existing.status !== QcStatus.IN_PROGRESS) {
    throw ApiError.badRequest('Only pending or in-progress quality control reports can be updated');
  }

  const inspectorId = await resolveInspectorForUpdate(input.inspectorId, actor);

  const qcReport = await prisma.qcReport.update({
    where: { id },
    data: {
      ...(inspectorId !== undefined ? { inspectorId } : {}),
      ...(input.inspectionDate !== undefined ? { inspectionDate: input.inspectionDate } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.photoUrls !== undefined ? { photoUrls: input.photoUrls } : {}),
    },
    select: qcReportSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'quality_control.update',
    resource: 'quality_control',
    resourceId: qcReport.id,
    metadata: { fields: Object.keys(input) },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return qcReport;
};

export const updateQcReportStatus = async (
  id: string,
  input: UpdateQcReportStatusInput,
  actor: AuthUser,
  meta: RequestMeta,
): Promise<QcReportDetail> => {
  const existing = await findQcReportOrThrow(id, actor);

  if (existing.status === input.status) {
    return existing;
  }

  if (!qcStatusTransitions[existing.status].includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot change quality control status from ${existing.status} to ${input.status}`,
    );
  }

  const qcReport = await prisma.qcReport.update({
    where: { id },
    data: {
      status: input.status,
      ...(input.status === QcStatus.PASSED || input.status === QcStatus.FAILED
        ? { completedAt: new Date() }
        : {}),
      ...(input.status === QcStatus.IN_PROGRESS || input.status === QcStatus.CANCELLED
        ? { completedAt: null }
        : {}),
    },
    select: qcReportSelect,
  });

  await writeAuditLog({
    actorId: actor.id,
    action: 'quality_control.status.update',
    resource: 'quality_control',
    resourceId: qcReport.id,
    metadata: { from: existing.status, to: input.status },
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return qcReport;
};
