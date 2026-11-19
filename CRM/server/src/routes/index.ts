import { Router } from 'express';
import httpStatus from 'http-status';
import { attachmentsRouter } from '@/modules/attachments/attachments.route';
import { authRouter } from '@/modules/auth/auth.route';
import { customsRouter } from '@/modules/customs/customs.route';
import { consignmentsRouter } from '@/modules/consignments/consignments.route';
import { customersRouter } from '@/modules/customers/customers.route';
import { directoryRouter } from '@/modules/directory/directory.route';
import { financeRouter } from '@/modules/finance/finance.route';
import { notificationsRouter } from '@/modules/notifications/notifications.route';
import { productRequestsRouter } from '@/modules/product-requests/product-requests.route';
import { purchaseOrdersRouter } from '@/modules/purchase-orders/purchase-orders.route';
import { qualityControlRouter } from '@/modules/quality-control/quality-control.route';
import { quotationsRouter } from '@/modules/quotations/quotations.route';
import { reportsRouter } from '@/modules/reports/reports.route';
import { rolesRouter } from '@/modules/roles/roles.route';
import { shipmentsRouter } from '@/modules/shipments/shipments.route';
import { suppliersRouter } from '@/modules/suppliers/suppliers.route';
import { usersRouter } from '@/modules/users/users.route';
import { sendResponse } from '@/shared/utils/sendResponse';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/roles', rolesRouter);
apiRouter.use('/suppliers', suppliersRouter);
apiRouter.use('/product-requests', productRequestsRouter);
apiRouter.use('/quotations', quotationsRouter);
apiRouter.use('/purchase-orders', purchaseOrdersRouter);
apiRouter.use('/quality-control', qualityControlRouter);
apiRouter.use('/shipments', shipmentsRouter);
apiRouter.use('/customs', customsRouter);
apiRouter.use('/finance', financeRouter);
apiRouter.use('/attachments', attachmentsRouter);
apiRouter.use('/consignments', consignmentsRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/directory', directoryRouter);
apiRouter.use('/notifications', notificationsRouter);

apiRouter.get('/', (_req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'CRM API',
    data: { version: 'v1' },
  });
});

// Register module routers here as they are built:
// apiRouter.use('/customers', customerRouter);

export { apiRouter };
