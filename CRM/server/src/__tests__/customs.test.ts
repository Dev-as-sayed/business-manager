import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.customs.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const opsEmail = `test.customs.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const financeEmail = `test.customs.finance.${unique}@example.com`;
const financePassword = 'FinancePass123!';
const salesEmail = `test.customs.sales.${unique}@example.com`;
const salesPassword = 'SalesPass123!';
const portalEmail = `test.customs.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';

const primaryCustomerName = `Customs Primary Customer ${unique}`;
const secondaryCustomerName = `Customs Secondary Customer ${unique}`;
const supplierName = `Customs Supplier ${unique}`;

let adminId: string;
let opsUserId: string;
let financeUserId: string;
let salesUserId: string;
let portalUserId: string;
let adminAccessToken: string;
let opsAccessToken: string;
let financeAccessToken: string;
let salesAccessToken: string;
let portalAccessToken: string;
let primaryCustomerId: string;
let secondaryCustomerId: string;
let supplierId: string;
let shipmentOneId: string;
let shipmentOneNumber: string;
let shipmentTwoId: string;
let shipmentTwoNumber: string;
let shipmentThreeId: string;
let shipmentThreeNumber: string;
let cancelledShipmentId: string;
let recordOneId: string;
let recordOneNumber: string;
let recordTwoId: string;
let recordTwoNumber: string;
let recordThreeId: string;
let recordThreeNumber: string;
let recreatedRecordId: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

let counter = 0;

const createShipment = async (input: {
  customerId: string;
  status: 'PENDING' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  carrier: string;
}) => {
  counter += 1;

  return prisma.shipment.create({
    data: {
      shipmentNumber: `SH-CUSTOMS-TEST-${unique}-${counter}`,
      customerId: input.customerId,
      status: input.status,
      carrier: input.carrier,
      createdById: adminId,
    },
  });
};

beforeAll(async () => {
  const [superAdminRole, opsRole, financeRole, salesRole, customerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CHINA_OPERATIONS' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'FINANCE' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'SALES' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CUSTOMER' } }),
  ]);

  const [primaryCustomer, secondaryCustomer] = await Promise.all([
    prisma.customer.create({ data: { name: primaryCustomerName } }),
    prisma.customer.create({ data: { name: secondaryCustomerName } }),
  ]);
  primaryCustomerId = primaryCustomer.id;
  secondaryCustomerId = secondaryCustomer.id;

  const supplier = await prisma.supplier.create({ data: { name: supplierName } });
  supplierId = supplier.id;

  const [admin, opsUser, financeUser, salesUser, portalUser] = await Promise.all([
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
        lastName: 'User',
        roleId: opsRole.id,
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
        email: salesEmail,
        passwordHash: await bcrypt.hash(salesPassword, 10),
        firstName: 'Sales',
        lastName: 'User',
        roleId: salesRole.id,
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
  opsUserId = opsUser.id;
  financeUserId = financeUser.id;
  salesUserId = salesUser.id;
  portalUserId = portalUser.id;

  const shipmentOne = await createShipment({
    customerId: primaryCustomerId,
    status: 'PREPARING',
    carrier: 'Maersk',
  });
  shipmentOneId = shipmentOne.id;
  shipmentOneNumber = shipmentOne.shipmentNumber;

  const shipmentTwo = await createShipment({
    customerId: primaryCustomerId,
    status: 'IN_TRANSIT',
    carrier: 'DHL',
  });
  shipmentTwoId = shipmentTwo.id;
  shipmentTwoNumber = shipmentTwo.shipmentNumber;

  const shipmentThree = await createShipment({
    customerId: secondaryCustomerId,
    status: 'PENDING',
    carrier: 'FedEx',
  });
  shipmentThreeId = shipmentThree.id;
  shipmentThreeNumber = shipmentThree.shipmentNumber;

  const cancelledShipment = await createShipment({
    customerId: primaryCustomerId,
    status: 'CANCELLED',
    carrier: 'Cancelled carrier',
  });
  cancelledShipmentId = cancelledShipment.id;

  const [adminLogin, opsLogin, financeLogin, salesLogin, portalLogin] = await Promise.all([
    login(adminEmail, adminPassword),
    login(opsEmail, opsPassword),
    login(financeEmail, financePassword),
    login(salesEmail, salesPassword),
    login(portalEmail, portalPassword),
  ]);

  adminAccessToken = adminLogin.body.data.accessToken;
  opsAccessToken = opsLogin.body.data.accessToken;
  financeAccessToken = financeLogin.body.data.accessToken;
  salesAccessToken = salesLogin.body.data.accessToken;
  portalAccessToken = portalLogin.body.data.accessToken;
});

