import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.quotations.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const salesEmail = `test.quotations.sales.${unique}@example.com`;
const salesPassword = 'SalesPass123!';
const financeEmail = `test.quotations.finance.${unique}@example.com`;
const financePassword = 'FinancePass123!';
const opsEmail = `test.quotations.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const portalEmail = `test.quotations.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';

const primaryCustomerName = `Quotations Primary ${unique}`;
const secondaryCustomerName = `Quotations Secondary ${unique}`;
const primaryRequestTitle = `Primary quotation request ${unique}`;
const secondaryRequestTitle = `Secondary quotation request ${unique}`;
const deleteRequestTitle = `Delete quotation request ${unique}`;
const rejectRequestTitle = `Reject quotation request ${unique}`;
const expireRequestTitle = `Expire quotation request ${unique}`;
const draftRequestTitle = `Draft quotation request ${unique}`;

let adminId: string;
let salesUserId: string;
let financeUserId: string;
let opsUserId: string;
let portalUserId: string;
let adminAccessToken: string;
let salesAccessToken: string;
let financeAccessToken: string;
let opsAccessToken: string;
let portalAccessToken: string;
let primaryCustomerId: string;
let secondaryCustomerId: string;
let primaryRequestId: string;
let secondaryRequestId: string;
let deleteRequestId: string;
let rejectRequestId: string;
let expireRequestId: string;
let draftRequestId: string;
let primaryQuotationId: string;
let primaryQuotationNumber: string;
let rejectQuotationId: string;
let expireQuotationId: string;
let expireRevisionId: string;
let secondaryQuotationId: string;
let deleteQuotationId: string;
let deleteRevisionId: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

let requestCounter = 0;

const createProductRequest = async (
  customerId: string,
  title: string,
  status: 'DRAFT' | 'REVIEWING' = 'REVIEWING',
) => {
  requestCounter += 1;

  return prisma.productRequest.create({
    data: {
      requestNumber: `PR-TEST-${unique}-${requestCounter}`,
      customerId,
      title,
      status,
      createdById: adminId,
    },
  });
};

beforeAll(async () => {
  const [superAdminRole, salesRole, financeRole, opsRole, customerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'SALES' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'FINANCE' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CHINA_OPERATIONS' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CUSTOMER' } }),
  ]);

  const primaryCustomer = await prisma.customer.create({
    data: { name: primaryCustomerName },
  });
  primaryCustomerId = primaryCustomer.id;

  const secondaryCustomer = await prisma.customer.create({
    data: { name: secondaryCustomerName },
  });
  secondaryCustomerId = secondaryCustomer.id;

  const [admin, salesUser, financeUser, opsUser, portalUser] = await Promise.all([
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
        email: opsEmail,
        passwordHash: await bcrypt.hash(opsPassword, 10),
        firstName: 'Ops',
        lastName: 'User',
        roleId: opsRole.id,
      },
    }),
    prisma.user.create({
      data: {
        email: portalEmail,
        passwordHash: await bcrypt.hash(portalPassword, 10),
        firstName: 'Portal',
        lastName: 'User',
        roleId: customerRole.id,
        customerId: primaryCustomer.id,
      },
    }),
  ]);

  adminId = admin.id;
  salesUserId = salesUser.id;
  financeUserId = financeUser.id;
  opsUserId = opsUser.id;
  portalUserId = portalUser.id;

  const primaryRequest = await createProductRequest(primaryCustomerId, primaryRequestTitle);
  primaryRequestId = primaryRequest.id;

  const secondaryRequest = await createProductRequest(secondaryCustomerId, secondaryRequestTitle);
  secondaryRequestId = secondaryRequest.id;

  const deleteRequest = await createProductRequest(primaryCustomerId, deleteRequestTitle);
  deleteRequestId = deleteRequest.id;

  const rejectRequest = await createProductRequest(primaryCustomerId, rejectRequestTitle);
  rejectRequestId = rejectRequest.id;

  const expireRequest = await createProductRequest(primaryCustomerId, expireRequestTitle);
  expireRequestId = expireRequest.id;

  const draftRequest = await createProductRequest(primaryCustomerId, draftRequestTitle, 'DRAFT');
  draftRequestId = draftRequest.id;

  const [adminLogin, salesLogin, financeLogin, opsLogin, portalLogin] = await Promise.all([
    login(adminEmail, adminPassword),
    login(salesEmail, salesPassword),
    login(financeEmail, financePassword),
    login(opsEmail, opsPassword),
    login(portalEmail, portalPassword),
  ]);

  adminAccessToken = adminLogin.body.data.accessToken;
  salesAccessToken = salesLogin.body.data.accessToken;
  financeAccessToken = financeLogin.body.data.accessToken;
  opsAccessToken = opsLogin.body.data.accessToken;
  portalAccessToken = portalLogin.body.data.accessToken;
});

