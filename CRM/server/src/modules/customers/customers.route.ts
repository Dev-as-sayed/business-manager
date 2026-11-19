import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as customerController from '@/modules/customers/customers.controller';
import {
  createCustomerBodySchema,
  customerIdParamsSchema,
  listCustomersQuerySchema,
  updateCustomerBodySchema,
  updateCustomerStatusBodySchema,
} from '@/modules/customers/customers.validation';

const customersRouter = Router();

customersRouter.use(auth);

customersRouter.post(
  '/',
  authorize('customers', 'create'),
  validate({ body: createCustomerBodySchema }),
  customerController.createCustomer,
);
customersRouter.get(
  '/',
  authorize('customers', 'read'),
  validate({ query: listCustomersQuerySchema }),
  customerController.listCustomers,
);
customersRouter.get(
  '/:id',
  authorize('customers', 'read'),
  validate({ params: customerIdParamsSchema }),
  customerController.getCustomer,
);
customersRouter.patch(
  '/:id/status',
  authorize('customers', 'update'),
  validate({ params: customerIdParamsSchema, body: updateCustomerStatusBodySchema }),
  customerController.updateCustomerStatus,
);
customersRouter.patch(
  '/:id',
  authorize('customers', 'update'),
  validate({ params: customerIdParamsSchema, body: updateCustomerBodySchema }),
  customerController.updateCustomer,
);
customersRouter.delete(
  '/:id',
  authorize('customers', 'delete'),
  validate({ params: customerIdParamsSchema }),
  customerController.deleteCustomer,
);

export { customersRouter };
