import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as productRequestService from '@/modules/product-requests/product-requests.service';
import type { ListProductRequestsQuery } from '@/modules/product-requests/product-requests.types';

export const createProductRequest = catchAsync(async (req, res) => {
  const productRequest = await productRequestService.createProductRequest(
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Product request created',
    data: productRequest,
  });
});

export const listProductRequests = catchAsync(async (req, res) => {
  const result = await productRequestService.listProductRequests(
    req.query as unknown as ListProductRequestsQuery,
    req.user!,
  );

  sendResponse(res, {
    message: 'Product requests retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getProductRequest = catchAsync(async (req, res) => {
  const productRequest = await productRequestService.getProductRequest(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    message: 'Product request retrieved',
    data: productRequest,
  });
});

export const updateProductRequest = catchAsync(async (req, res) => {
  const productRequest = await productRequestService.updateProductRequest(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Product request updated',
    data: productRequest,
  });
});

export const updateProductRequestStatus = catchAsync(async (req, res) => {
  const productRequest = await productRequestService.updateProductRequestStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Product request status updated',
    data: productRequest,
  });
});

export const assignProductRequest = catchAsync(async (req, res) => {
  const productRequest = await productRequestService.assignProductRequest(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Product request assigned',
    data: productRequest,
  });
});

export const deleteProductRequest = catchAsync(async (req, res) => {
  await productRequestService.deleteProductRequest(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Product request deleted',
    data: null,
  });
});
