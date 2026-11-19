import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as shipmentController from '@/modules/shipments/shipments.controller';
import {
  createShipmentBodySchema,
  listShipmentsQuerySchema,
  shipmentIdParamsSchema,
  updateShipmentBodySchema,
  updateShipmentStatusBodySchema,
} from '@/modules/shipments/shipments.validation';

const shipmentsRouter = Router();

shipmentsRouter.use(auth);

shipmentsRouter.post(
  '/',
  authorize('shipments', 'create'),
  validate({ body: createShipmentBodySchema }),
  shipmentController.createShipment,
);
shipmentsRouter.get(
  '/',
  authorize('shipments', 'read'),
  validate({ query: listShipmentsQuerySchema }),
  shipmentController.listShipments,
);
shipmentsRouter.get(
  '/:id',
  authorize('shipments', 'read'),
  validate({ params: shipmentIdParamsSchema }),
  shipmentController.getShipment,
);
shipmentsRouter.patch(
  '/:id/status',
  authorize('shipments', 'update'),
  validate({
    params: shipmentIdParamsSchema,
    body: updateShipmentStatusBodySchema,
  }),
  shipmentController.updateShipmentStatus,
);
shipmentsRouter.patch(
  '/:id',
  authorize('shipments', 'update'),
  validate({
    params: shipmentIdParamsSchema,
    body: updateShipmentBodySchema,
  }),
  shipmentController.updateShipment,
);

export { shipmentsRouter };
