import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as notificationsService from '@/modules/notifications/notifications.service';
import type { RegisterDeviceTokenInput } from '@/modules/notifications/notifications.types';

export const registerDeviceToken = catchAsync(async (req, res) => {
  const token = await notificationsService.registerDeviceToken(
    req.user!.id,
    req.body as RegisterDeviceTokenInput,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Device registered for notifications',
    data: token,
  });
});

export const unregisterDeviceToken = catchAsync(async (req, res) => {
  await notificationsService.unregisterDeviceToken(req.user!.id, req.body.token as string);

  sendResponse(res, {
    message: 'Device unregistered',
    data: null,
  });
});
