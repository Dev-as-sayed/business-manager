import { catchAsync } from '@/shared/utils/catchAsync';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as reportService from '@/modules/reports/reports.service';
import type { ReportsQuery } from '@/modules/reports/reports.types';

export const getReports = catchAsync(async (req, res) => {
  const report = await reportService.getReports(req.query as unknown as ReportsQuery);

  sendResponse(res, {
    message: 'Report retrieved',
    data: report,
  });
});
