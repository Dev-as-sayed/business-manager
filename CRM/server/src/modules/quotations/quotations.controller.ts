import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as quotationService from '@/modules/quotations/quotations.service';
import type { ListQuotationsQuery } from '@/modules/quotations/quotations.types';

export const createQuotation = catchAsync(async (req, res) => {
  const quotation = await quotationService.createQuotation(
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Quotation created',
    data: quotation,
  });
});

export const listQuotations = catchAsync(async (req, res) => {
  const result = await quotationService.listQuotations(
    req.query as unknown as ListQuotationsQuery,
    req.user!,
  );

  sendResponse(res, {
    message: 'Quotations retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getQuotation = catchAsync(async (req, res) => {
  const quotation = await quotationService.getQuotation(req.params.id as string, req.user!);

  sendResponse(res, {
    message: 'Quotation retrieved',
    data: quotation,
  });
});

export const updateQuotation = catchAsync(async (req, res) => {
  const quotation = await quotationService.updateQuotation(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Quotation updated',
    data: quotation,
  });
});

export const updateQuotationStatus = catchAsync(async (req, res) => {
  const quotation = await quotationService.updateQuotationStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Quotation status updated',
    data: quotation,
  });
});

export const approveQuotation = catchAsync(async (req, res) => {
  const quotation = await quotationService.approveQuotation(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Quotation approved',
    data: quotation,
  });
});

export const deleteQuotation = catchAsync(async (req, res) => {
  await quotationService.deleteQuotation(req.params.id as string, req.user!, getRequestMeta(req));

  sendResponse(res, {
    message: 'Quotation deleted',
    data: null,
  });
});
