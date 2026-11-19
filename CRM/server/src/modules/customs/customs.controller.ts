import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as customsService from '@/modules/customs/customs.service';
import type { ListCustomsRecordsQuery } from '@/modules/customs/customs.types';

export const createCustomsRecord = catchAsync(async (req, res) => {
  const customsRecord = await customsService.createCustomsRecord(
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Customs record created',
    data: customsRecord,
  });
});

export const listCustomsRecords = catchAsync(async (req, res) => {
  const result = await customsService.listCustomsRecords(
    req.query as unknown as ListCustomsRecordsQuery,
  );

  sendResponse(res, {
    message: 'Customs records retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getCustomsRecord = catchAsync(async (req, res) => {
  const customsRecord = await customsService.getCustomsRecord(req.params.id as string);

  sendResponse(res, {
    message: 'Customs record retrieved',
    data: customsRecord,
  });
});

export const updateCustomsRecord = catchAsync(async (req, res) => {
  const customsRecord = await customsService.updateCustomsRecord(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Customs record updated',
    data: customsRecord,
  });
});

export const updateCustomsStatus = catchAsync(async (req, res) => {
  const customsRecord = await customsService.updateCustomsStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Customs status updated',
    data: customsRecord,
  });
});

export const deleteCustomsRecord = catchAsync(async (req, res) => {
  await customsService.deleteCustomsRecord(req.params.id as string, req.user!, getRequestMeta(req));

  sendResponse(res, {
    message: 'Customs record deleted',
    data: null,
  });
});
