import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.finance.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const financeEmail = `test.finance.finance.${unique}@example.com`;
const financePassword = 'FinancePass123!';
const opsEmail = `test.finance.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const salesEmail = `test.finance.sales.${unique}@example.com`;
const salesPassword = 'SalesPass123!';
const portalEmail = `test.finance.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';

const primaryCustomerName = `Finance Primary Customer ${unique}`;
const secondaryCustomerName = `Finance Secondary Customer ${unique}`;
const supplierName = `Finance Supplier ${unique}`;

let adminId: string;
let financeUserId: string;
let opsUserId: string;
let salesUserId: string;
let portalUserId: string;
let adminAccessToken: string;
let financeAccessToken: string;
let opsAccessToken: string;
let salesAccessToken: string;
let portalAccessToken: string;
let primaryCustomerId: string;
let secondaryCustomerId: string;
let supplierId: string;
let primaryRequestId: string;
let secondaryRequestId: string;
let primaryQuotationId: string;
let secondaryQuotationId: string;
let primaryPurchaseOrderId: string;
let primaryPurchaseOrderNumber: string;
let secondaryPurchaseOrderId: string;
let secondaryPurchaseOrderNumber: string;
let thirdPurchaseOrderId: string;
let itemAId: string;
let itemBId: string;
let itemCId: string;
let primaryShipmentId: string;
let primaryShipmentNumber: string;
let secondaryShipmentId: string;
let secondaryShipmentNumber: string;
let otherPrimaryShipmentId: string;
let entryOneId: string;
let entryOneNumber: string;
let entryTwoId: string;
let entryTwoNumber: string;
let entryThreeId: string;
let entryThreeNumber: string;
let entryFourId: string;
let entryFiveId: string;
let entrySixId: string;
let entrySevenId: string;
let entryEightId: string;
let entryTenId: string;
let entryElevenId: string;

const ledgerEntryIds: string[] = [];

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

let counter = 0;

const createPurchaseOrder = async (input: {
  customerId: string;
  quotationId: string;
  currency: string;
  total: number;
  items: Array<{ name: string; quantity: number }>;
}) => {
  counter += 1;

  return prisma.purchaseOrder.create({
    data: {
      orderNumber: `PO-FIN-TEST-${unique}-${counter}`,
      quotationId: input.quotationId,
      customerId: input.customerId,
      supplierId,
      status: 'APPROVED',
      currency: input.currency,
      subtotal: input.total,
      shippingFee: 0,
      tax: 0,
      total: input.total,
      createdById: adminId,
      approvedById: adminId,
      approvedAt: new Date(),
      items: {
        create: input.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitCost: 10,
          total: item.quantity * 10,
        })),
      },
    },
    include: { items: { orderBy: { createdAt: 'asc' } } },
  });
};

const createShipment = async (input: {
  customerId: string;
  items: Array<{ purchaseOrderItemId: string; quantity: number }>;
}) => {
  counter += 1;

  return prisma.shipment.create({
    data: {
      shipmentNumber: `SH-FIN-TEST-${unique}-${counter}`,
      customerId: input.customerId,
      status: 'PENDING',
      carrier: 'Test carrier',
      createdById: adminId,
      items: { create: input.items },
    },
  });
};

const createEntry = async (
  token: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  const response = await request(app)
    .post('/api/v1/finance/ledger-entries')
    .set('Authorization', bearer(token))
    .send(body);

  expect(response.status).toBe(201);
  ledgerEntryIds.push(response.body.data.id);

  return response.body.data;
};

