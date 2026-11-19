import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as purchaseOrderService from '@/modules/purchase-orders/purchase-orders.service';
import type { ListPurchaseOrdersQuery } from '@/modules/purchase-orders/purchase-orders.types';

export const createPurchaseOrder = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Purchase order created',
    data: purchaseOrder,
  });
});

export const listPurchaseOrders = catchAsync(async (req, res) => {
  const result = await purchaseOrderService.listPurchaseOrders(
    req.query as unknown as ListPurchaseOrdersQuery,
    req.user!,
  );

  sendResponse(res, {
    message: 'Purchase orders retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getPurchaseOrder = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseOrderService.getPurchaseOrder(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    message: 'Purchase order retrieved',
    data: purchaseOrder,
  });
});

export const updatePurchaseOrder = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Purchase order updated',
    data: purchaseOrder,
  });
});

export const updatePurchaseOrderStatus = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseOrderService.updatePurchaseOrderStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Purchase order status updated',
    data: purchaseOrder,
  });
});

export const approvePurchaseOrder = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseOrderService.approvePurchaseOrder(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Purchase order approved',
    data: purchaseOrder,
  });
});

export const deletePurchaseOrder = catchAsync(async (req, res) => {
  await purchaseOrderService.deletePurchaseOrder(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Purchase order deleted',
    data: null,
  });
});
