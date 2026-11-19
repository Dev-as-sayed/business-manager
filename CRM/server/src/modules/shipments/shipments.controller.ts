import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as shipmentService from '@/modules/shipments/shipments.service';
import type { ListShipmentsQuery } from '@/modules/shipments/shipments.types';

export const createShipment = catchAsync(async (req, res) => {
  const shipment = await shipmentService.createShipment(req.body, req.user!, getRequestMeta(req));

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Shipment created',
    data: shipment,
  });
});

export const listShipments = catchAsync(async (req, res) => {
  const result = await shipmentService.listShipments(
    req.query as unknown as ListShipmentsQuery,
    req.user!,
  );

  sendResponse(res, {
    message: 'Shipments retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getShipment = catchAsync(async (req, res) => {
  const shipment = await shipmentService.getShipment(req.params.id as string, req.user!);

  sendResponse(res, {
    message: 'Shipment retrieved',
    data: shipment,
  });
});

export const updateShipment = catchAsync(async (req, res) => {
  const shipment = await shipmentService.updateShipment(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Shipment updated',
    data: shipment,
  });
});

export const updateShipmentStatus = catchAsync(async (req, res) => {
  const shipment = await shipmentService.updateShipmentStatus(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Shipment status updated',
    data: shipment,
  });
});
