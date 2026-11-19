import { Router } from 'express';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { validate } from '@/shared/middleware/validate';
import * as financeController from '@/modules/finance/finance.controller';
import {
  createLedgerEntryBodySchema,
  exportLedgerEntriesQuerySchema,
  ledgerEntryIdParamsSchema,
  listLedgerEntriesQuerySchema,
  purchaseOrderProfitQuerySchema,
  updateLedgerEntryBodySchema,
} from '@/modules/finance/finance.validation';

const financeRouter = Router();

financeRouter.use(auth);

financeRouter.post(
  '/ledger-entries',
  authorize('finance', 'create'),
  validate({ body: createLedgerEntryBodySchema }),
  financeController.createLedgerEntry,
);
financeRouter.get(
  '/ledger-entries',
  authorize('finance', 'read'),
  validate({ query: listLedgerEntriesQuerySchema }),
  financeController.listLedgerEntries,
);
financeRouter.get(
  '/ledger-entries/export',
  authorize('finance', 'export'),
  validate({ query: exportLedgerEntriesQuerySchema }),
  financeController.exportLedgerEntries,
);
financeRouter.get(
  '/ledger-entries/:id',
  authorize('finance', 'read'),
  validate({ params: ledgerEntryIdParamsSchema }),
  financeController.getLedgerEntry,
);
financeRouter.patch(
  '/ledger-entries/:id/approve',
  authorize('finance', 'approve'),
  validate({ params: ledgerEntryIdParamsSchema }),
  financeController.approveLedgerEntry,
);
financeRouter.patch(
  '/ledger-entries/:id/void',
  authorize('finance', 'approve'),
  validate({ params: ledgerEntryIdParamsSchema }),
  financeController.voidLedgerEntry,
);
financeRouter.patch(
  '/ledger-entries/:id',
  authorize('finance', 'update'),
  validate({
    params: ledgerEntryIdParamsSchema,
    body: updateLedgerEntryBodySchema,
  }),
  financeController.updateLedgerEntry,
);
financeRouter.get(
  '/profit',
  authorize('finance', 'read'),
  validate({ query: purchaseOrderProfitQuerySchema }),
  financeController.getPurchaseOrderProfit,
);

export { financeRouter };
