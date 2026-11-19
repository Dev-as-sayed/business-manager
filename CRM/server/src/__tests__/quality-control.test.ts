import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.quality.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const opsEmail = `test.quality.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const opsTwoEmail = `test.quality.ops-two.${unique}@example.com`;
const opsTwoPassword = 'OpsTwoPass123!';
const salesEmail = `test.quality.sales.${unique}@example.com`;
const salesPassword = 'SalesPass123!';
const financeEmail = `test.quality.finance.${unique}@example.com`;
const financePassword = 'FinancePass123!';
const portalEmail = `test.quality.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';

const customerName = `Quality Control Customer ${unique}`;
const supplierName = `Quality Control Supplier ${unique}`;

let adminId: string;
let opsUserId: string;
let opsTwoUserId: string;
let salesUserId: string;
let financeUserId: string;
let portalUserId: string;
let adminAccessToken: string;
let opsAccessToken: string;
let opsTwoAccessToken: string;
let salesAccessToken: string;
let financeAccessToken: string;
let portalAccessToken: string;
let customerId: string;
let supplierId: string;
let productRequestId: string;
let quotationId: string;
let approvedPurchaseOrderId: string;
let approvedPurchaseOrderNumber: string;
let inProductionPurchaseOrderId: string;
let draftPurchaseOrderId: string;
let cancelledPurchaseOrderId: string;
let shippedPurchaseOrderId: string;
let reportOneId: string;
let reportOneNumber: string;
let reportTwoId: string;
let reportThreeId: string;
let reportFourId: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

let counter = 0;

const createPurchaseOrder = async (
  status: 'APPROVED' | 'IN_PRODUCTION' | 'DRAFT' | 'CANCELLED' | 'SHIPPED',
) => {
  counter += 1;

  return prisma.purchaseOrder.create({
    data: {
      orderNumber: `PO-QC-TEST-${unique}-${counter}`,
      quotationId,
      customerId,
      supplierId,
      status,
      currency: 'USD',
      subtotal: 100,
      shippingFee: 0,
      tax: 0,
      total: 100,
      createdById: adminId,
      approvedById:
        status === 'APPROVED' || status === 'IN_PRODUCTION' || status === 'SHIPPED'
          ? adminId
          : null,
      approvedAt:
        status === 'APPROVED' || status === 'IN_PRODUCTION' || status === 'SHIPPED'
          ? new Date()
          : null,
    },
  });
};

