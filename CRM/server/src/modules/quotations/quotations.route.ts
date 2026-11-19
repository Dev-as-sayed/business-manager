import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as quotationController from '@/modules/quotations/quotations.controller';
import {
  createQuotationBodySchema,
  listQuotationsQuerySchema,
  quotationIdParamsSchema,
  updateQuotationBodySchema,
  updateQuotationStatusBodySchema,
} from '@/modules/quotations/quotations.validation';

const quotationsRouter = Router();

quotationsRouter.use(auth);

quotationsRouter.post(
  '/',
  authorize('quotations', 'create'),
  validate({ body: createQuotationBodySchema }),
  quotationController.createQuotation,
);
quotationsRouter.get(
  '/',
  authorize('quotations', 'read'),
  validate({ query: listQuotationsQuerySchema }),
  quotationController.listQuotations,
);
quotationsRouter.get(
  '/:id',
  authorize('quotations', 'read'),
  validate({ params: quotationIdParamsSchema }),
  quotationController.getQuotation,
);
quotationsRouter.patch(
  '/:id/status',
  authorize('quotations', 'update'),
  validate({
    params: quotationIdParamsSchema,
    body: updateQuotationStatusBodySchema,
  }),
  quotationController.updateQuotationStatus,
);
quotationsRouter.patch(
  '/:id/approve',
  authorize('quotations', 'approve'),
  validate({ params: quotationIdParamsSchema }),
  quotationController.approveQuotation,
);
quotationsRouter.patch(
  '/:id',
  authorize('quotations', 'update'),
  validate({
    params: quotationIdParamsSchema,
    body: updateQuotationBodySchema,
  }),
  quotationController.updateQuotation,
);
quotationsRouter.delete(
  '/:id',
  authorize('quotations', 'delete'),
  validate({ params: quotationIdParamsSchema }),
  quotationController.deleteQuotation,
);

export { quotationsRouter };
