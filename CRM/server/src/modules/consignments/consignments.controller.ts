import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as consignmentService from '@/modules/consignments/consignments.service';
import type {
  DirectoryRole,
  ListConsignmentsQuery,
} from '@/modules/consignments/consignments.types';

export const createConsignment = catchAsync(async (req, res) => {
  const consignment = await consignmentService.createConsignment(
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Consignment created',
    data: consignment,
  });
});

export const listConsignments = catchAsync(async (req, res) => {
  const consignments = await consignmentService.listConsignments(
    req.query as unknown as ListConsignmentsQuery,
  );

  sendResponse(res, {
    message: 'Consignments retrieved',
    data: consignments,
  });
});

export const listConsignmentsByUser = catchAsync(async (req, res) => {
  const { id, role } = req.query as unknown as { id: string; role: DirectoryRole };
  const consignments = await consignmentService.listConsignmentsByUser(id, role);

  sendResponse(res, {
    message: 'Consignments retrieved',
    data: consignments,
  });
});

export const getConsignment = catchAsync(async (req, res) => {
  const consignment = await consignmentService.getConsignment(req.params.id as string);

  sendResponse(res, {
    message: 'Consignment retrieved',
    data: consignment,
  });
});

export const updateConsignment = catchAsync(async (req, res) => {
  const consignment = await consignmentService.updateConsignment(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Consignment updated',
    data: consignment,
  });
});

export const deleteConsignment = catchAsync(async (req, res) => {
  await consignmentService.deleteConsignment(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Consignment deleted',
    data: null,
  });
});

export const addProduct = catchAsync(async (req, res) => {
  const consignment = await consignmentService.addProduct(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Product added',
    data: consignment,
  });
});

export const updateProduct = catchAsync(async (req, res) => {
  const consignment = await consignmentService.updateProduct(
    req.params.id as string,
    req.body.index,
    req.body.product,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Product updated',
    data: consignment,
  });
});

export const addTransaction = catchAsync(async (req, res) => {
  const consignment = await consignmentService.addTransaction(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Transaction added',
    data: consignment,
  });
});
