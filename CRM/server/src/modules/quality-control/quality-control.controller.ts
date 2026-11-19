import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as qualityControlService from '@/modules/quality-control/quality-control.service';
import type { ListQcReportsQuery } from '@/modules/quality-control/quality-control.types';

export const createQcReport = catchAsync(async (req, res) => {
  const qcReport = await qualityControlService.createQcReport(
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Quality control report created',
    data: qcReport,
  });
});

export const listQcReports = catchAsync(async (req, res) => {
  const result = await qualityControlService.listQcReports(
    req.query as unknown as ListQcReportsQuery,
    req.user!,
  );

  sendResponse(res, {
    message: 'Quality control reports retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getQcReport = catchAsync(async (req, res) => {
  const qcReport = await qualityControlService.getQcReport(req.params.id as string, req.user!);

  sendResponse(res, {
    message: 'Quality control report retrieved',
    data: qcReport,
  });
});

export const updateQcReport = catchAsync(async (req, res) => {
  const qcReport = await qualityControlService.updateQcReport(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Quality control report updated',
    data: qcReport,
  });
});

export const updateQcReportStatus = catchAsync(async (req, res) => {
  const qcReport = await qualityControlService.updateQcReportStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Quality control report status updated',
    data: qcReport,
  });
});
