import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as productRequestController from '@/modules/product-requests/product-requests.controller';
import {
  assignProductRequestBodySchema,
  createProductRequestBodySchema,
  listProductRequestsQuerySchema,
  productRequestIdParamsSchema,
  updateProductRequestBodySchema,
  updateProductRequestStatusBodySchema,
} from '@/modules/product-requests/product-requests.validation';

const productRequestsRouter = Router();

productRequestsRouter.use(auth);

productRequestsRouter.post(
  '/',
  authorize('product_requests', 'create'),
  validate({ body: createProductRequestBodySchema }),
  productRequestController.createProductRequest,
);
productRequestsRouter.get(
  '/',
  authorize('product_requests', 'read'),
  validate({ query: listProductRequestsQuerySchema }),
  productRequestController.listProductRequests,
);
productRequestsRouter.get(
  '/:id',
  authorize('product_requests', 'read'),
  validate({ params: productRequestIdParamsSchema }),
  productRequestController.getProductRequest,
);
productRequestsRouter.patch(
  '/:id/status',
  authorize('product_requests', 'update'),
  validate({
    params: productRequestIdParamsSchema,
    body: updateProductRequestStatusBodySchema,
  }),
  productRequestController.updateProductRequestStatus,
);
productRequestsRouter.patch(
  '/:id/assign',
  authorize('product_requests', 'update'),
  validate({
    params: productRequestIdParamsSchema,
    body: assignProductRequestBodySchema,
  }),
  productRequestController.assignProductRequest,
);
productRequestsRouter.patch(
  '/:id',
  authorize('product_requests', 'update'),
  validate({
    params: productRequestIdParamsSchema,
    body: updateProductRequestBodySchema,
  }),
  productRequestController.updateProductRequest,
);
productRequestsRouter.delete(
  '/:id',
  authorize('product_requests', 'delete'),
  validate({ params: productRequestIdParamsSchema }),
  productRequestController.deleteProductRequest,
);

export { productRequestsRouter };
