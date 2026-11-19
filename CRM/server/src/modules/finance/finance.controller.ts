import httpStatus from 'http-status';
import { catchAsync } from '@/shared/utils/catchAsync';
import { getRequestMeta } from '@/shared/utils/requestMeta';
import { sendResponse } from '@/shared/utils/sendResponse';
import * as financeService from '@/modules/finance/finance.service';
import type {
  LedgerExportQuery,
  ListLedgerEntriesQuery,
  PurchaseOrderProfitQuery,
} from '@/modules/finance/finance.types';

export const createLedgerEntry = catchAsync(async (req, res) => {
  const entry = await financeService.createLedgerEntry(req.body, req.user!, getRequestMeta(req));

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Ledger entry created',
    data: entry,
  });
});

export const listLedgerEntries = catchAsync(async (req, res) => {
  const result = await financeService.listLedgerEntries(
    req.query as unknown as ListLedgerEntriesQuery,
  );

  sendResponse(res, {
    message: 'Ledger entries retrieved',
    data: result.items,
    meta: result.meta,
  });
});

export const getLedgerEntry = catchAsync(async (req, res) => {
  const entry = await financeService.getLedgerEntry(req.params.id as string);

  sendResponse(res, {
    message: 'Ledger entry retrieved',
    data: entry,
  });
});

export const updateLedgerEntry = catchAsync(async (req, res) => {
  const entry = await financeService.updateLedgerEntry(
    req.params.id as string,
    req.body,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Ledger entry updated',
    data: entry,
  });
});

export const approveLedgerEntry = catchAsync(async (req, res) => {
  const entry = await financeService.approveLedgerEntry(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Ledger entry approved',
    data: entry,
  });
});

export const voidLedgerEntry = catchAsync(async (req, res) => {
  const entry = await financeService.voidLedgerEntry(
    req.params.id as string,
    req.user!,
    getRequestMeta(req),
  );

  sendResponse(res, {
    message: 'Ledger entry voided',
    data: entry,
  });
});

export const exportLedgerEntries = catchAsync(async (req, res) => {
  const result = await financeService.exportLedgerEntries(
    req.query as unknown as LedgerExportQuery,
    req.user!,
    getRequestMeta(req),
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ledger-entries.csv"');
  res.send(result.csv);
});

export const getPurchaseOrderProfit = catchAsync(async (req, res) => {
  const profit = await financeService.getPurchaseOrderProfit(
    req.query as unknown as PurchaseOrderProfitQuery,
  );

  sendResponse(res, {
    message: 'Purchase order profit retrieved',
    data: profit,
  });
});
