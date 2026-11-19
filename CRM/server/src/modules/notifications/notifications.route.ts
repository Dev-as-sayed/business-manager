import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { validate } from '@/shared/middleware/validate';
import * as notificationsController from '@/modules/notifications/notifications.controller';
import {
  registerDeviceTokenBodySchema,
  unregisterDeviceTokenBodySchema,
} from '@/modules/notifications/notifications.validation';

const notificationsRouter = Router();

notificationsRouter.use(auth);

notificationsRouter.post(
  '/device-tokens',
  validate({ body: registerDeviceTokenBodySchema }),
  notificationsController.registerDeviceToken,
);
notificationsRouter.post(
  '/device-tokens/unregister',
  validate({ body: unregisterDeviceTokenBodySchema }),
  notificationsController.unregisterDeviceToken,
);

export { notificationsRouter };