afterAll(async () => {
  const userIds = [adminId, salesUserId, financeUserId, opsUserId, portalUserId].filter(
    (id): id is string => Boolean(id),
  );
  const customerIds = [primaryCustomerId, secondaryCustomerId].filter((id): id is string =>
    Boolean(id),
  );
  const productRequestIds = [
    primaryRequestId,
    secondaryRequestId,
    deleteRequestId,
    rejectRequestId,
    expireRequestId,
    draftRequestId,
  ].filter((id): id is string => Boolean(id));
  const quotationIds = [
    primaryQuotationId,
    rejectQuotationId,
    expireQuotationId,
    expireRevisionId,
    secondaryQuotationId,
    deleteQuotationId,
    deleteRevisionId,
  ].filter((id): id is string => Boolean(id));

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        {
          resourceId: {
            in: [...quotationIds, ...productRequestIds, ...customerIds],
          },
        },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: salesEmail } },
        { metadata: { path: ['email'], equals: financeEmail } },
        { metadata: { path: ['email'], equals: opsEmail } },
        { metadata: { path: ['email'], equals: portalEmail } },
      ],
    },
  });
  await prisma.quotation.deleteMany({ where: { id: { in: quotationIds } } });
  await prisma.productRequest.deleteMany({
    where: { id: { in: productRequestIds } },
  });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('quotations module', () => {
  it('requires authentication', async () => {
    const response = await request(app).get('/api/v1/quotations');

    expect(response.status).toBe(401);
  });

  it('validates quotation payloads', async () => {
    const missingProductRequest = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({ items: [{ name: 'Item', quantity: 1, unitPrice: 10 }] });

    expect(missingProductRequest.status).toBe(400);
    expect(missingProductRequest.body.message).toBe('Validation failed');

    const emptyItems = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({ productRequestId: primaryRequestId, items: [] });

    expect(emptyItems.status).toBe(400);

    const negativePrice = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: primaryRequestId,
        items: [{ name: 'Item', quantity: 1, unitPrice: -1 }],
      });

    expect(negativePrice.status).toBe(400);

    const invalidRate = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: primaryRequestId,
        serviceFeeRate: 1.5,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(invalidRate.status).toBe(400);

    const negativeShipping = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: primaryRequestId,
        shippingFee: -1,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(negativeShipping.status).toBe(400);

    const invalidDate = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: primaryRequestId,
        validUntil: 'not-a-date',
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(invalidDate.status).toBe(400);

    const invalidCurrency = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: primaryRequestId,
        currency: 'US',
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(invalidCurrency.status).toBe(400);

    const draftRequest = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: draftRequestId,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(draftRequest.status).toBe(400);
    expect(draftRequest.body.message).toBe(
      'Product request must be in review or quoted before creating a quotation',
    );

    const missingRequest = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: 'does-not-exist',
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(missingRequest.status).toBe(404);
    expect(missingRequest.body.message).toBe('Product request not found');
  });

  it('creates a quotation for a reviewing product request and calculates totals', async () => {
    const response = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: primaryRequestId,
        currency: 'usd',
        serviceFeeRate: 0.05,
        shippingFee: 25,
        tax: 10,
        validUntil: '2027-01-01T00:00:00.000Z',
        notes: 'Initial quotation',
        items: [
          {
            name: 'Widget A',
            description: 'Red widget',
            quantity: 10,
            unitPrice: 12.5,
          },
          { name: 'Widget B', quantity: 5, unitPrice: 20, notes: 'Blue widget' },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      productRequestId: primaryRequestId,
      customerId: primaryCustomerId,
      status: 'DRAFT',
      currency: 'USD',
      createdById: salesUserId,
    });
    expect(response.body.data.quotationNumber).toMatch(/^QT-\d+-[A-F0-9]{8}$/);
    expect(Number(response.body.data.serviceFeeRate)).toBe(0.05);
    expect(Number(response.body.data.subtotal)).toBe(225);
    expect(Number(response.body.data.serviceFee)).toBe(11.25);
    expect(Number(response.body.data.shippingFee)).toBe(25);
    expect(Number(response.body.data.tax)).toBe(10);
    expect(Number(response.body.data.total)).toBe(271.25);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data._count.items).toBe(2);

    primaryQuotationId = response.body.data.id;
    primaryQuotationNumber = response.body.data.quotationNumber;

    const productRequest = await prisma.productRequest.findUniqueOrThrow({
      where: { id: primaryRequestId },
    });
    expect(productRequest.status).toBe('QUOTED');
  });

  it('lists quotations with search, status filter, sorting, and pagination', async () => {
    const response = await request(app)
      .get('/api/v1/quotations')
      .query({
        search: primaryRequestTitle,
        status: 'DRAFT',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      .set('Authorization', bearer(adminAccessToken));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(primaryQuotationId);
    expect(response.body.data[0]._count.items).toBe(2);
    expect(response.body.data[0].customer).toMatchObject({ id: primaryCustomerId });
    expect(response.body.data[0].productRequest).toMatchObject({
      id: primaryRequestId,
    });
    expect(response.body.meta).toEqual({ page: 1, limit: 10, total: 1 });
  });

  it('gets and updates a draft quotation', async () => {
    const fetched = await request(app)
      .get(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.notes).toBe('Initial quotation');
    expect(fetched.body.data.items).toHaveLength(2);

    const updated = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(salesAccessToken))
      .send({
        currency: 'eur',
        serviceFeeRate: 0.1,
        shippingFee: 0,
        tax: 5,
        validUntil: null,
        notes: '',
        items: [{ name: 'Updated item', quantity: 2, unitPrice: 99.99 }],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.currency).toBe('EUR');
    expect(updated.body.data.notes).toBeNull();
    expect(updated.body.data.validUntil).toBeNull();
    expect(updated.body.data.items).toHaveLength(1);
    expect(Number(updated.body.data.subtotal)).toBe(199.98);
    expect(Number(updated.body.data.serviceFee)).toBe(20);
    expect(Number(updated.body.data.total)).toBe(224.98);

    const productRequest = await prisma.productRequest.findUniqueOrThrow({
      where: { id: primaryRequestId },
    });
    expect(productRequest.status).toBe('QUOTED');

    const emptyUpdate = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(salesAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);

    const emptyItems = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ items: [] });

    expect(emptyItems.status).toBe(400);

    const missing = await request(app)
      .get('/api/v1/quotations/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
  });

  it('sends a quotation and locks further edits', async () => {
    const sent = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'SENT' });

    expect(sent.status).toBe(200);
    expect(sent.body.data.status).toBe('SENT');
    expect(sent.body.data.sentAt).not.toBeNull();

    const sameStatus = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'SENT' });

    expect(sameStatus.status).toBe(200);
    expect(sameStatus.body.data.status).toBe('SENT');

    const updateSent = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateSent.status).toBe(400);

    const deleteSent = await request(app)
      .delete(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteSent.status).toBe(400);

    const approveViaStatus = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'APPROVED' });

    expect(approveViaStatus.status).toBe(400);
    expect(approveViaStatus.body.message).toBe('Validation failed');

    const draftViaStatus = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'DRAFT' });

    expect(draftViaStatus.status).toBe(400);

    const productRequest = await prisma.productRequest.findUniqueOrThrow({
      where: { id: primaryRequestId },
    });
    expect(productRequest.status).toBe('QUOTED');
  });

  it('allows customer approval and syncs the product request', async () => {
    const salesApprove = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/approve`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesApprove.status).toBe(403);

    const financeApprove = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeApprove.status).toBe(403);

    const customerApprove = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/approve`)
      .set('Authorization', bearer(portalAccessToken));

    expect(customerApprove.status).toBe(200);
    expect(customerApprove.body.data.status).toBe('APPROVED');
    expect(customerApprove.body.data.approvedById).toBe(portalUserId);
    expect(customerApprove.body.data.approvedAt).not.toBeNull();

    const approved = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe('APPROVED');
    expect(approved.body.data.approvedById).toBe(portalUserId);

    const productRequest = await prisma.productRequest.findUniqueOrThrow({
      where: { id: primaryRequestId },
    });
    expect(productRequest.status).toBe('APPROVED');

    const approvedAgain = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(approvedAgain.status).toBe(200);
    expect(approvedAgain.body.data.status).toBe('APPROVED');

    const expireApproved = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'EXPIRED' });

    expect(expireApproved.status).toBe(400);

    const updateApproved = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateApproved.status).toBe(400);

    const deleteApproved = await request(app)
      .delete(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteApproved.status).toBe(400);
  });

  it('rejects a quotation and syncs the product request', async () => {
    const created = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: rejectRequestId,
        items: [{ name: 'Reject item', quantity: 1, unitPrice: 10 }],
      });

    expect(created.status).toBe(201);
    rejectQuotationId = created.body.data.id;

    const sent = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'SENT' });

    expect(sent.status).toBe(200);

    const rejected = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'REJECTED' });

    expect(rejected.status).toBe(200);
    expect(rejected.body.data.status).toBe('REJECTED');

    const productRequest = await prisma.productRequest.findUniqueOrThrow({
      where: { id: rejectRequestId },
    });
    expect(productRequest.status).toBe('REJECTED');

    const reopen = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'SENT' });

    expect(reopen.status).toBe(400);

    const rejectAgain = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'REJECTED' });

    expect(rejectAgain.status).toBe(200);

    const approveRejected = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(approveRejected.status).toBe(400);

    const updateRejected = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateRejected.status).toBe(400);
  });

  it('expires a quotation and allows a revision while the request stays quoted', async () => {
    const created = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: expireRequestId,
        items: [{ name: 'Expire item', quantity: 1, unitPrice: 10 }],
      });

    expect(created.status).toBe(201);
    expireQuotationId = created.body.data.id;

    const approveDraft = await request(app)
      .patch(`/api/v1/quotations/${expireQuotationId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(approveDraft.status).toBe(400);

    const sent = await request(app)
      .patch(`/api/v1/quotations/${expireQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'SENT' });

    expect(sent.status).toBe(200);

    const expired = await request(app)
      .patch(`/api/v1/quotations/${expireQuotationId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'EXPIRED' });

    expect(expired.status).toBe(200);
    expect(expired.body.data.status).toBe('EXPIRED');

    const productRequest = await prisma.productRequest.findUniqueOrThrow({
      where: { id: expireRequestId },
    });
    expect(productRequest.status).toBe('QUOTED');

    const revision = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: expireRequestId,
        items: [{ name: 'Revision item', quantity: 1, unitPrice: 12 }],
      });

    expect(revision.status).toBe(201);
    expireRevisionId = revision.body.data.id;

    const list = await request(app)
      .get('/api/v1/quotations')
      .query({ productRequestId: expireRequestId })
      .set('Authorization', bearer(adminAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);
    expect(list.body.meta.total).toBe(2);

    const rejectDraft = await request(app)
      .patch(`/api/v1/quotations/${expireRevisionId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'REJECTED' });

    expect(rejectDraft.status).toBe(400);

    const expireDraft = await request(app)
      .patch(`/api/v1/quotations/${expireRevisionId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'EXPIRED' });

    expect(expireDraft.status).toBe(400);

    const sendRevision = await request(app)
      .patch(`/api/v1/quotations/${expireRevisionId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'SENT' });

    expect(sendRevision.status).toBe(200);

    const approveExpired = await request(app)
      .patch(`/api/v1/quotations/${expireQuotationId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(approveExpired.status).toBe(400);
  });

  it('scopes customers to their own quotations and blocks staff actions', async () => {
    const created = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: secondaryRequestId,
        items: [{ name: 'Secondary item', quantity: 1, unitPrice: 15 }],
      });

    expect(created.status).toBe(201);
    secondaryQuotationId = created.body.data.id;

    const list = await request(app)
      .get('/api/v1/quotations')
      .set('Authorization', bearer(portalAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(4);
    expect(list.body.meta.total).toBe(4);
    expect(list.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([primaryQuotationId, rejectQuotationId]),
    );
    expect(list.body.data.map((item: { id: string }) => item.id)).not.toContain(
      secondaryQuotationId,
    );

    const own = await request(app)
      .get(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(own.status).toBe(200);

    const other = await request(app)
      .get(`/api/v1/quotations/${secondaryQuotationId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(other.status).toBe(404);

    const search = await request(app)
      .get('/api/v1/quotations')
      .query({ search: primaryQuotationNumber })
      .set('Authorization', bearer(portalAccessToken));

    expect(search.status).toBe(200);
    expect(search.body.data).toHaveLength(1);
    expect(search.body.data[0].id).toBe(primaryQuotationId);

    const create = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(portalAccessToken))
      .send({
        productRequestId: primaryRequestId,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(create.status).toBe(403);

    const update = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ notes: 'Should fail' });

    expect(update.status).toBe(403);

    const status = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ status: 'SENT' });

    expect(status.status).toBe(403);

    const remove = await request(app)
      .delete(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(remove.status).toBe(403);
  });

  it('enforces finance and operations permissions', async () => {
    const financeList = await request(app)
      .get('/api/v1/quotations')
      .set('Authorization', bearer(financeAccessToken));

    expect(financeList.status).toBe(200);
    expect(financeList.body.data.map((item: { id: string }) => item.id)).toContain(
      secondaryQuotationId,
    );

    const financeGet = await request(app)
      .get(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeGet.status).toBe(200);

    const financeCreate = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        productRequestId: primaryRequestId,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(financeCreate.status).toBe(403);

    const financeUpdate = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ notes: 'Should fail' });

    expect(financeUpdate.status).toBe(403);

    const financeStatus = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ status: 'SENT' });

    expect(financeStatus.status).toBe(403);

    const financeApprove = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeApprove.status).toBe(403);

    const financeDelete = await request(app)
      .delete(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeDelete.status).toBe(403);

    const opsList = await request(app)
      .get('/api/v1/quotations')
      .set('Authorization', bearer(opsAccessToken));

    expect(opsList.status).toBe(403);

    const opsGet = await request(app)
      .get(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsGet.status).toBe(403);

    const opsCreate = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        productRequestId: primaryRequestId,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(opsCreate.status).toBe(403);

    const opsStatus = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'SENT' });

    expect(opsStatus.status).toBe(403);

    const opsApprove = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/approve`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsApprove.status).toBe(403);

    const opsDelete = await request(app)
      .delete(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsDelete.status).toBe(403);
  });

  it('enforces sales permissions and unscoped access', async () => {
    const list = await request(app)
      .get('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data.map((item: { id: string }) => item.id)).toContain(secondaryQuotationId);

    const anyQuotation = await request(app)
      .get(`/api/v1/quotations/${secondaryQuotationId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(anyQuotation.status).toBe(200);

    const approve = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/approve`)
      .set('Authorization', bearer(salesAccessToken));

    expect(approve.status).toBe(403);

    const remove = await request(app)
      .delete(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(remove.status).toBe(403);
  });

  it('soft deletes draft quotations and reverts the product request to reviewing', async () => {
    const created = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: deleteRequestId,
        items: [{ name: 'Delete item', quantity: 1, unitPrice: 10 }],
      });

    expect(created.status).toBe(201);
    deleteQuotationId = created.body.data.id;

    const deleted = await request(app)
      .delete(`/api/v1/quotations/${deleteQuotationId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleted.status).toBe(200);

    const fetched = await request(app)
      .get(`/api/v1/quotations/${deleteQuotationId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(404);

    const list = await request(app)
      .get('/api/v1/quotations')
      .query({ search: deleteRequestTitle })
      .set('Authorization', bearer(adminAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(0);

    const stored = await prisma.quotation.findUniqueOrThrow({
      where: { id: deleteQuotationId },
    });

    expect(stored.deletedAt).not.toBeNull();

    const productRequest = await prisma.productRequest.findUniqueOrThrow({
      where: { id: deleteRequestId },
    });
    expect(productRequest.status).toBe('REVIEWING');

    const revision = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: deleteRequestId,
        items: [{ name: 'Delete revision', quantity: 1, unitPrice: 10 }],
      });

    expect(revision.status).toBe(201);
    deleteRevisionId = revision.body.data.id;

    const deleteRevision = await request(app)
      .delete(`/api/v1/quotations/${deleteRevisionId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteRevision.status).toBe(200);

    const revertedRequest = await prisma.productRequest.findUniqueOrThrow({
      where: { id: deleteRequestId },
    });
    expect(revertedRequest.status).toBe('REVIEWING');

    const deleteApproved = await request(app)
      .delete(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteApproved.status).toBe(400);

    const salesDeleteSent = await request(app)
      .delete(`/api/v1/quotations/${expireRevisionId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesDeleteSent.status).toBe(403);

    const adminDeleteSent = await request(app)
      .delete(`/api/v1/quotations/${expireRevisionId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminDeleteSent.status).toBe(400);
  });

  it('enforces terminal states and create restrictions', async () => {
    const createApproved = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: primaryRequestId,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(createApproved.status).toBe(400);

    const createRejected = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: rejectRequestId,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(createRejected.status).toBe(400);

    const createDraft = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: draftRequestId,
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(createDraft.status).toBe(400);

    const createMissing = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        productRequestId: 'does-not-exist',
        items: [{ name: 'Item', quantity: 1, unitPrice: 10 }],
      });

    expect(createMissing.status).toBe(404);

    const updateApproved = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateApproved.status).toBe(400);

    const updateRejected = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateRejected.status).toBe(400);

    const updateExpired = await request(app)
      .patch(`/api/v1/quotations/${expireQuotationId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateExpired.status).toBe(400);

    const updateSent = await request(app)
      .patch(`/api/v1/quotations/${expireRevisionId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateSent.status).toBe(400);

    const updateMissing = await request(app)
      .patch('/api/v1/quotations/does-not-exist')
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateMissing.status).toBe(404);

    const statusApproved = await request(app)
      .patch(`/api/v1/quotations/${primaryQuotationId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'EXPIRED' });

    expect(statusApproved.status).toBe(400);

    const statusRejected = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'SENT' });

    expect(statusRejected.status).toBe(400);

    const statusExpired = await request(app)
      .patch(`/api/v1/quotations/${expireQuotationId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'SENT' });

    expect(statusExpired.status).toBe(400);

    const approveRejected = await request(app)
      .patch(`/api/v1/quotations/${rejectQuotationId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(approveRejected.status).toBe(400);

    const approveExpired = await request(app)
      .patch(`/api/v1/quotations/${expireQuotationId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(approveExpired.status).toBe(400);

    const approveMissing = await request(app)
      .patch('/api/v1/quotations/does-not-exist/approve')
      .set('Authorization', bearer(adminAccessToken));

    expect(approveMissing.status).toBe(404);
  });
});
