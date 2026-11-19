import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as consignmentController from '@/modules/consignments/consignments.controller';
import {
  addProductBodySchema,
  addTransactionBodySchema,
  consignmentIdParamsSchema,
  consignmentUsersQuerySchema,
  createConsignmentBodySchema,
  listConsignmentsQuerySchema,
  updateConsignmentBodySchema,
  updateProductBodySchema,
} from '@/modules/consignments/consignments.validation';

const consignmentsRouter = Router();

consignmentsRouter.use(auth);

consignmentsRouter.get(
  '/users',
  authorize('consignments', 'read'),
  validate({ query: consignmentUsersQuerySchema }),
  consignmentController.listConsignmentsByUser,
);

consignmentsRouter.post(
  '/',
  authorize('consignments', 'create'),
  validate({ body: createConsignmentBodySchema }),
  consignmentController.createConsignment,
);

consignmentsRouter.get(
  '/',
  authorize('consignments', 'read'),
  validate({ query: listConsignmentsQuerySchema }),
  consignmentController.listConsignments,
);

consignmentsRouter.get(
  '/:id',
  authorize('consignments', 'read'),
  validate({ params: consignmentIdParamsSchema }),
  consignmentController.getConsignment,
);

consignmentsRouter.put(
  '/:id',
  authorize('consignments', 'update'),
  validate({ params: consignmentIdParamsSchema, body: updateConsignmentBodySchema }),
  consignmentController.updateConsignment,
);

consignmentsRouter.delete(
  '/:id',
  authorize('consignments', 'delete'),
  validate({ params: consignmentIdParamsSchema }),
  consignmentController.deleteConsignment,
);

consignmentsRouter.post(
  '/:id/product',
  authorize('consignments', 'update'),
  validate({ params: consignmentIdParamsSchema, body: addProductBodySchema }),
  consignmentController.addProduct,
);

consignmentsRouter.put(
  '/:id/product',
  authorize('consignments', 'update'),
  validate({ params: consignmentIdParamsSchema, body: updateProductBodySchema }),
  consignmentController.updateProduct,
);

consignmentsRouter.post(
  '/:id/payment',
  authorize('consignments', 'update'),
  validate({ params: consignmentIdParamsSchema, body: addTransactionBodySchema }),
  consignmentController.addTransaction,
);

export { consignmentsRouter };
