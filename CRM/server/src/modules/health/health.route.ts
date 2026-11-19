import { Router } from 'express';
import { liveness, readiness } from '@/modules/health/health.controller';

const healthRouter = Router();

healthRouter.get('/', liveness);
healthRouter.get('/ready', readiness);

export { healthRouter };
