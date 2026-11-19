import httpStatus from 'http-status';
import { ApiError } from '@/shared/errors/ApiError';
import { catchAsync } from '@/shared/utils/catchAsync';
import { sendResponse } from '@/shared/utils/sendResponse';
import { checkDatabase } from '@/modules/health/health.service';

export const liveness = catchAsync(async (_req, res) => {
  sendResponse(res, {
    message: 'Service is alive',
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

export const readiness = catchAsync(async (_req, res) => {
  try {
    await checkDatabase();
  } catch {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Database is not ready');
  }

  sendResponse(res, {
    message: 'Service is ready',
    data: {
      status: 'ready',
      database: 'up',
      timestamp: new Date().toISOString(),
    },
  });
});
