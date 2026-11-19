import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as customerService from '@/modules/customers/customers.service';
import type { ListCustomersQuery } from '@/modules/customers/customers.types';

export const createCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.createCustomer(
    req.body,
    req.user!.id,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Customer created',
    data: customer,
  });
});

export const listCustomers = catchAsync(async (req, res) => {
  const result = await customerService.listCustomers(
    req.query as unknown as ListCustomersQuery,
    req.user!,
  );

  sendResponse(res, {
    message: 'Customers retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.getCustomer(req.params.id as string, req.user!);

  sendResponse(res, {
    message: 'Customer retrieved',
    data: customer,
  });
});

export const updateCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.updateCustomer(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Customer updated',
    data: customer,
  });
});

export const updateCustomerStatus = catchAsync(async (req, res) => {
  const customer = await customerService.updateCustomerStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Customer status updated',
    data: customer,
  });
});

export const deleteCustomer = catchAsync(async (req, res) => {
  await customerService.deleteCustomer(req.params.id as string, req.user!, getRequestMeta(req));

  sendResponse(res, {
    message: 'Customer deleted',
    data: null,
  });
});
