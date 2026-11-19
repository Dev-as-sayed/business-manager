import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as qualityControlController from '@/modules/quality-control/quality-control.controller';
import {
  createQcReportBodySchema,
  listQcReportsQuerySchema,
  qcReportIdParamsSchema,
  updateQcReportBodySchema,
  updateQcReportStatusBodySchema,
} from '@/modules/quality-control/quality-control.validation';

const qualityControlRouter = Router();

qualityControlRouter.use(auth);

qualityControlRouter.post(
  '/',
  authorize('quality_control', 'create'),
  validate({ body: createQcReportBodySchema }),
  qualityControlController.createQcReport,
);
qualityControlRouter.get(
  '/',
  authorize('quality_control', 'read'),
  validate({ query: listQcReportsQuerySchema }),
  qualityControlController.listQcReports,
);
qualityControlRouter.get(
  '/:id',
  authorize('quality_control', 'read'),
  validate({ params: qcReportIdParamsSchema }),
  qualityControlController.getQcReport,
);
qualityControlRouter.patch(
  '/:id/status',
  authorize('quality_control', 'update'),
  validate({
    params: qcReportIdParamsSchema,
    body: updateQcReportStatusBodySchema,
  }),
  qualityControlController.updateQcReportStatus,
);
qualityControlRouter.patch(
  '/:id',
  authorize('quality_control', 'update'),
  validate({
    params: qcReportIdParamsSchema,
    body: updateQcReportBodySchema,
  }),
  qualityControlController.updateQcReport,
);

export { qualityControlRouter };
