import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as customsController from '@/modules/customs/customs.controller';
import {
  createCustomsRecordBodySchema,
  customsRecordIdParamsSchema,
  listCustomsRecordsQuerySchema,
  updateCustomsRecordBodySchema,
  updateCustomsStatusBodySchema,
} from '@/modules/customs/customs.validation';

const customsRouter = Router();

customsRouter.use(auth);

customsRouter.post(
  '/',
  authorize('customs', 'create'),
  validate({ body: createCustomsRecordBodySchema }),
  customsController.createCustomsRecord,
);
customsRouter.get(
  '/',
  authorize('customs', 'read'),
  validate({ query: listCustomsRecordsQuerySchema }),
  customsController.listCustomsRecords,
);
customsRouter.get(
  '/:id',
  authorize('customs', 'read'),
  validate({ params: customsRecordIdParamsSchema }),
  customsController.getCustomsRecord,
);
customsRouter.patch(
  '/:id/status',
  authorize('customs', 'update'),
  validate({
    params: customsRecordIdParamsSchema,
    body: updateCustomsStatusBodySchema,
  }),
  customsController.updateCustomsStatus,
);
customsRouter.patch(
  '/:id',
  authorize('customs', 'update'),
  validate({
    params: customsRecordIdParamsSchema,
    body: updateCustomsRecordBodySchema,
  }),
  customsController.updateCustomsRecord,
);
customsRouter.delete(
  '/:id',
  authorize('customs', 'delete'),
  validate({ params: customsRecordIdParamsSchema }),
  customsController.deleteCustomsRecord,
);

export { customsRouter };
