import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as reportController from '@/modules/reports/reports.controller';
import { reportsQuerySchema } from '@/modules/reports/reports.validation';

const reportsRouter = Router();

reportsRouter.use(auth);

reportsRouter.get(
  '/',
  authorize('reports', 'read'),
  validate({ query: reportsQuerySchema }),
  reportController.getReports,
);

export { reportsRouter };
