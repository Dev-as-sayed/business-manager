import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as purchaseOrderController from '@/modules/purchase-orders/purchase-orders.controller';
import {
  createPurchaseOrderBodySchema,
  listPurchaseOrdersQuerySchema,
  purchaseOrderIdParamsSchema,
  updatePurchaseOrderBodySchema,
  updatePurchaseOrderStatusBodySchema,
} from '@/modules/purchase-orders/purchase-orders.validation';

const purchaseOrdersRouter = Router();

purchaseOrdersRouter.use(auth);

purchaseOrdersRouter.post(
  '/',
  authorize('purchase_orders', 'create'),
  validate({ body: createPurchaseOrderBodySchema }),
  purchaseOrderController.createPurchaseOrder,
);
purchaseOrdersRouter.get(
  '/',
  authorize('purchase_orders', 'read'),
  validate({ query: listPurchaseOrdersQuerySchema }),
  purchaseOrderController.listPurchaseOrders,
);
purchaseOrdersRouter.get(
  '/:id',
  authorize('purchase_orders', 'read'),
  validate({ params: purchaseOrderIdParamsSchema }),
  purchaseOrderController.getPurchaseOrder,
);
purchaseOrdersRouter.patch(
  '/:id/status',
  authorize('purchase_orders', 'update'),
  validate({
    params: purchaseOrderIdParamsSchema,
    body: updatePurchaseOrderStatusBodySchema,
  }),
  purchaseOrderController.updatePurchaseOrderStatus,
);
purchaseOrdersRouter.patch(
  '/:id/approve',
  authorize('purchase_orders', 'approve'),
  validate({ params: purchaseOrderIdParamsSchema }),
  purchaseOrderController.approvePurchaseOrder,
);
purchaseOrdersRouter.patch(
  '/:id',
  authorize('purchase_orders', 'update'),
  validate({
    params: purchaseOrderIdParamsSchema,
    body: updatePurchaseOrderBodySchema,
  }),
  purchaseOrderController.updatePurchaseOrder,
);
purchaseOrdersRouter.delete(
  '/:id',
  authorize('purchase_orders', 'delete'),
  validate({ params: purchaseOrderIdParamsSchema }),
  purchaseOrderController.deletePurchaseOrder,
);

export { purchaseOrdersRouter };