beforeAll(async () => {
  const [superAdminRole, opsRole, salesRole, financeRole, customerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CHINA_OPERATIONS' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'SALES' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'FINANCE' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CUSTOMER' } }),
  ]);

  const customer = await prisma.customer.create({ data: { name: customerName } });
  customerId = customer.id;

  const supplier = await prisma.supplier.create({ data: { name: supplierName } });
  supplierId = supplier.id;

  const [admin, opsUser, opsTwoUser, salesUser, financeUser, portalUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        firstName: 'Test',
        lastName: 'Admin',
        roleId: superAdminRole.id,
      },
    }),
    prisma.user.create({
      data: {
        email: opsEmail,
        passwordHash: await bcrypt.hash(opsPassword, 10),
        firstName: 'Ops',
        lastName: 'One',
        roleId: opsRole.id,
      },
    }),
    prisma.user.create({
      data: {
        email: opsTwoEmail,
        passwordHash: await bcrypt.hash(opsTwoPassword, 10),
        firstName: 'Ops',
        lastName: 'Two',
        roleId: opsRole.id,
      },
    }),
    prisma.user.create({
      data: {
        email: salesEmail,
        passwordHash: await bcrypt.hash(salesPassword, 10),
        firstName: 'Sales',
        lastName: 'User',
        roleId: salesRole.id,
      },
    }),
    prisma.user.create({
      data: {
        email: financeEmail,
        passwordHash: await bcrypt.hash(financePassword, 10),
        firstName: 'Finance',
        lastName: 'User',
        roleId: financeRole.id,
      },
    }),
    prisma.user.create({
      data: {
        email: portalEmail,
        passwordHash: await bcrypt.hash(portalPassword, 10),
        firstName: 'Portal',
        lastName: 'User',
        roleId: customerRole.id,
        customerId: customer.id,
      },
    }),
  ]);

  adminId = admin.id;
  opsUserId = opsUser.id;
  opsTwoUserId = opsTwoUser.id;
  salesUserId = salesUser.id;
  financeUserId = financeUser.id;
  portalUserId = portalUser.id;

  const productRequest = await prisma.productRequest.create({
    data: {
      requestNumber: `PR-QC-TEST-${unique}`,
      customerId,
      title: `Quality control request ${unique}`,
      status: 'APPROVED',
      createdById: adminId,
    },
  });
  productRequestId = productRequest.id;

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-QC-TEST-${unique}`,
      productRequestId,
      customerId,
      status: 'APPROVED',
      currency: 'USD',
      serviceFeeRate: 0,
      subtotal: 100,
      serviceFee: 0,
      shippingFee: 0,
      tax: 0,
      total: 100,
      createdById: adminId,
      approvedById: adminId,
      approvedAt: new Date(),
      items: {
        create: [{ name: 'QC item', quantity: 1, unitPrice: 100 }],
      },
    },
  });
  quotationId = quotation.id;

  const approvedPurchaseOrder = await createPurchaseOrder('APPROVED');
  approvedPurchaseOrderId = approvedPurchaseOrder.id;
  approvedPurchaseOrderNumber = approvedPurchaseOrder.orderNumber;

  const inProductionPurchaseOrder = await createPurchaseOrder('IN_PRODUCTION');
  inProductionPurchaseOrderId = inProductionPurchaseOrder.id;

  const draftPurchaseOrder = await createPurchaseOrder('DRAFT');
  draftPurchaseOrderId = draftPurchaseOrder.id;

  const cancelledPurchaseOrder = await createPurchaseOrder('CANCELLED');
  cancelledPurchaseOrderId = cancelledPurchaseOrder.id;

  const shippedPurchaseOrder = await createPurchaseOrder('SHIPPED');
  shippedPurchaseOrderId = shippedPurchaseOrder.id;

  const [adminLogin, opsLogin, opsTwoLogin, salesLogin, financeLogin, portalLogin] =
    await Promise.all([
      login(adminEmail, adminPassword),
      login(opsEmail, opsPassword),
      login(opsTwoEmail, opsTwoPassword),
      login(salesEmail, salesPassword),
      login(financeEmail, financePassword),
      login(portalEmail, portalPassword),
    ]);

  adminAccessToken = adminLogin.body.data.accessToken;
  opsAccessToken = opsLogin.body.data.accessToken;
  opsTwoAccessToken = opsTwoLogin.body.data.accessToken;
  salesAccessToken = salesLogin.body.data.accessToken;
  financeAccessToken = financeLogin.body.data.accessToken;
  portalAccessToken = portalLogin.body.data.accessToken;
});

afterAll(async () => {
  const userIds = [
    adminId,
    opsUserId,
    opsTwoUserId,
    salesUserId,
    financeUserId,
    portalUserId,
  ].filter((id): id is string => Boolean(id));
  const customerIds = [customerId].filter((id): id is string => Boolean(id));
  const supplierIds = [supplierId].filter((id): id is string => Boolean(id));
  const productRequestIds = [productRequestId].filter((id): id is string => Boolean(id));
  const quotationIds = [quotationId].filter((id): id is string => Boolean(id));
  const purchaseOrderIds = [
    approvedPurchaseOrderId,
    inProductionPurchaseOrderId,
    draftPurchaseOrderId,
    cancelledPurchaseOrderId,
    shippedPurchaseOrderId,
  ].filter((id): id is string => Boolean(id));
  const qcReportIds = [reportOneId, reportTwoId, reportThreeId, reportFourId].filter(
    (id): id is string => Boolean(id),
  );

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        {
          resourceId: {
            in: [
              ...qcReportIds,
              ...purchaseOrderIds,
              ...quotationIds,
              ...productRequestIds,
              ...supplierIds,
              ...customerIds,
            ],
          },
        },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: opsEmail } },
        { metadata: { path: ['email'], equals: opsTwoEmail } },
        { metadata: { path: ['email'], equals: salesEmail } },
        { metadata: { path: ['email'], equals: financeEmail } },
        { metadata: { path: ['email'], equals: portalEmail } },
      ],
    },
  });
  await prisma.qcReport.deleteMany({ where: { id: { in: qcReportIds } } });
  await prisma.purchaseOrder.deleteMany({ where: { id: { in: purchaseOrderIds } } });
  await prisma.quotation.deleteMany({ where: { id: { in: quotationIds } } });
  await prisma.productRequest.deleteMany({ where: { id: { in: productRequestIds } } });
  await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('quality-control module', () => {
  it('requires authentication and validates quality control payloads', async () => {
    const unauthenticated = await request(app).get('/api/v1/quality-control');
    expect(unauthenticated.status).toBe(401);

    const missingPurchaseOrder = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Missing purchase order' });

    expect(missingPurchaseOrder.status).toBe(400);
    expect(missingPurchaseOrder.body.message).toBe('Validation failed');

    const invalidDate = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        purchaseOrderId: approvedPurchaseOrderId,
        inspectionDate: 'not-a-date',
      });

    expect(invalidDate.status).toBe(400);

    const invalidPhotoUrl = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        purchaseOrderId: approvedPurchaseOrderId,
        photoUrls: ['not-a-url'],
      });

    expect(invalidPhotoUrl.status).toBe(400);

    const missingOrder = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({ purchaseOrderId: 'does-not-exist' });

    expect(missingOrder.status).toBe(404);
    expect(missingOrder.body.message).toBe('Purchase order not found');

    const draftOrder = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({ purchaseOrderId: draftPurchaseOrderId });

    expect(draftOrder.status).toBe(400);
    expect(draftOrder.body.message).toBe(
      'Purchase order must be approved or in production before quality control',
    );

    const cancelledOrder = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({ purchaseOrderId: cancelledPurchaseOrderId });

    expect(cancelledOrder.status).toBe(400);

    const shippedOrder = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({ purchaseOrderId: shippedPurchaseOrderId });

    expect(shippedOrder.status).toBe(400);

    const assignAnotherInspector = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        purchaseOrderId: approvedPurchaseOrderId,
        inspectorId: opsTwoUserId,
      });

    expect(assignAnotherInspector.status).toBe(403);
    expect(assignAnotherInspector.body.message).toBe('Cannot assign an inspection to another user');

    const adminMissingInspector = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(adminAccessToken))
      .send({ purchaseOrderId: approvedPurchaseOrderId });

    expect(adminMissingInspector.status).toBe(400);
    expect(adminMissingInspector.body.message).toBe('inspectorId is required');

    const adminInvalidInspector = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        purchaseOrderId: approvedPurchaseOrderId,
        inspectorId: salesUserId,
      });

    expect(adminInvalidInspector.status).toBe(400);
    expect(adminInvalidInspector.body.message).toBe(
      'Inspector must be an active China operations user',
    );

    const adminMissingInspectorUser = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        purchaseOrderId: approvedPurchaseOrderId,
        inspectorId: 'does-not-exist',
      });

    expect(adminMissingInspectorUser.status).toBe(400);
  });

  it('creates quality control reports with photos and derived order data', async () => {
    const response = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        purchaseOrderId: approvedPurchaseOrderId,
        inspectionDate: '2027-04-01T00:00:00.000Z',
        notes: 'Initial inspection',
        photoUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      purchaseOrderId: approvedPurchaseOrderId,
      customerId,
      supplierId,
      inspectorId: opsUserId,
      createdById: opsUserId,
      status: 'PENDING',
      notes: 'Initial inspection',
      completedAt: null,
    });
    expect(response.body.data.reportNumber).toMatch(/^QC-\d+-[A-F0-9]{8}$/);
    expect(response.body.data.inspectionDate).toBe('2027-04-01T00:00:00.000Z');
    expect(response.body.data.photoUrls).toEqual([
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ]);
    expect(response.body.data.purchaseOrder).toMatchObject({
      id: approvedPurchaseOrderId,
      orderNumber: approvedPurchaseOrderNumber,
      status: 'APPROVED',
    });
    expect(response.body.data.customer).toMatchObject({ id: customerId });
    expect(response.body.data.supplier).toMatchObject({ id: supplierId });
    expect(response.body.data.inspector).toMatchObject({ id: opsUserId });
    expect(response.body.data.createdBy).toMatchObject({ id: opsUserId });

    reportOneId = response.body.data.id;
    reportOneNumber = response.body.data.reportNumber;

    const adminCreated = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        purchaseOrderId: inProductionPurchaseOrderId,
        inspectorId: opsTwoUserId,
        notes: 'Admin created',
        photoUrls: [],
      });

    expect(adminCreated.status).toBe(201);
    expect(adminCreated.body.data.inspectorId).toBe(opsTwoUserId);
    expect(adminCreated.body.data.createdById).toBe(adminId);
    expect(adminCreated.body.data.photoUrls).toEqual([]);
    reportTwoId = adminCreated.body.data.id;

    const noPhotos = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({ purchaseOrderId: approvedPurchaseOrderId });

    expect(noPhotos.status).toBe(201);
    expect(noPhotos.body.data.inspectorId).toBe(opsUserId);
    expect(noPhotos.body.data.photoUrls).toEqual([]);
    expect(noPhotos.body.data.notes).toBeNull();
    expect(noPhotos.body.data.inspectionDate).toBeNull();
    reportThreeId = noPhotos.body.data.id;

    const explicitInspector = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        purchaseOrderId: approvedPurchaseOrderId,
        inspectorId: opsUserId,
        notes: 'Cancel in progress',
      });

    expect(explicitInspector.status).toBe(201);
    reportFourId = explicitInspector.body.data.id;
  });

  it('lists and gets quality control reports with filters and inspector scoping', async () => {
    const adminList = await request(app)
      .get('/api/v1/quality-control')
      .query({ customerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(adminList.status).toBe(200);
    expect(adminList.body.meta.total).toBe(4);
    expect(adminList.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([reportOneId, reportTwoId, reportThreeId, reportFourId]),
    );

    const opsList = await request(app)
      .get('/api/v1/quality-control')
      .query({ customerId })
      .set('Authorization', bearer(opsAccessToken));

    expect(opsList.status).toBe(200);
    expect(opsList.body.meta.total).toBe(3);
    expect(opsList.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([reportOneId, reportThreeId, reportFourId]),
    );
    expect(opsList.body.data.map((item: { id: string }) => item.id)).not.toContain(reportTwoId);

    const opsTwoList = await request(app)
      .get('/api/v1/quality-control')
      .query({ customerId })
      .set('Authorization', bearer(opsTwoAccessToken));

    expect(opsTwoList.status).toBe(200);
    expect(opsTwoList.body.meta.total).toBe(1);
    expect(opsTwoList.body.data[0].id).toBe(reportTwoId);

    const byNumber = await request(app)
      .get('/api/v1/quality-control')
      .query({ search: reportOneNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byNumber.status).toBe(200);
    expect(byNumber.body.data).toHaveLength(1);
    expect(byNumber.body.data[0].id).toBe(reportOneId);

    const pending = await request(app)
      .get('/api/v1/quality-control')
      .query({ status: 'PENDING', customerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(pending.status).toBe(200);
    expect(pending.body.meta.total).toBe(4);

    const byPurchaseOrder = await request(app)
      .get('/api/v1/quality-control')
      .query({ purchaseOrderId: approvedPurchaseOrderId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byPurchaseOrder.status).toBe(200);
    expect(byPurchaseOrder.body.meta.total).toBe(3);

    const byInspector = await request(app)
      .get('/api/v1/quality-control')
      .query({ inspectorId: opsUserId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byInspector.status).toBe(200);
    expect(byInspector.body.meta.total).toBe(3);

    const byOpsTwoInspector = await request(app)
      .get('/api/v1/quality-control')
      .query({ inspectorId: opsTwoUserId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byOpsTwoInspector.status).toBe(200);
    expect(byOpsTwoInspector.body.meta.total).toBe(1);

    const byCustomer = await request(app)
      .get('/api/v1/quality-control')
      .query({ customerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCustomer.status).toBe(200);
    expect(byCustomer.body.meta.total).toBe(4);

    const bySupplier = await request(app)
      .get('/api/v1/quality-control')
      .query({ supplierId })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySupplier.status).toBe(200);
    expect(bySupplier.body.meta.total).toBe(4);

    const byOrderNumber = await request(app)
      .get('/api/v1/quality-control')
      .query({ search: approvedPurchaseOrderNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byOrderNumber.status).toBe(200);
    expect(byOrderNumber.body.meta.total).toBe(3);

    const bySupplierName = await request(app)
      .get('/api/v1/quality-control')
      .query({ search: supplierName })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySupplierName.status).toBe(200);
    expect(bySupplierName.body.meta.total).toBe(4);

    const byCustomerName = await request(app)
      .get('/api/v1/quality-control')
      .query({ search: customerName })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCustomerName.status).toBe(200);
    expect(byCustomerName.body.meta.total).toBe(4);

    const sorted = await request(app)
      .get('/api/v1/quality-control')
      .query({ sortBy: 'inspectionDate', sortOrder: 'asc', customerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(sorted.status).toBe(200);
    expect(sorted.body.data).toHaveLength(4);

    const paginated = await request(app)
      .get('/api/v1/quality-control')
      .query({ page: 1, limit: 2, customerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(paginated.status).toBe(200);
    expect(paginated.body.data).toHaveLength(2);
    expect(paginated.body.meta).toEqual({ page: 1, limit: 2, total: 4 });

    const combined = await request(app)
      .get('/api/v1/quality-control')
      .query({ status: 'PENDING', inspectorId: opsTwoUserId })
      .set('Authorization', bearer(adminAccessToken));

    expect(combined.status).toBe(200);
    expect(combined.body.meta.total).toBe(1);
    expect(combined.body.data[0].id).toBe(reportTwoId);

    const invalidStatus = await request(app)
      .get('/api/v1/quality-control')
      .query({ status: 'INVALID' })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidStatus.status).toBe(400);

    const invalidSort = await request(app)
      .get('/api/v1/quality-control')
      .query({ sortBy: 'supplier' })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidSort.status).toBe(400);

    const invalidLimit = await request(app)
      .get('/api/v1/quality-control')
      .query({ limit: 101 })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidLimit.status).toBe(400);

    const own = await request(app)
      .get(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(own.status).toBe(200);

    const other = await request(app)
      .get(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(other.status).toBe(404);

    const opsTwoOwn = await request(app)
      .get(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(opsTwoAccessToken));

    expect(opsTwoOwn.status).toBe(200);

    const adminAny = await request(app)
      .get(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminAny.status).toBe(200);

    const missing = await request(app)
      .get('/api/v1/quality-control/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);

    const opsMissing = await request(app)
      .get('/api/v1/quality-control/does-not-exist')
      .set('Authorization', bearer(opsAccessToken));

    expect(opsMissing.status).toBe(404);
  });

  it('updates pending and in-progress reports with inspector scoping', async () => {
    const updated = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({
        inspectorId: opsUserId,
        inspectionDate: null,
        notes: '',
        photoUrls: ['https://example.com/updated.jpg'],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.inspectorId).toBe(opsUserId);
    expect(updated.body.data.inspectionDate).toBeNull();
    expect(updated.body.data.notes).toBeNull();
    expect(updated.body.data.photoUrls).toEqual(['https://example.com/updated.jpg']);

    const assignAnotherInspector = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ inspectorId: opsTwoUserId });

    expect(assignAnotherInspector.status).toBe(403);

    const otherInspectorReport = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Should fail' });

    expect(otherInspectorReport.status).toBe(404);

    const adminUpdated = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Admin updated' });

    expect(adminUpdated.status).toBe(200);
    expect(adminUpdated.body.data.notes).toBe('Admin updated');

    const reassigned = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ inspectorId: opsUserId });

    expect(reassigned.status).toBe(200);
    expect(reassigned.body.data.inspectorId).toBe(opsUserId);

    const restored = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ inspectorId: opsTwoUserId });

    expect(restored.status).toBe(200);
    expect(restored.body.data.inspectorId).toBe(opsTwoUserId);

    const invalidInspector = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ inspectorId: salesUserId });

    expect(invalidInspector.status).toBe(400);

    const missingInspector = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ inspectorId: 'does-not-exist' });

    expect(missingInspector.status).toBe(400);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);

    const invalidPhotoUrl = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ photoUrls: ['not-a-url'] });

    expect(invalidPhotoUrl.status).toBe(400);

    const missing = await request(app)
      .patch('/api/v1/quality-control/does-not-exist')
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Missing' });

    expect(missing.status).toBe(404);

    const clearedPhotos = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ photoUrls: [] });

    expect(clearedPhotos.status).toBe(200);
    expect(clearedPhotos.body.data.photoUrls).toEqual([]);
  });

  it('enforces quality control status transitions', async () => {
    const pendingToPassed = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PASSED' });

    expect(pendingToPassed.status).toBe(400);

    const pendingToFailed = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'FAILED' });

    expect(pendingToFailed.status).toBe(400);

    const inProgress = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PROGRESS' });

    expect(inProgress.status).toBe(200);
    expect(inProgress.body.data.status).toBe('IN_PROGRESS');
    expect(inProgress.body.data.completedAt).toBeNull();

    const backToPending = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING' });

    expect(backToPending.status).toBe(400);
    expect(backToPending.body.message).toBe('Validation failed');

    const passed = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PASSED' });

    expect(passed.status).toBe(200);
    expect(passed.body.data.status).toBe('PASSED');
    expect(passed.body.data.completedAt).not.toBeNull();

    const reopenPassed = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PROGRESS' });

    expect(reopenPassed.status).toBe(400);

    const cancelPassed = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelPassed.status).toBe(400);

    const updatePassed = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Should fail' });

    expect(updatePassed.status).toBe(400);

    const startFailedFlow = await request(app)
      .patch(`/api/v1/quality-control/${reportThreeId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PROGRESS' });

    expect(startFailedFlow.status).toBe(200);

    const failed = await request(app)
      .patch(`/api/v1/quality-control/${reportThreeId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'FAILED' });

    expect(failed.status).toBe(200);
    expect(failed.body.data.status).toBe('FAILED');
    expect(failed.body.data.completedAt).not.toBeNull();

    const reinspect = await request(app)
      .patch(`/api/v1/quality-control/${reportThreeId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PROGRESS' });

    expect(reinspect.status).toBe(200);
    expect(reinspect.body.data.completedAt).toBeNull();

    const passedAfterFailure = await request(app)
      .patch(`/api/v1/quality-control/${reportThreeId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PASSED' });

    expect(passedAfterFailure.status).toBe(200);
    expect(passedAfterFailure.body.data.completedAt).not.toBeNull();

    const cancelAfterFailure = await request(app)
      .patch(`/api/v1/quality-control/${reportThreeId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelAfterFailure.status).toBe(400);

    const cancelled = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('CANCELLED');
    expect(cancelled.body.data.completedAt).toBeNull();

    const reopenCancelled = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'IN_PROGRESS' });

    expect(reopenCancelled.status).toBe(400);

    const cancelAgain = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelAgain.status).toBe(200);

    const updateCancelled = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateCancelled.status).toBe(400);

    const invalidStatus = await request(app)
      .patch(`/api/v1/quality-control/${reportTwoId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'PENDING' });

    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.message).toBe('Validation failed');

    const startCancelFlow = await request(app)
      .patch(`/api/v1/quality-control/${reportFourId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PROGRESS' });

    expect(startCancelFlow.status).toBe(200);

    const cancelInProgress = await request(app)
      .patch(`/api/v1/quality-control/${reportFourId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelInProgress.status).toBe(200);
    expect(cancelInProgress.body.data.completedAt).toBeNull();

    const reopenInProgressCancelled = await request(app)
      .patch(`/api/v1/quality-control/${reportFourId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PROGRESS' });

    expect(reopenInProgressCancelled.status).toBe(400);

    const otherInspectorStatus = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(opsTwoAccessToken))
      .send({ status: 'IN_PROGRESS' });

    expect(otherInspectorStatus.status).toBe(404);

    const passedAgain = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'PASSED' });

    expect(passedAgain.status).toBe(200);

    const passedAgainAsOps = await request(app)
      .patch(`/api/v1/quality-control/${reportThreeId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PASSED' });

    expect(passedAgainAsOps.status).toBe(200);

    const missing = await request(app)
      .patch('/api/v1/quality-control/does-not-exist/status')
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'CANCELLED' });

    expect(missing.status).toBe(404);

    const opsMissing = await request(app)
      .patch('/api/v1/quality-control/does-not-exist/status')
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(opsMissing.status).toBe(404);
  });

  it('enforces permissions for sales, finance, and customers', async () => {
    for (const token of [salesAccessToken, financeAccessToken]) {
      const list = await request(app)
        .get('/api/v1/quality-control')
        .set('Authorization', bearer(token));

      expect(list.status).toBe(403);

      const get = await request(app)
        .get(`/api/v1/quality-control/${reportOneId}`)
        .set('Authorization', bearer(token));

      expect(get.status).toBe(403);

      const create = await request(app)
        .post('/api/v1/quality-control')
        .set('Authorization', bearer(token))
        .send({ purchaseOrderId: approvedPurchaseOrderId });

      expect(create.status).toBe(403);

      const update = await request(app)
        .patch(`/api/v1/quality-control/${reportOneId}`)
        .set('Authorization', bearer(token))
        .send({ notes: 'Should fail' });

      expect(update.status).toBe(403);

      const status = await request(app)
        .patch(`/api/v1/quality-control/${reportOneId}/status`)
        .set('Authorization', bearer(token))
        .send({ status: 'IN_PROGRESS' });

      expect(status.status).toBe(403);
    }

    const customerList = await request(app)
      .get('/api/v1/quality-control')
      .set('Authorization', bearer(portalAccessToken));

    expect(customerList.status).toBe(200);
    expect(customerList.body.data.map((item: { id: string }) => item.id)).toContain(reportOneId);

    const customerGet = await request(app)
      .get(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(customerGet.status).toBe(200);

    const customerCreate = await request(app)
      .post('/api/v1/quality-control')
      .set('Authorization', bearer(portalAccessToken))
      .send({ purchaseOrderId: approvedPurchaseOrderId });

    expect(customerCreate.status).toBe(403);

    const customerUpdate = await request(app)
      .patch(`/api/v1/quality-control/${reportOneId}`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ notes: 'Should fail' });

    expect(customerUpdate.status).toBe(403);

    const opsList = await request(app)
      .get('/api/v1/quality-control')
      .query({ customerId })
      .set('Authorization', bearer(opsAccessToken));

    expect(opsList.status).toBe(200);

    const adminList = await request(app)
      .get('/api/v1/quality-control')
      .set('Authorization', bearer(adminAccessToken));

    expect(adminList.status).toBe(200);
  });
});
