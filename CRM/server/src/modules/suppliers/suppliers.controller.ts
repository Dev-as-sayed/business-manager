import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as supplierService from '@/modules/suppliers/suppliers.service';
import type { ListSuppliersQuery } from '@/modules/suppliers/suppliers.types';

export const createSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.createSupplier(
    req.body,
    req.user!.id,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Supplier created',
    data: supplier,
  });
});

export const listSuppliers = catchAsync(async (req, res) => {
  const result = await supplierService.listSuppliers(req.query as unknown as ListSuppliersQuery);

  sendResponse(res, {
    message: 'Suppliers retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.getSupplier(req.params.id as string);

  sendResponse(res, {
    message: 'Supplier retrieved',
    data: supplier,
  });
});

export const updateSupplier = catchAsync(async (req, res) => {
  const supplier = await supplierService.updateSupplier(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Supplier updated',
    data: supplier,
  });
});

export const updateSupplierStatus = catchAsync(async (req, res) => {
  const supplier = await supplierService.updateSupplierStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Supplier status updated',
    data: supplier,
  });
});

export const deleteSupplier = catchAsync(async (req, res) => {
  await supplierService.deleteSupplier(req.params.id as string, req.user!, getRequestMeta(req));

  sendResponse(res, {
    message: 'Supplier deleted',
    data: null,
  });
});
