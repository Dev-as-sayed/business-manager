import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as supplierController from '@/modules/suppliers/suppliers.controller';
import {
  createSupplierBodySchema,
  listSuppliersQuerySchema,
  supplierIdParamsSchema,
  updateSupplierBodySchema,
  updateSupplierStatusBodySchema,
} from '@/modules/suppliers/suppliers.validation';

const suppliersRouter = Router();

suppliersRouter.use(auth);

suppliersRouter.post(
  '/',
  authorize('suppliers', 'create'),
  validate({ body: createSupplierBodySchema }),
  supplierController.createSupplier,
);
suppliersRouter.get(
  '/',
  authorize('suppliers', 'read'),
  validate({ query: listSuppliersQuerySchema }),
  supplierController.listSuppliers,
);
suppliersRouter.get(
  '/:id',
  authorize('suppliers', 'read'),
  validate({ params: supplierIdParamsSchema }),
  supplierController.getSupplier,
);
suppliersRouter.patch(
  '/:id/status',
  authorize('suppliers', 'update'),
  validate({ params: supplierIdParamsSchema, body: updateSupplierStatusBodySchema }),
  supplierController.updateSupplierStatus,
);
suppliersRouter.patch(
  '/:id',
  authorize('suppliers', 'update'),
  validate({ params: supplierIdParamsSchema, body: updateSupplierBodySchema }),
  supplierController.updateSupplier,
);
suppliersRouter.delete(
  '/:id',
  authorize('suppliers', 'delete'),
  validate({ params: supplierIdParamsSchema }),
  supplierController.deleteSupplier,
);

export { suppliersRouter };