afterAll(async () => {
  const userIds = [adminId, opsUserId, financeUserId, salesUserId, portalUserId].filter(
    (id): id is string => Boolean(id),
  );
  const customerIds = [primaryCustomerId, secondaryCustomerId].filter((id): id is string =>
    Boolean(id),
  );
  const supplierIds = [supplierId].filter((id): id is string => Boolean(id));
  const shipmentIds = [shipmentOneId, shipmentTwoId, shipmentThreeId, cancelledShipmentId].filter(
    (id): id is string => Boolean(id),
  );
  const customsRecordIds = [recordOneId, recordTwoId, recordThreeId, recreatedRecordId].filter(
    (id): id is string => Boolean(id),
  );

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        {
          resourceId: {
            in: [...customsRecordIds, ...shipmentIds, ...supplierIds, ...customerIds],
          },
        },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: opsEmail } },
        { metadata: { path: ['email'], equals: financeEmail } },
        { metadata: { path: ['email'], equals: salesEmail } },
        { metadata: { path: ['email'], equals: portalEmail } },
      ],
    },
  });
  await prisma.customsRecord.deleteMany({ where: { id: { in: customsRecordIds } } });
  await prisma.shipment.deleteMany({ where: { id: { in: shipmentIds } } });
  await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('customs module', () => {
  it('requires authentication and validates customs payloads', async () => {
    const unauthenticated = await request(app).get('/api/v1/customs');
    expect(unauthenticated.status).toBe(401);

    const opsCreate = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(opsAccessToken))
      .send({ shipmentId: shipmentOneId });

    expect(opsCreate.status).toBe(403);

    const financeCreate = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(financeAccessToken))
      .send({ shipmentId: shipmentOneId });

    expect(financeCreate.status).toBe(403);

    const missingShipment = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Missing shipment' });

    expect(missingShipment.status).toBe(400);
    expect(missingShipment.body.message).toBe('Validation failed');

    const invalidDate = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: shipmentOneId, clearanceDate: 'not-a-date' });

    expect(invalidDate.status).toBe(400);

    const negativeAmount = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: shipmentOneId, dutyAmount: -1 });

    expect(negativeAmount.status).toBe(400);

    const invalidCurrency = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: shipmentOneId, currency: 'US' });

    expect(invalidCurrency.status).toBe(400);

    const invalidExchangeRate = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: shipmentOneId, exchangeRate: 0 });

    expect(invalidExchangeRate.status).toBe(400);

    const missingShipmentRecord = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: 'does-not-exist' });

    expect(missingShipmentRecord.status).toBe(404);
    expect(missingShipmentRecord.body.message).toBe('Shipment not found');

    const cancelledShipment = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: cancelledShipmentId });

    expect(cancelledShipment.status).toBe(400);
    expect(cancelledShipment.body.message).toBe('Cancelled shipments cannot have customs records');

    const missingSupplier = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: shipmentOneId, supplierId: 'does-not-exist' });

    expect(missingSupplier.status).toBe(400);
    expect(missingSupplier.body.message).toBe('Supplier not found');
  });

  it('creates customs records with computed totals and defaults', async () => {
    const response = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        shipmentId: shipmentOneId,
        supplierId,
        declarationNumber: 'DECL-001',
        customsOffice: 'Shanghai Customs',
        country: 'China',
        dutyAmount: 100.5,
        taxAmount: 20.25,
        otherFees: 5.25,
        currency: 'eur',
        exchangeRate: 1.1,
        clearanceDate: '2027-06-01T00:00:00.000Z',
        notes: 'Initial customs record',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      shipmentId: shipmentOneId,
      customerId: primaryCustomerId,
      supplierId,
      status: 'PENDING',
      declarationNumber: 'DECL-001',
      customsOffice: 'Shanghai Customs',
      country: 'China',
      currency: 'EUR',
      createdById: adminId,
      updatedById: null,
      notes: 'Initial customs record',
      reviewedAt: null,
      clearedAt: null,
      heldAt: null,
      cancelledAt: null,
    });
    expect(response.body.data.recordNumber).toMatch(/^CU-\d+-[A-F0-9]{8}$/);
    expect(Number(response.body.data.dutyAmount)).toBe(100.5);
    expect(Number(response.body.data.taxAmount)).toBe(20.25);
    expect(Number(response.body.data.otherFees)).toBe(5.25);
    expect(Number(response.body.data.totalAmount)).toBe(126);
    expect(Number(response.body.data.exchangeRate)).toBe(1.1);
    expect(response.body.data.clearanceDate).toBe('2027-06-01T00:00:00.000Z');
    expect(response.body.data.shipment).toMatchObject({
      id: shipmentOneId,
      shipmentNumber: shipmentOneNumber,
      status: 'PREPARING',
    });
    expect(response.body.data.customer).toMatchObject({ id: primaryCustomerId });
    expect(response.body.data.supplier).toMatchObject({ id: supplierId });
    expect(response.body.data.createdBy).toMatchObject({ id: adminId });

    recordOneId = response.body.data.id;
    recordOneNumber = response.body.data.recordNumber;

    const duplicate = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: shipmentOneId });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.message).toBe('A customs record already exists for this shipment');

    const secondary = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: shipmentThreeId });

    expect(secondary.status).toBe(201);
    expect(secondary.body.data).toMatchObject({
      shipmentId: shipmentThreeId,
      customerId: secondaryCustomerId,
      supplierId: null,
      status: 'PENDING',
      currency: 'USD',
      notes: null,
      declarationNumber: null,
      clearanceDate: null,
    });
    expect(Number(secondary.body.data.dutyAmount)).toBe(0);
    expect(Number(secondary.body.data.taxAmount)).toBe(0);
    expect(Number(secondary.body.data.otherFees)).toBe(0);
    expect(Number(secondary.body.data.totalAmount)).toBe(0);
    expect(Number(secondary.body.data.exchangeRate)).toBe(1);
    recordTwoId = secondary.body.data.id;
    recordTwoNumber = secondary.body.data.recordNumber;

    const third = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        shipmentId: shipmentTwoId,
        declarationNumber: 'DECL-003',
        dutyAmount: 50,
      });

    expect(third.status).toBe(201);
    expect(third.body.data.shipmentId).toBe(shipmentTwoId);
    expect(third.body.data.customerId).toBe(primaryCustomerId);
    expect(Number(third.body.data.totalAmount)).toBe(50);
    recordThreeId = third.body.data.id;
    recordThreeNumber = third.body.data.recordNumber;
  });

  it('lists and gets customs records with filters, search, sorting, and pagination', async () => {
    const byNumber = await request(app)
      .get('/api/v1/customs')
      .query({ search: recordOneNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byNumber.status).toBe(200);
    expect(byNumber.body.data).toHaveLength(1);
    expect(byNumber.body.data[0].id).toBe(recordOneId);

    const bySecondNumber = await request(app)
      .get('/api/v1/customs')
      .query({ search: recordTwoNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySecondNumber.status).toBe(200);
    expect(bySecondNumber.body.data).toHaveLength(1);
    expect(bySecondNumber.body.data[0].id).toBe(recordTwoId);

    const byCustomer = await request(app)
      .get('/api/v1/customs')
      .query({ customerId: primaryCustomerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCustomer.status).toBe(200);
    expect(byCustomer.body.meta.total).toBe(2);
    expect(byCustomer.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([recordOneId, recordThreeId]),
    );

    const bySecondaryCustomer = await request(app)
      .get('/api/v1/customs')
      .query({ customerId: secondaryCustomerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySecondaryCustomer.status).toBe(200);
    expect(bySecondaryCustomer.body.data).toHaveLength(1);
    expect(bySecondaryCustomer.body.data[0].id).toBe(recordTwoId);

    const byShipment = await request(app)
      .get('/api/v1/customs')
      .query({ shipmentId: shipmentOneId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byShipment.status).toBe(200);
    expect(byShipment.body.data).toHaveLength(1);
    expect(byShipment.body.data[0].id).toBe(recordOneId);

    const byStatus = await request(app)
      .get('/api/v1/customs')
      .query({ customerId: primaryCustomerId, status: 'PENDING' })
      .set('Authorization', bearer(adminAccessToken));

    expect(byStatus.status).toBe(200);
    expect(byStatus.body.meta.total).toBe(2);

    const bySupplier = await request(app)
      .get('/api/v1/customs')
      .query({ supplierId })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySupplier.status).toBe(200);
    expect(bySupplier.body.data).toHaveLength(1);
    expect(bySupplier.body.data[0].id).toBe(recordOneId);

    const byCountry = await request(app)
      .get('/api/v1/customs')
      .query({ country: 'china' })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCountry.status).toBe(200);
    expect(byCountry.body.data).toHaveLength(1);
    expect(byCountry.body.data[0].id).toBe(recordOneId);

    const byDeclaration = await request(app)
      .get('/api/v1/customs')
      .query({ search: 'DECL-003' })
      .set('Authorization', bearer(adminAccessToken));

    expect(byDeclaration.status).toBe(200);
    expect(byDeclaration.body.data).toHaveLength(1);
    expect(byDeclaration.body.data[0].id).toBe(recordThreeId);

    const byShipmentNumber = await request(app)
      .get('/api/v1/customs')
      .query({ search: shipmentOneNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byShipmentNumber.status).toBe(200);
    expect(byShipmentNumber.body.data).toHaveLength(1);
    expect(byShipmentNumber.body.data[0].id).toBe(recordOneId);

    const bySecondShipmentNumber = await request(app)
      .get('/api/v1/customs')
      .query({ search: shipmentTwoNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySecondShipmentNumber.status).toBe(200);
    expect(bySecondShipmentNumber.body.data).toHaveLength(1);
    expect(bySecondShipmentNumber.body.data[0].id).toBe(recordThreeId);

    const bySecondaryShipmentNumber = await request(app)
      .get('/api/v1/customs')
      .query({ search: shipmentThreeNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySecondaryShipmentNumber.status).toBe(200);
    expect(bySecondaryShipmentNumber.body.data).toHaveLength(1);
    expect(bySecondaryShipmentNumber.body.data[0].id).toBe(recordTwoId);

    const byCustomerName = await request(app)
      .get('/api/v1/customs')
      .query({ search: primaryCustomerName })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCustomerName.status).toBe(200);
    expect(byCustomerName.body.meta.total).toBe(2);

    const bySupplierName = await request(app)
      .get('/api/v1/customs')
      .query({ search: supplierName })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySupplierName.status).toBe(200);
    expect(bySupplierName.body.data).toHaveLength(1);
    expect(bySupplierName.body.data[0].id).toBe(recordOneId);

    const sorted = await request(app)
      .get('/api/v1/customs')
      .query({ customerId: primaryCustomerId, sortBy: 'totalAmount', sortOrder: 'asc' })
      .set('Authorization', bearer(adminAccessToken));

    expect(sorted.status).toBe(200);
    expect(sorted.body.data).toHaveLength(2);
    expect(Number(sorted.body.data[0].totalAmount)).toBeLessThanOrEqual(
      Number(sorted.body.data[1].totalAmount),
    );

    const paginated = await request(app)
      .get('/api/v1/customs')
      .query({ customerId: primaryCustomerId, page: 1, limit: 1 })
      .set('Authorization', bearer(adminAccessToken));

    expect(paginated.status).toBe(200);
    expect(paginated.body.data).toHaveLength(1);
    expect(paginated.body.meta).toEqual({ page: 1, limit: 1, total: 2 });

    const invalidStatus = await request(app)
      .get('/api/v1/customs')
      .query({ status: 'INVALID' })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidStatus.status).toBe(400);

    const invalidSort = await request(app)
      .get('/api/v1/customs')
      .query({ sortBy: 'customer' })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidSort.status).toBe(400);

    const invalidLimit = await request(app)
      .get('/api/v1/customs')
      .query({ limit: 101 })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidLimit.status).toBe(400);

    const fetched = await request(app)
      .get(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.declarationNumber).toBe('DECL-001');

    const missing = await request(app)
      .get('/api/v1/customs/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe('Customs record not found');
  });

  it('updates customs records and enforces status transitions', async () => {
    const updated = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({
        supplierId: null,
        declarationNumber: 'DECL-UPDATED',
        customsOffice: 'Beijing Customs',
        country: 'China',
        dutyAmount: 200,
        taxAmount: 0,
        otherFees: 0,
        currency: 'usd',
        exchangeRate: 1,
        clearanceDate: null,
        notes: '',
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({
      supplierId: null,
      declarationNumber: 'DECL-UPDATED',
      customsOffice: 'Beijing Customs',
      currency: 'USD',
      notes: null,
      clearanceDate: null,
      updatedById: opsUserId,
    });
    expect(Number(updated.body.data.totalAmount)).toBe(200);
    expect(Number(updated.body.data.dutyAmount)).toBe(200);

    const financeUpdate = await request(app)
      .patch(`/api/v1/customs/${recordTwoId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ notes: 'Finance updated' });

    expect(financeUpdate.status).toBe(200);
    expect(financeUpdate.body.data.notes).toBe('Finance updated');
    expect(financeUpdate.body.data.updatedById).toBe(financeUserId);

    const adminUpdate = await request(app)
      .patch(`/api/v1/customs/${recordThreeId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ dutyAmount: 60 });

    expect(adminUpdate.status).toBe(200);
    expect(Number(adminUpdate.body.data.totalAmount)).toBe(60);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);

    const invalidDate = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ clearanceDate: 'not-a-date' });

    expect(invalidDate.status).toBe(400);

    const invalidCurrency = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ currency: 'US' });

    expect(invalidCurrency.status).toBe(400);

    const negativeAmount = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ dutyAmount: -1 });

    expect(negativeAmount.status).toBe(400);

    const invalidSupplier = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ supplierId: 'does-not-exist' });

    expect(invalidSupplier.status).toBe(400);

    const missing = await request(app)
      .patch('/api/v1/customs/does-not-exist')
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Missing' });

    expect(missing.status).toBe(404);

    const directCleared = await request(app)
      .patch(`/api/v1/customs/${recordOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CLEARED' });

    expect(directCleared.status).toBe(400);

    const inReview = await request(app)
      .patch(`/api/v1/customs/${recordOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_REVIEW' });

    expect(inReview.status).toBe(200);
    expect(inReview.body.data.status).toBe('IN_REVIEW');
    expect(inReview.body.data.reviewedAt).not.toBeNull();

    const updateInReview = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'In review update' });

    expect(updateInReview.status).toBe(200);

    const held = await request(app)
      .patch(`/api/v1/customs/${recordOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'HELD' });

    expect(held.status).toBe(200);
    expect(held.body.data.heldAt).not.toBeNull();

    const updateHeld = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Held update' });

    expect(updateHeld.status).toBe(200);

    const backToReview = await request(app)
      .patch(`/api/v1/customs/${recordOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_REVIEW' });

    expect(backToReview.status).toBe(200);
    expect(backToReview.body.data.heldAt).toBeNull();

    const cleared = await request(app)
      .patch(`/api/v1/customs/${recordOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CLEARED' });

    expect(cleared.status).toBe(200);
    expect(cleared.body.data.status).toBe('CLEARED');
    expect(cleared.body.data.clearedAt).not.toBeNull();

    const updateCleared = await request(app)
      .patch(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateCleared.status).toBe(400);

    const reopenCleared = await request(app)
      .patch(`/api/v1/customs/${recordOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_REVIEW' });

    expect(reopenCleared.status).toBe(400);

    const cancelCleared = await request(app)
      .patch(`/api/v1/customs/${recordOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelCleared.status).toBe(400);

    const clearedAgain = await request(app)
      .patch(`/api/v1/customs/${recordOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CLEARED' });

    expect(clearedAgain.status).toBe(200);

    const cancelled = await request(app)
      .patch(`/api/v1/customs/${recordTwoId}/status`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('CANCELLED');
    expect(cancelled.body.data.cancelledAt).not.toBeNull();

    const updateCancelled = await request(app)
      .patch(`/api/v1/customs/${recordTwoId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateCancelled.status).toBe(400);

    const reopenCancelled = await request(app)
      .patch(`/api/v1/customs/${recordTwoId}/status`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ status: 'IN_REVIEW' });

    expect(reopenCancelled.status).toBe(400);

    const cancelledAgain = await request(app)
      .patch(`/api/v1/customs/${recordTwoId}/status`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelledAgain.status).toBe(200);

    const invalidStatus = await request(app)
      .patch(`/api/v1/customs/${recordThreeId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'PENDING' });

    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.message).toBe('Validation failed');

    const missingStatus = await request(app)
      .patch('/api/v1/customs/does-not-exist/status')
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'CANCELLED' });

    expect(missingStatus.status).toBe(404);
  });

  it('soft deletes customs records and allows recreation for the same shipment', async () => {
    const opsDelete = await request(app)
      .delete(`/api/v1/customs/${recordThreeId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsDelete.status).toBe(403);

    const financeDelete = await request(app)
      .delete(`/api/v1/customs/${recordThreeId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeDelete.status).toBe(403);

    const deleted = await request(app)
      .delete(`/api/v1/customs/${recordThreeId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleted.status).toBe(200);

    const fetched = await request(app)
      .get(`/api/v1/customs/${recordThreeId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(404);

    const list = await request(app)
      .get('/api/v1/customs')
      .query({ search: recordThreeNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(0);

    const stored = await prisma.customsRecord.findUniqueOrThrow({
      where: { id: recordThreeId },
    });

    expect(stored.deletedAt).not.toBeNull();

    const recreated = await request(app)
      .post('/api/v1/customs')
      .set('Authorization', bearer(adminAccessToken))
      .send({ shipmentId: shipmentTwoId, notes: 'Recreated' });

    expect(recreated.status).toBe(201);
    expect(recreated.body.data.notes).toBe('Recreated');
    recreatedRecordId = recreated.body.data.id;

    const deleteMissing = await request(app)
      .delete('/api/v1/customs/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteMissing.status).toBe(404);
  });

  it('enforces permissions for sales, finance, operations, and customers', async () => {
    const forbiddenTokens = [salesAccessToken, portalAccessToken];

    for (const token of forbiddenTokens) {
      const list = await request(app).get('/api/v1/customs').set('Authorization', bearer(token));

      expect(list.status).toBe(403);

      const get = await request(app)
        .get(`/api/v1/customs/${recordOneId}`)
        .set('Authorization', bearer(token));

      expect(get.status).toBe(403);

      const create = await request(app)
        .post('/api/v1/customs')
        .set('Authorization', bearer(token))
        .send({ shipmentId: shipmentOneId });

      expect(create.status).toBe(403);

      const update = await request(app)
        .patch(`/api/v1/customs/${recreatedRecordId}`)
        .set('Authorization', bearer(token))
        .send({ notes: 'Should fail' });

      expect(update.status).toBe(403);

      const status = await request(app)
        .patch(`/api/v1/customs/${recreatedRecordId}/status`)
        .set('Authorization', bearer(token))
        .send({ status: 'IN_REVIEW' });

      expect(status.status).toBe(403);

      const remove = await request(app)
        .delete(`/api/v1/customs/${recreatedRecordId}`)
        .set('Authorization', bearer(token));

      expect(remove.status).toBe(403);
    }

    const financeList = await request(app)
      .get('/api/v1/customs')
      .set('Authorization', bearer(financeAccessToken));

    expect(financeList.status).toBe(200);

    const financeGet = await request(app)
      .get(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeGet.status).toBe(200);

    const financeUpdate = await request(app)
      .patch(`/api/v1/customs/${recreatedRecordId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ notes: 'Finance updated recreated' });

    expect(financeUpdate.status).toBe(200);

    const opsList = await request(app)
      .get('/api/v1/customs')
      .set('Authorization', bearer(opsAccessToken));

    expect(opsList.status).toBe(200);

    const opsGet = await request(app)
      .get(`/api/v1/customs/${recordOneId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsGet.status).toBe(200);

    const opsUpdate = await request(app)
      .patch(`/api/v1/customs/${recreatedRecordId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Ops updated recreated' });

    expect(opsUpdate.status).toBe(200);

    const financeStatus = await request(app)
      .patch(`/api/v1/customs/${recreatedRecordId}/status`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ status: 'IN_REVIEW' });

    expect(financeStatus.status).toBe(200);

    const opsStatus = await request(app)
      .patch(`/api/v1/customs/${recreatedRecordId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'HELD' });

    expect(opsStatus.status).toBe(200);

    const adminStatus = await request(app)
      .patch(`/api/v1/customs/${recreatedRecordId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'CANCELLED' });

    expect(adminStatus.status).toBe(200);

    const opsDelete = await request(app)
      .delete(`/api/v1/customs/${recreatedRecordId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsDelete.status).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/v1/customs/${recreatedRecordId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminDelete.status).toBe(200);

    const missingGet = await request(app)
      .get('/api/v1/customs/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missingGet.status).toBe(404);

    const missingUpdate = await request(app)
      .patch('/api/v1/customs/does-not-exist')
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Missing' });

    expect(missingUpdate.status).toBe(404);

    const missingStatus = await request(app)
      .patch('/api/v1/customs/does-not-exist/status')
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'CANCELLED' });

    expect(missingStatus.status).toBe(404);
  });
});