beforeAll(async () => {
  const [superAdminRole, financeRole, opsRole, salesRole, customerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'FINANCE' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CHINA_OPERATIONS' } }),
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

  const [admin, financeUser, opsUser, salesUser, portalUser] = await Promise.all([
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
  financeUserId = financeUser.id;
  opsUserId = opsUser.id;
  salesUserId = salesUser.id;
  portalUserId = portalUser.id;

  const primaryRequest = await prisma.productRequest.create({
    data: {
      requestNumber: `PR-FIN-TEST-${unique}-1`,
      customerId: primaryCustomerId,
      title: `Finance primary request ${unique}`,
      status: 'APPROVED',
      createdById: adminId,
    },
  });
  primaryRequestId = primaryRequest.id;

  const secondaryRequest = await prisma.productRequest.create({
    data: {
      requestNumber: `PR-FIN-TEST-${unique}-2`,
      customerId: secondaryCustomerId,
      title: `Finance secondary request ${unique}`,
      status: 'APPROVED',
      createdById: adminId,
    },
  });
  secondaryRequestId = secondaryRequest.id;

  const primaryQuotation = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-FIN-TEST-${unique}-1`,
      productRequestId: primaryRequestId,
      customerId: primaryCustomerId,
      status: 'APPROVED',
      currency: 'USD',
      serviceFeeRate: 0,
      subtotal: 1000,
      serviceFee: 0,
      shippingFee: 0,
      tax: 0,
      total: 1000,
      createdById: adminId,
      approvedById: adminId,
      approvedAt: new Date(),
      items: {
        create: [{ name: 'Primary quotation item', quantity: 1, unitPrice: 1000 }],
      },
    },
  });
  primaryQuotationId = primaryQuotation.id;

  const secondaryQuotation = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-FIN-TEST-${unique}-2`,
      productRequestId: secondaryRequestId,
      customerId: secondaryCustomerId,
      status: 'APPROVED',
      currency: 'EUR',
      serviceFeeRate: 0,
      subtotal: 500,
      serviceFee: 0,
      shippingFee: 0,
      tax: 0,
      total: 500,
      createdById: adminId,
      approvedById: adminId,
      approvedAt: new Date(),
      items: {
        create: [{ name: 'Secondary quotation item', quantity: 1, unitPrice: 500 }],
      },
    },
  });
  secondaryQuotationId = secondaryQuotation.id;

  const primaryPurchaseOrder = await createPurchaseOrder({
    customerId: primaryCustomerId,
    quotationId: primaryQuotationId,
    currency: 'USD',
    total: 1000,
    items: [{ name: 'Item A', quantity: 10 }],
  });
  primaryPurchaseOrderId = primaryPurchaseOrder.id;
  primaryPurchaseOrderNumber = primaryPurchaseOrder.orderNumber;
  itemAId = primaryPurchaseOrder.items[0]!.id;

  const secondaryPurchaseOrder = await createPurchaseOrder({
    customerId: secondaryCustomerId,
    quotationId: secondaryQuotationId,
    currency: 'EUR',
    total: 500,
    items: [{ name: 'Item B', quantity: 5 }],
  });
  secondaryPurchaseOrderId = secondaryPurchaseOrder.id;
  secondaryPurchaseOrderNumber = secondaryPurchaseOrder.orderNumber;
  itemBId = secondaryPurchaseOrder.items[0]!.id;

  const thirdPurchaseOrder = await createPurchaseOrder({
    customerId: primaryCustomerId,
    quotationId: primaryQuotationId,
    currency: 'USD',
    total: 300,
    items: [{ name: 'Item C', quantity: 3 }],
  });
  thirdPurchaseOrderId = thirdPurchaseOrder.id;
  itemCId = thirdPurchaseOrder.items[0]!.id;

  const primaryShipment = await createShipment({
    customerId: primaryCustomerId,
    items: [{ purchaseOrderItemId: itemAId, quantity: 5 }],
  });
  primaryShipmentId = primaryShipment.id;
  primaryShipmentNumber = primaryShipment.shipmentNumber;

  const secondaryShipment = await createShipment({
    customerId: secondaryCustomerId,
    items: [{ purchaseOrderItemId: itemBId, quantity: 2 }],
  });
  secondaryShipmentId = secondaryShipment.id;
  secondaryShipmentNumber = secondaryShipment.shipmentNumber;

  const otherPrimaryShipment = await createShipment({
    customerId: primaryCustomerId,
    items: [{ purchaseOrderItemId: itemCId, quantity: 1 }],
  });
  otherPrimaryShipmentId = otherPrimaryShipment.id;

  const [adminLogin, financeLogin, opsLogin, salesLogin, portalLogin] = await Promise.all([
    login(adminEmail, adminPassword),
    login(financeEmail, financePassword),
    login(opsEmail, opsPassword),
    login(salesEmail, salesPassword),
    login(portalEmail, portalPassword),
  ]);

  adminAccessToken = adminLogin.body.data.accessToken;
  financeAccessToken = financeLogin.body.data.accessToken;
  opsAccessToken = opsLogin.body.data.accessToken;
  salesAccessToken = salesLogin.body.data.accessToken;
  portalAccessToken = portalLogin.body.data.accessToken;
});

afterAll(async () => {
  const userIds = [adminId, financeUserId, opsUserId, salesUserId, portalUserId].filter(
    (id): id is string => Boolean(id),
  );
  const customerIds = [primaryCustomerId, secondaryCustomerId].filter((id): id is string =>
    Boolean(id),
  );
  const supplierIds = [supplierId].filter((id): id is string => Boolean(id));
  const productRequestIds = [primaryRequestId, secondaryRequestId].filter((id): id is string =>
    Boolean(id),
  );
  const quotationIds = [primaryQuotationId, secondaryQuotationId].filter((id): id is string =>
    Boolean(id),
  );
  const purchaseOrderIds = [
    primaryPurchaseOrderId,
    secondaryPurchaseOrderId,
    thirdPurchaseOrderId,
  ].filter((id): id is string => Boolean(id));
  const shipmentIds = [primaryShipmentId, secondaryShipmentId, otherPrimaryShipmentId].filter(
    (id): id is string => Boolean(id),
  );

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        {
          resourceId: {
            in: [
              ...ledgerEntryIds,
              ...purchaseOrderIds,
              ...shipmentIds,
              ...quotationIds,
              ...productRequestIds,
              ...supplierIds,
              ...customerIds,
            ],
          },
        },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: financeEmail } },
        { metadata: { path: ['email'], equals: opsEmail } },
        { metadata: { path: ['email'], equals: salesEmail } },
        { metadata: { path: ['email'], equals: portalEmail } },
      ],
    },
  });
  await prisma.ledgerEntry.deleteMany({ where: { id: { in: ledgerEntryIds } } });
  await prisma.shipment.deleteMany({ where: { id: { in: shipmentIds } } });
  await prisma.purchaseOrder.deleteMany({ where: { id: { in: purchaseOrderIds } } });
  await prisma.quotation.deleteMany({ where: { id: { in: quotationIds } } });
  await prisma.productRequest.deleteMany({ where: { id: { in: productRequestIds } } });
  await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('finance module', () => {
  it('requires authentication and validates ledger entry payloads', async () => {
    const unauthenticated = await request(app).get('/api/v1/finance/ledger-entries');
    expect(unauthenticated.status).toBe(401);

    const missingLinks = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({ type: 'REVENUE', amount: 10 });

    expect(missingLinks.status).toBe(400);
    expect(missingLinks.body.message).toBe('Validation failed');

    const missingType = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({ purchaseOrderId: primaryPurchaseOrderId, amount: 10 });

    expect(missingType.status).toBe(400);

    const invalidType = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({ purchaseOrderId: primaryPurchaseOrderId, type: 'INVALID', amount: 10 });

    expect(invalidType.status).toBe(400);

    const zeroAmount = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({ purchaseOrderId: primaryPurchaseOrderId, type: 'REVENUE', amount: 0 });

    expect(zeroAmount.status).toBe(400);

    const negativeAmount = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({ purchaseOrderId: primaryPurchaseOrderId, type: 'REVENUE', amount: -1 });

    expect(negativeAmount.status).toBe(400);

    const invalidCurrency = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        purchaseOrderId: primaryPurchaseOrderId,
        type: 'REVENUE',
        amount: 10,
        currency: 'US',
      });

    expect(invalidCurrency.status).toBe(400);

    const invalidExchangeRate = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        purchaseOrderId: primaryPurchaseOrderId,
        type: 'REVENUE',
        amount: 10,
        exchangeRate: 0,
      });

    expect(invalidExchangeRate.status).toBe(400);

    const invalidDate = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        purchaseOrderId: primaryPurchaseOrderId,
        type: 'REVENUE',
        amount: 10,
        occurredAt: 'not-a-date',
      });

    expect(invalidDate.status).toBe(400);

    const missingOrder = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({ purchaseOrderId: 'does-not-exist', type: 'REVENUE', amount: 10 });

    expect(missingOrder.status).toBe(404);
    expect(missingOrder.body.message).toBe('Purchase order not found');

    const missingShipment = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({ shipmentId: 'does-not-exist', type: 'REVENUE', amount: 10 });

    expect(missingShipment.status).toBe(404);
    expect(missingShipment.body.message).toBe('Shipment not found');

    const mismatchedCustomer = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        purchaseOrderId: primaryPurchaseOrderId,
        shipmentId: secondaryShipmentId,
        type: 'REVENUE',
        amount: 10,
      });

    expect(mismatchedCustomer.status).toBe(400);
    expect(mismatchedCustomer.body.message).toBe(
      'Purchase order and shipment must belong to the same customer',
    );

    const shipmentWithoutOrder = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        purchaseOrderId: primaryPurchaseOrderId,
        shipmentId: otherPrimaryShipmentId,
        type: 'REVENUE',
        amount: 10,
      });

    expect(shipmentWithoutOrder.status).toBe(400);
    expect(shipmentWithoutOrder.body.message).toBe('Shipment does not include the purchase order');

    const missingSupplier = await request(app)
      .post('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        purchaseOrderId: primaryPurchaseOrderId,
        supplierId: 'does-not-exist',
        type: 'REVENUE',
        amount: 10,
      });

    expect(missingSupplier.status).toBe(400);
    expect(missingSupplier.body.message).toBe('Supplier not found');

    for (const token of [salesAccessToken, opsAccessToken, portalAccessToken]) {
      const create = await request(app)
        .post('/api/v1/finance/ledger-entries')
        .set('Authorization', bearer(token))
        .send({ purchaseOrderId: primaryPurchaseOrderId, type: 'REVENUE', amount: 10 });

      expect(create.status).toBe(403);
    }

    const missingProfitQuery = await request(app)
      .get('/api/v1/finance/profit')
      .set('Authorization', bearer(financeAccessToken));

    expect(missingProfitQuery.status).toBe(400);

    const missingProfitOrder = await request(app)
      .get('/api/v1/finance/profit')
      .query({ purchaseOrderId: 'does-not-exist' })
      .set('Authorization', bearer(financeAccessToken));

    expect(missingProfitOrder.status).toBe(404);
  });

  it('creates ledger entries with derived context and base currency amounts', async () => {
    const entryOne = await createEntry(financeAccessToken, {
      purchaseOrderId: primaryPurchaseOrderId,
      type: 'REVENUE',
      amount: 1000,
      currency: 'USD',
      exchangeRate: 1,
      description: 'Initial revenue',
      reference: 'INV-001',
      occurredAt: '2027-01-01T00:00:00.000Z',
    });

    expect(entryOne).toMatchObject({
      purchaseOrderId: primaryPurchaseOrderId,
      shipmentId: null,
      customerId: primaryCustomerId,
      supplierId,
      type: 'REVENUE',
      status: 'PENDING',
      currency: 'USD',
      createdById: financeUserId,
      approvedById: null,
      approvedAt: null,
      voidedAt: null,
      description: 'Initial revenue',
      reference: 'INV-001',
    });
    expect(entryOne.entryNumber).toMatch(/^LE-\d+-[A-F0-9]{8}$/);
    expect(Number(entryOne.amount)).toBe(1000);
    expect(Number(entryOne.exchangeRate)).toBe(1);
    expect(Number(entryOne.amountInBaseCurrency)).toBe(1000);
    expect(entryOne.occurredAt).toBe('2027-01-01T00:00:00.000Z');
    expect(entryOne.purchaseOrder).toMatchObject({
      id: primaryPurchaseOrderId,
      orderNumber: primaryPurchaseOrderNumber,
      currency: 'USD',
    });
    expect(entryOne.customer).toMatchObject({ id: primaryCustomerId });
    expect(entryOne.supplier).toMatchObject({ id: supplierId });
    expect(entryOne.createdBy).toMatchObject({ id: financeUserId });

    entryOneId = entryOne.id as string;
    entryOneNumber = entryOne.entryNumber as string;

    const entryTwo = await createEntry(financeAccessToken, {
      shipmentId: secondaryShipmentId,
      type: 'COST',
      amount: 200,
      exchangeRate: 1.1,
      description: 'Secondary cost',
      occurredAt: '2027-02-01T00:00:00.000Z',
    });

    expect(entryTwo).toMatchObject({
      purchaseOrderId: null,
      shipmentId: secondaryShipmentId,
      customerId: secondaryCustomerId,
      supplierId,
      type: 'COST',
      status: 'PENDING',
      currency: 'EUR',
      description: 'Secondary cost',
    });
    expect(Number(entryTwo.amount)).toBe(200);
    expect(Number(entryTwo.amountInBaseCurrency)).toBe(220);
    expect(entryTwo.shipment).toMatchObject({
      id: secondaryShipmentId,
      shipmentNumber: secondaryShipmentNumber,
    });

    entryTwoId = entryTwo.id as string;
    entryTwoNumber = entryTwo.entryNumber as string;

    const entryThree = await createEntry(financeAccessToken, {
      purchaseOrderId: primaryPurchaseOrderId,
      shipmentId: primaryShipmentId,
      type: 'COST',
      amount: 300,
      currency: 'USD',
      exchangeRate: 1,
      description: 'Linked cost',
      occurredAt: '2027-03-01T00:00:00.000Z',
    });

    expect(entryThree).toMatchObject({
      purchaseOrderId: primaryPurchaseOrderId,
      shipmentId: primaryShipmentId,
      customerId: primaryCustomerId,
      supplierId,
      type: 'COST',
      currency: 'USD',
      description: 'Linked cost',
    });
    expect(Number(entryThree.amountInBaseCurrency)).toBe(300);
    entryThreeId = entryThree.id as string;
    entryThreeNumber = entryThree.entryNumber as string;

    const entryFour = await createEntry(adminAccessToken, {
      purchaseOrderId: secondaryPurchaseOrderId,
      type: 'REVENUE',
      amount: 500,
      currency: 'EUR',
      exchangeRate: 1,
      supplierId,
      description: 'Secondary revenue',
      occurredAt: '2027-04-01T00:00:00.000Z',
    });

    expect(entryFour).toMatchObject({
      purchaseOrderId: secondaryPurchaseOrderId,
      customerId: secondaryCustomerId,
      supplierId,
      type: 'REVENUE',
      currency: 'EUR',
      createdById: adminId,
    });
    expect(Number(entryFour.amountInBaseCurrency)).toBe(500);
    entryFourId = entryFour.id as string;

    const entryFive = await createEntry(adminAccessToken, {
      purchaseOrderId: primaryPurchaseOrderId,
      type: 'ADJUSTMENT',
      amount: 50,
      currency: 'USD',
      description: 'Adjustment',
      occurredAt: '2027-05-01T00:00:00.000Z',
    });
    entryFiveId = entryFive.id as string;

    const entrySix = await createEntry(adminAccessToken, {
      purchaseOrderId: primaryPurchaseOrderId,
      type: 'PAYMENT',
      amount: 400,
      currency: 'USD',
      description: 'Payment',
      occurredAt: '2027-06-01T00:00:00.000Z',
    });
    entrySixId = entrySix.id as string;

    const entrySeven = await createEntry(adminAccessToken, {
      purchaseOrderId: primaryPurchaseOrderId,
      type: 'REFUND',
      amount: 100,
      currency: 'USD',
      description: 'Refund',
      occurredAt: '2027-07-01T00:00:00.000Z',
    });
    entrySevenId = entrySeven.id as string;

    const entryEight = await createEntry(adminAccessToken, {
      purchaseOrderId: primaryPurchaseOrderId,
      type: 'COST',
      amount: 999,
      currency: 'USD',
      description: 'Voided cost',
      occurredAt: '2027-08-01T00:00:00.000Z',
    });
    entryEightId = entryEight.id as string;

    const entryTen = await createEntry(adminAccessToken, {
      purchaseOrderId: primaryPurchaseOrderId,
      type: 'COST',
      amount: 111,
      currency: 'USD',
      description: 'Pending void',
      occurredAt: '2027-09-01T00:00:00.000Z',
    });
    entryTenId = entryTen.id as string;

    const entryEleven = await createEntry(adminAccessToken, {
      purchaseOrderId: primaryPurchaseOrderId,
      type: 'COST',
      amount: 777,
      currency: 'USD',
      description: 'Pending excluded',
      occurredAt: '2027-10-01T00:00:00.000Z',
    });
    entryElevenId = entryEleven.id as string;

    expect(ledgerEntryIds).toHaveLength(10);
  });

  it('lists and gets ledger entries with filters, search, sorting, and pagination', async () => {
    const byCustomer = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ customerId: primaryCustomerId })
      .set('Authorization', bearer(financeAccessToken));

    expect(byCustomer.status).toBe(200);
    expect(byCustomer.body.meta.total).toBe(8);

    const bySecondaryCustomer = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ customerId: secondaryCustomerId })
      .set('Authorization', bearer(financeAccessToken));

    expect(bySecondaryCustomer.status).toBe(200);
    expect(bySecondaryCustomer.body.meta.total).toBe(2);

    const byType = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ customerId: primaryCustomerId, type: 'REVENUE' })
      .set('Authorization', bearer(financeAccessToken));

    expect(byType.status).toBe(200);
    expect(byType.body.data).toHaveLength(1);
    expect(byType.body.data[0].id).toBe(entryOneId);

    const byStatus = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ customerId: primaryCustomerId, status: 'PENDING' })
      .set('Authorization', bearer(financeAccessToken));

    expect(byStatus.status).toBe(200);
    expect(byStatus.body.meta.total).toBe(8);

    const byPurchaseOrder = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ purchaseOrderId: primaryPurchaseOrderId })
      .set('Authorization', bearer(financeAccessToken));

    expect(byPurchaseOrder.status).toBe(200);
    expect(byPurchaseOrder.body.meta.total).toBe(8);

    const byShipment = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ shipmentId: primaryShipmentId })
      .set('Authorization', bearer(financeAccessToken));

    expect(byShipment.status).toBe(200);
    expect(byShipment.body.data).toHaveLength(1);
    expect(byShipment.body.data[0].id).toBe(entryThreeId);

    const bySupplier = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ customerId: primaryCustomerId, supplierId })
      .set('Authorization', bearer(financeAccessToken));

    expect(bySupplier.status).toBe(200);
    expect(bySupplier.body.meta.total).toBe(8);

    const byCurrency = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ customerId: secondaryCustomerId, currency: 'EUR' })
      .set('Authorization', bearer(financeAccessToken));

    expect(byCurrency.status).toBe(200);
    expect(byCurrency.body.meta.total).toBe(2);

    const byDateRange = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({
        customerId: primaryCustomerId,
        dateFrom: '2027-03-01T00:00:00.000Z',
        dateTo: '2027-03-31T23:59:59.999Z',
      })
      .set('Authorization', bearer(financeAccessToken));

    expect(byDateRange.status).toBe(200);
    expect(byDateRange.body.data).toHaveLength(1);
    expect(byDateRange.body.data[0].id).toBe(entryThreeId);

    const byNumber = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ search: entryOneNumber })
      .set('Authorization', bearer(financeAccessToken));

    expect(byNumber.status).toBe(200);
    expect(byNumber.body.data).toHaveLength(1);
    expect(byNumber.body.data[0].id).toBe(entryOneId);

    const byDescription = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ search: 'Linked cost' })
      .set('Authorization', bearer(financeAccessToken));

    expect(byDescription.status).toBe(200);
    expect(byDescription.body.data).toHaveLength(1);
    expect(byDescription.body.data[0].id).toBe(entryThreeId);

    const byReference = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ search: 'INV-001' })
      .set('Authorization', bearer(financeAccessToken));

    expect(byReference.status).toBe(200);
    expect(byReference.body.data).toHaveLength(1);
    expect(byReference.body.data[0].id).toBe(entryOneId);

    const byOrderNumber = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ search: primaryPurchaseOrderNumber })
      .set('Authorization', bearer(financeAccessToken));

    expect(byOrderNumber.status).toBe(200);
    expect(byOrderNumber.body.meta.total).toBe(8);

    const byShipmentNumber = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ search: primaryShipmentNumber })
      .set('Authorization', bearer(financeAccessToken));

    expect(byShipmentNumber.status).toBe(200);
    expect(byShipmentNumber.body.data).toHaveLength(1);
    expect(byShipmentNumber.body.data[0].id).toBe(entryThreeId);

    const byCustomerName = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ search: primaryCustomerName })
      .set('Authorization', bearer(financeAccessToken));

    expect(byCustomerName.status).toBe(200);
    expect(byCustomerName.body.meta.total).toBe(8);

    const bySupplierName = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ search: supplierName })
      .set('Authorization', bearer(financeAccessToken));

    expect(bySupplierName.status).toBe(200);
    expect(bySupplierName.body.meta.total).toBe(10);

    const sorted = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ customerId: primaryCustomerId, sortBy: 'amount', sortOrder: 'asc' })
      .set('Authorization', bearer(financeAccessToken));

    expect(sorted.status).toBe(200);
    expect(sorted.body.data).toHaveLength(8);
    expect(Number(sorted.body.data[0].amount)).toBeLessThanOrEqual(
      Number(sorted.body.data[7].amount),
    );

    const paginated = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ customerId: primaryCustomerId, page: 1, limit: 2 })
      .set('Authorization', bearer(financeAccessToken));

    expect(paginated.status).toBe(200);
    expect(paginated.body.data).toHaveLength(2);
    expect(paginated.body.meta).toEqual({ page: 1, limit: 2, total: 8 });

    const invalidType = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ type: 'INVALID' })
      .set('Authorization', bearer(financeAccessToken));

    expect(invalidType.status).toBe(400);

    const invalidStatus = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ status: 'INVALID' })
      .set('Authorization', bearer(financeAccessToken));

    expect(invalidStatus.status).toBe(400);

    const invalidSort = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ sortBy: 'customer' })
      .set('Authorization', bearer(financeAccessToken));

    expect(invalidSort.status).toBe(400);

    const invalidLimit = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .query({ limit: 101 })
      .set('Authorization', bearer(financeAccessToken));

    expect(invalidLimit.status).toBe(400);

    const fetched = await request(app)
      .get(`/api/v1/finance/ledger-entries/${entryOneId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.reference).toBe('INV-001');

    const missing = await request(app)
      .get('/api/v1/finance/ledger-entries/does-not-exist')
      .set('Authorization', bearer(financeAccessToken));

    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe('Ledger entry not found');
  });

  it('updates pending entries and enforces approval and void rules', async () => {
    const updated = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryOneId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({
        amount: 1200,
        currency: 'USD',
        exchangeRate: 1,
        description: '',
        reference: 'INV-001-UPDATED',
        occurredAt: '2027-01-15T00:00:00.000Z',
      });

    expect(updated.status).toBe(200);
    expect(Number(updated.body.data.amount)).toBe(1200);
    expect(Number(updated.body.data.amountInBaseCurrency)).toBe(1200);
    expect(updated.body.data.description).toBeNull();
    expect(updated.body.data.reference).toBe('INV-001-UPDATED');
    expect(updated.body.data.occurredAt).toBe('2027-01-15T00:00:00.000Z');

    const updatedCost = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryTwoId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ amount: 250, exchangeRate: 1.2 });

    expect(updatedCost.status).toBe(200);
    expect(Number(updatedCost.body.data.amount)).toBe(250);
    expect(updatedCost.body.data.currency).toBe('EUR');
    expect(Number(updatedCost.body.data.amountInBaseCurrency)).toBe(300);

    const clearedSupplier = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryThreeId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ supplierId: null });

    expect(clearedSupplier.status).toBe(200);
    expect(clearedSupplier.body.data.supplierId).toBeNull();

    const invalidSupplier = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryThreeId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ supplierId: 'does-not-exist' });

    expect(invalidSupplier.status).toBe(400);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryThreeId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);

    const invalidAmount = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryThreeId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ amount: 0 });

    expect(invalidAmount.status).toBe(400);

    const invalidDate = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryThreeId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ occurredAt: 'not-a-date' });

    expect(invalidDate.status).toBe(400);

    const missing = await request(app)
      .patch('/api/v1/finance/ledger-entries/does-not-exist')
      .set('Authorization', bearer(financeAccessToken))
      .send({ description: 'Missing' });

    expect(missing.status).toBe(404);

    const approved = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryOneId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe('APPROVED');
    expect(approved.body.data.approvedById).toBe(financeUserId);
    expect(approved.body.data.approvedAt).not.toBeNull();

    const approvedAgain = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryOneId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approvedAgain.status).toBe(200);

    const updateApproved = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryOneId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ description: 'Should fail' });

    expect(updateApproved.status).toBe(400);
    expect(updateApproved.body.message).toBe('Only pending ledger entries can be updated');

    for (const id of [
      entryTwoId,
      entryThreeId,
      entryFourId,
      entryFiveId,
      entrySixId,
      entrySevenId,
      entryEightId,
    ]) {
      const response = await request(app)
        .patch(`/api/v1/finance/ledger-entries/${id}/approve`)
        .set('Authorization', bearer(financeAccessToken));

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('APPROVED');
    }

    const voidedApproved = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryEightId}/void`)
      .set('Authorization', bearer(financeAccessToken));

    expect(voidedApproved.status).toBe(200);
    expect(voidedApproved.body.data.status).toBe('VOID');
    expect(voidedApproved.body.data.voidedAt).not.toBeNull();

    const voidedPending = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryTenId}/void`)
      .set('Authorization', bearer(financeAccessToken));

    expect(voidedPending.status).toBe(200);
    expect(voidedPending.body.data.status).toBe('VOID');

    const voidedAgain = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryEightId}/void`)
      .set('Authorization', bearer(financeAccessToken));

    expect(voidedAgain.status).toBe(200);

    const voidedPendingAgain = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryTenId}/void`)
      .set('Authorization', bearer(financeAccessToken));

    expect(voidedPendingAgain.status).toBe(200);

    const updateVoided = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryTenId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ description: 'Should fail' });

    expect(updateVoided.status).toBe(400);

    const approveVoided = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryEightId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approveVoided.status).toBe(400);

    const approveMissing = await request(app)
      .patch('/api/v1/finance/ledger-entries/does-not-exist/approve')
      .set('Authorization', bearer(financeAccessToken));

    expect(approveMissing.status).toBe(404);

    const voidMissing = await request(app)
      .patch('/api/v1/finance/ledger-entries/does-not-exist/void')
      .set('Authorization', bearer(financeAccessToken));

    expect(voidMissing.status).toBe(404);
  });

  it('computes per-order profit from approved entries only', async () => {
    const primaryProfit = await request(app)
      .get('/api/v1/finance/profit')
      .query({ purchaseOrderId: primaryPurchaseOrderId })
      .set('Authorization', bearer(financeAccessToken));

    expect(primaryProfit.status).toBe(200);
    expect(primaryProfit.body.data).toMatchObject({
      purchaseOrderId: primaryPurchaseOrderId,
      orderNumber: primaryPurchaseOrderNumber,
      orderStatus: 'APPROVED',
      orderCurrency: 'USD',
      baseCurrency: 'USD',
      entryCount: 5,
    });
    expect(Number(primaryProfit.body.data.orderTotal)).toBe(1000);
    expect(Number(primaryProfit.body.data.revenue)).toBe(1200);
    expect(Number(primaryProfit.body.data.costs)).toBe(300);
    expect(Number(primaryProfit.body.data.refunds)).toBe(100);
    expect(Number(primaryProfit.body.data.adjustments)).toBe(50);
    expect(Number(primaryProfit.body.data.payments)).toBe(400);
    expect(Number(primaryProfit.body.data.profit)).toBe(850);

    const secondaryProfit = await request(app)
      .get('/api/v1/finance/profit')
      .query({ purchaseOrderId: secondaryPurchaseOrderId })
      .set('Authorization', bearer(financeAccessToken));

    expect(secondaryProfit.status).toBe(200);
    expect(secondaryProfit.body.data).toMatchObject({
      purchaseOrderId: secondaryPurchaseOrderId,
      orderNumber: secondaryPurchaseOrderNumber,
      orderStatus: 'APPROVED',
      orderCurrency: 'EUR',
      baseCurrency: 'USD',
      entryCount: 2,
    });
    expect(Number(secondaryProfit.body.data.orderTotal)).toBe(500);
    expect(Number(secondaryProfit.body.data.revenue)).toBe(500);
    expect(Number(secondaryProfit.body.data.costs)).toBe(300);
    expect(Number(secondaryProfit.body.data.refunds)).toBe(0);
    expect(Number(secondaryProfit.body.data.adjustments)).toBe(0);
    expect(Number(secondaryProfit.body.data.payments)).toBe(0);
    expect(Number(secondaryProfit.body.data.profit)).toBe(200);

    const missingQuery = await request(app)
      .get('/api/v1/finance/profit')
      .set('Authorization', bearer(financeAccessToken));

    expect(missingQuery.status).toBe(400);

    const missingOrder = await request(app)
      .get('/api/v1/finance/profit')
      .query({ purchaseOrderId: 'does-not-exist' })
      .set('Authorization', bearer(financeAccessToken));

    expect(missingOrder.status).toBe(404);
  });

  it('exports filtered ledger entries as CSV', async () => {
    const exported = await request(app)
      .get('/api/v1/finance/ledger-entries/export')
      .query({ purchaseOrderId: primaryPurchaseOrderId })
      .set('Authorization', bearer(financeAccessToken));

    expect(exported.status).toBe(200);
    expect(exported.headers['content-type']).toContain('text/csv');
    expect(exported.text).toContain('entryNumber');
    expect(exported.text).toContain(entryOneNumber);
    expect(exported.text).not.toContain(entryTwoNumber);

    const revenueOnly = await request(app)
      .get('/api/v1/finance/ledger-entries/export')
      .query({ purchaseOrderId: primaryPurchaseOrderId, type: 'REVENUE' })
      .set('Authorization', bearer(financeAccessToken));

    expect(revenueOnly.status).toBe(200);
    expect(revenueOnly.text).toContain(entryOneNumber);
    expect(revenueOnly.text).not.toContain(entryThreeNumber);

    const adminExport = await request(app)
      .get('/api/v1/finance/ledger-entries/export')
      .set('Authorization', bearer(adminAccessToken));

    expect(adminExport.status).toBe(200);

    for (const token of [salesAccessToken, opsAccessToken, portalAccessToken]) {
      const response = await request(app)
        .get('/api/v1/finance/ledger-entries/export')
        .set('Authorization', bearer(token));

      expect(response.status).toBe(403);
    }

    const invalidType = await request(app)
      .get('/api/v1/finance/ledger-entries/export')
      .query({ type: 'INVALID' })
      .set('Authorization', bearer(financeAccessToken));

    expect(invalidType.status).toBe(400);
  });

  it('enforces finance, sales, operations, customer, and admin permissions', async () => {
    const forbiddenTokens = [salesAccessToken, opsAccessToken, portalAccessToken];

    for (const token of forbiddenTokens) {
      const list = await request(app)
        .get('/api/v1/finance/ledger-entries')
        .set('Authorization', bearer(token));

      expect(list.status).toBe(403);

      const get = await request(app)
        .get(`/api/v1/finance/ledger-entries/${entryOneId}`)
        .set('Authorization', bearer(token));

      expect(get.status).toBe(403);

      const create = await request(app)
        .post('/api/v1/finance/ledger-entries')
        .set('Authorization', bearer(token))
        .send({ purchaseOrderId: primaryPurchaseOrderId, type: 'REVENUE', amount: 10 });

      expect(create.status).toBe(403);

      const update = await request(app)
        .patch(`/api/v1/finance/ledger-entries/${entryElevenId}`)
        .set('Authorization', bearer(token))
        .send({ description: 'Should fail' });

      expect(update.status).toBe(403);

      const approve = await request(app)
        .patch(`/api/v1/finance/ledger-entries/${entryElevenId}/approve`)
        .set('Authorization', bearer(token));

      expect(approve.status).toBe(403);

      const voidEntry = await request(app)
        .patch(`/api/v1/finance/ledger-entries/${entryElevenId}/void`)
        .set('Authorization', bearer(token));

      expect(voidEntry.status).toBe(403);

      const profit = await request(app)
        .get('/api/v1/finance/profit')
        .query({ purchaseOrderId: primaryPurchaseOrderId })
        .set('Authorization', bearer(token));

      expect(profit.status).toBe(403);
    }

    const adminUpdate = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryElevenId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ description: 'Admin updated' });

    expect(adminUpdate.status).toBe(200);
    expect(adminUpdate.body.data.description).toBe('Admin updated');

    const financeList = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(financeAccessToken));

    expect(financeList.status).toBe(200);

    const financeGet = await request(app)
      .get(`/api/v1/finance/ledger-entries/${entryElevenId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeGet.status).toBe(200);

    const financeApprove = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryElevenId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeApprove.status).toBe(200);

    const financeVoid = await request(app)
      .patch(`/api/v1/finance/ledger-entries/${entryElevenId}/void`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeVoid.status).toBe(200);
    expect(financeVoid.body.data.status).toBe('VOID');

    const adminList = await request(app)
      .get('/api/v1/finance/ledger-entries')
      .set('Authorization', bearer(adminAccessToken));

    expect(adminList.status).toBe(200);

    const adminProfit = await request(app)
      .get('/api/v1/finance/profit')
      .query({ purchaseOrderId: primaryPurchaseOrderId })
      .set('Authorization', bearer(adminAccessToken));

    expect(adminProfit.status).toBe(200);

    const adminDelete = await request(app)
      .delete(`/api/v1/finance/ledger-entries/${entryElevenId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminDelete.status).toBe(404);

    const financeDelete = await request(app)
      .delete(`/api/v1/finance/ledger-entries/${entryElevenId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeDelete.status).toBe(404);

    const missingGet = await request(app)
      .get('/api/v1/finance/ledger-entries/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missingGet.status).toBe(404);

    const missingUpdate = await request(app)
      .patch('/api/v1/finance/ledger-entries/does-not-exist')
      .set('Authorization', bearer(adminAccessToken))
      .send({ description: 'Missing' });

    expect(missingUpdate.status).toBe(404);

    const missingApprove = await request(app)
      .patch('/api/v1/finance/ledger-entries/does-not-exist/approve')
      .set('Authorization', bearer(adminAccessToken));

    expect(missingApprove.status).toBe(404);

    const missingVoid = await request(app)
      .patch('/api/v1/finance/ledger-entries/does-not-exist/void')
      .set('Authorization', bearer(adminAccessToken));

    expect(missingVoid.status).toBe(404);
  });
});
