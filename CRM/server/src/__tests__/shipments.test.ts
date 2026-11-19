import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.shipments.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const opsEmail = `test.shipments.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const salesEmail = `test.shipments.sales.${unique}@example.com`;
const salesPassword = 'SalesPass123!';
const financeEmail = `test.shipments.finance.${unique}@example.com`;
const financePassword = 'FinancePass123!';
const portalEmail = `test.shipments.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';

const primaryCustomerName = `Shipments Primary Customer ${unique}`;
const secondaryCustomerName = `Shipments Secondary Customer ${unique}`;
const supplierName = `Shipments Supplier ${unique}`;
const carrierOne = `Maersk ${unique}`;
const carrierTwo = `DHL ${unique}`;
const carrierThree = `FedEx ${unique}`;
const trackingOne = `TRACK-ONE-${unique}`;
const trackingTwo = `TRACK-TWO-${unique}`;
const trackingThree = `TRACK-THREE-${unique}`;

let adminId: string;
let opsUserId: string;
let salesUserId: string;
let financeUserId: string;
let portalUserId: string;
let adminAccessToken: string;
let opsAccessToken: string;
let salesAccessToken: string;
let financeAccessToken: string;
let portalAccessToken: string;
let primaryCustomerId: string;
let secondaryCustomerId: string;
let supplierId: string;
let primaryRequestId: string;
let secondaryRequestId: string;
let primaryQuotationId: string;
let secondaryQuotationId: string;
let approvedPurchaseOrderId: string;
let approvedPurchaseOrderNumber: string;
let inProductionPurchaseOrderId: string;
let inProductionPurchaseOrderNumber: string;
let secondaryPurchaseOrderId: string;
let secondaryPurchaseOrderNumber: string;
let draftPurchaseOrderId: string;
let cancelledPurchaseOrderId: string;
let shippedPurchaseOrderId: string;
let itemAId: string;
let itemBId: string;
let itemCId: string;
let itemDId: string;
let itemEId: string;
let itemFId: string;
let itemGId: string;
let shipmentOneId: string;
let shipmentOneNumber: string;
let shipmentTwoId: string;
let shipmentThreeId: string;
let shipmentFourId: string;
let shipmentSixId: string;
let shipmentSevenId: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

let counter = 0;

const createPurchaseOrder = async (input: {
  customerId: string;
  quotationId: string;
  status: 'APPROVED' | 'IN_PRODUCTION' | 'DRAFT' | 'CANCELLED' | 'SHIPPED';
  items: Array<{ name: string; quantity: number }>;
}) => {
  counter += 1;

  const approved = input.status === 'APPROVED' || input.status === 'IN_PRODUCTION';

  return prisma.purchaseOrder.create({
    data: {
      orderNumber: `PO-SH-TEST-${unique}-${counter}`,
      quotationId: input.quotationId,
      customerId: input.customerId,
      supplierId,
      status: input.status,
      currency: 'USD',
      subtotal: 100,
      shippingFee: 0,
      tax: 0,
      total: 100,
      createdById: adminId,
      approvedById: approved || input.status === 'SHIPPED' ? adminId : null,
      approvedAt: approved || input.status === 'SHIPPED' ? new Date() : null,
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

beforeAll(async () => {
  const [superAdminRole, opsRole, salesRole, financeRole, customerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CHINA_OPERATIONS' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'SALES' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'FINANCE' } }),
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

  const [admin, opsUser, salesUser, financeUser, portalUser] = await Promise.all([
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
        customerId: primaryCustomer.id,
      },
    }),
  ]);

  adminId = admin.id;
  opsUserId = opsUser.id;
  salesUserId = salesUser.id;
  financeUserId = financeUser.id;
  portalUserId = portalUser.id;

  const primaryRequest = await prisma.productRequest.create({
    data: {
      requestNumber: `PR-SH-TEST-${unique}-1`,
      customerId: primaryCustomerId,
      title: `Shipments primary request ${unique}`,
      status: 'APPROVED',
      createdById: adminId,
    },
  });
  primaryRequestId = primaryRequest.id;

  const secondaryRequest = await prisma.productRequest.create({
    data: {
      requestNumber: `PR-SH-TEST-${unique}-2`,
      customerId: secondaryCustomerId,
      title: `Shipments secondary request ${unique}`,
      status: 'APPROVED',
      createdById: adminId,
    },
  });
  secondaryRequestId = secondaryRequest.id;

  const primaryQuotation = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-SH-TEST-${unique}-1`,
      productRequestId: primaryRequestId,
      customerId: primaryCustomerId,
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
        create: [{ name: 'Primary quotation item', quantity: 1, unitPrice: 100 }],
      },
    },
  });
  primaryQuotationId = primaryQuotation.id;

  const secondaryQuotation = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-SH-TEST-${unique}-2`,
      productRequestId: secondaryRequestId,
      customerId: secondaryCustomerId,
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
        create: [{ name: 'Secondary quotation item', quantity: 1, unitPrice: 100 }],
      },
    },
  });
  secondaryQuotationId = secondaryQuotation.id;

  const approvedPurchaseOrder = await createPurchaseOrder({
    customerId: primaryCustomerId,
    quotationId: primaryQuotationId,
    status: 'APPROVED',
    items: [
      { name: 'Item A', quantity: 10 },
      { name: 'Item B', quantity: 5 },
    ],
  });
  approvedPurchaseOrderId = approvedPurchaseOrder.id;
  approvedPurchaseOrderNumber = approvedPurchaseOrder.orderNumber;
  itemAId = approvedPurchaseOrder.items[0]!.id;
  itemBId = approvedPurchaseOrder.items[1]!.id;

  const inProductionPurchaseOrder = await createPurchaseOrder({
    customerId: primaryCustomerId,
    quotationId: primaryQuotationId,
    status: 'IN_PRODUCTION',
    items: [{ name: 'Item C', quantity: 20 }],
  });
  inProductionPurchaseOrderId = inProductionPurchaseOrder.id;
  inProductionPurchaseOrderNumber = inProductionPurchaseOrder.orderNumber;
  itemCId = inProductionPurchaseOrder.items[0]!.id;

  const secondaryPurchaseOrder = await createPurchaseOrder({
    customerId: secondaryCustomerId,
    quotationId: secondaryQuotationId,
    status: 'APPROVED',
    items: [{ name: 'Item D', quantity: 10 }],
  });
  secondaryPurchaseOrderId = secondaryPurchaseOrder.id;
  secondaryPurchaseOrderNumber = secondaryPurchaseOrder.orderNumber;
  itemDId = secondaryPurchaseOrder.items[0]!.id;

  const draftPurchaseOrder = await createPurchaseOrder({
    customerId: primaryCustomerId,
    quotationId: primaryQuotationId,
    status: 'DRAFT',
    items: [{ name: 'Item E', quantity: 5 }],
  });
  draftPurchaseOrderId = draftPurchaseOrder.id;
  itemEId = draftPurchaseOrder.items[0]!.id;

  const cancelledPurchaseOrder = await createPurchaseOrder({
    customerId: primaryCustomerId,
    quotationId: primaryQuotationId,
    status: 'CANCELLED',
    items: [{ name: 'Item F', quantity: 5 }],
  });
  cancelledPurchaseOrderId = cancelledPurchaseOrder.id;
  itemFId = cancelledPurchaseOrder.items[0]!.id;

  const shippedPurchaseOrder = await createPurchaseOrder({
    customerId: primaryCustomerId,
    quotationId: primaryQuotationId,
    status: 'SHIPPED',
    items: [{ name: 'Item G', quantity: 5 }],
  });
  shippedPurchaseOrderId = shippedPurchaseOrder.id;
  itemGId = shippedPurchaseOrder.items[0]!.id;

  const [adminLogin, opsLogin, salesLogin, financeLogin, portalLogin] = await Promise.all([
    login(adminEmail, adminPassword),
    login(opsEmail, opsPassword),
    login(salesEmail, salesPassword),
    login(financeEmail, financePassword),
    login(portalEmail, portalPassword),
  ]);

  adminAccessToken = adminLogin.body.data.accessToken;
  opsAccessToken = opsLogin.body.data.accessToken;
  salesAccessToken = salesLogin.body.data.accessToken;
  financeAccessToken = financeLogin.body.data.accessToken;
  portalAccessToken = portalLogin.body.data.accessToken;
});

afterAll(async () => {
  const userIds = [adminId, opsUserId, salesUserId, financeUserId, portalUserId].filter(
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
    approvedPurchaseOrderId,
    inProductionPurchaseOrderId,
    secondaryPurchaseOrderId,
    draftPurchaseOrderId,
    cancelledPurchaseOrderId,
    shippedPurchaseOrderId,
  ].filter((id): id is string => Boolean(id));
  const shipmentIds = [
    shipmentOneId,
    shipmentTwoId,
    shipmentThreeId,
    shipmentFourId,
    shipmentSixId,
    shipmentSevenId,
  ].filter((id): id is string => Boolean(id));

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        {
          resourceId: {
            in: [
              ...shipmentIds,
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
        { metadata: { path: ['email'], equals: salesEmail } },
        { metadata: { path: ['email'], equals: financeEmail } },
        { metadata: { path: ['email'], equals: portalEmail } },
      ],
    },
  });
  await prisma.shipment.deleteMany({ where: { id: { in: shipmentIds } } });
  await prisma.purchaseOrder.deleteMany({ where: { id: { in: purchaseOrderIds } } });
  await prisma.quotation.deleteMany({ where: { id: { in: quotationIds } } });
  await prisma.productRequest.deleteMany({ where: { id: { in: productRequestIds } } });
  await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('shipments module', () => {
  it('requires authentication and validates shipment payloads', async () => {
    const unauthenticated = await request(app).get('/api/v1/shipments');
    expect(unauthenticated.status).toBe(401);

    const missingItems = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ carrier: carrierOne });

    expect(missingItems.status).toBe(400);
    expect(missingItems.body.message).toBe('Validation failed');

    const emptyItems = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [] });

    expect(emptyItems.status).toBe(400);

    const zeroQuantity = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemAId, quantity: 0 }] });

    expect(zeroQuantity.status).toBe(400);

    const invalidDate = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        estimatedDeliveryDate: 'not-a-date',
        items: [{ purchaseOrderItemId: itemAId, quantity: 1 }],
      });

    expect(invalidDate.status).toBe(400);

    const duplicateItems = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        items: [
          { purchaseOrderItemId: itemAId, quantity: 1 },
          { purchaseOrderItemId: itemAId, quantity: 2 },
        ],
      });

    expect(duplicateItems.status).toBe(400);
    expect(duplicateItems.body.message).toBe('Duplicate purchase order items are not allowed');

    const missingItem = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: 'does-not-exist', quantity: 1 }] });

    expect(missingItem.status).toBe(404);
    expect(missingItem.body.message).toBe('Purchase order item not found');

    const draftItem = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemEId, quantity: 1 }] });

    expect(draftItem.status).toBe(400);
    expect(draftItem.body.message).toBe(
      'Purchase order must be approved or in production before shipping',
    );

    const cancelledItem = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemFId, quantity: 1 }] });

    expect(cancelledItem.status).toBe(400);

    const shippedItem = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemGId, quantity: 1 }] });

    expect(shippedItem.status).toBe(400);

    const mixedCustomers = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        items: [
          { purchaseOrderItemId: itemAId, quantity: 1 },
          { purchaseOrderItemId: itemDId, quantity: 1 },
        ],
      });

    expect(mixedCustomers.status).toBe(400);
    expect(mixedCustomers.body.message).toBe('All shipment items must belong to the same customer');

    const exceedsOrdered = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemAId, quantity: 11 }] });

    expect(exceedsOrdered.status).toBe(400);
    expect(exceedsOrdered.body.message).toBe(
      `Shipment quantity exceeds the ordered quantity for purchase order item ${itemAId}`,
    );
  });

  it('creates shipments and enforces cumulative shipped quantities', async () => {
    const response = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        carrier: carrierOne,
        trackingNumber: trackingOne,
        shippingMethod: 'Sea',
        origin: 'Shenzhen',
        destination: 'Dubai',
        estimatedDeliveryDate: '2027-05-01T00:00:00.000Z',
        notes: 'First shipment',
        items: [
          { purchaseOrderItemId: itemAId, quantity: 6 },
          { purchaseOrderItemId: itemBId, quantity: 2 },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      customerId: primaryCustomerId,
      status: 'PENDING',
      carrier: carrierOne,
      trackingNumber: trackingOne,
      shippingMethod: 'Sea',
      origin: 'Shenzhen',
      destination: 'Dubai',
      createdById: opsUserId,
      notes: 'First shipment',
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
    });
    expect(response.body.data.shipmentNumber).toMatch(/^SH-\d+-[A-F0-9]{8}$/);
    expect(response.body.data.estimatedDeliveryDate).toBe('2027-05-01T00:00:00.000Z');
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data._count.items).toBe(2);
    expect(response.body.data.customer).toMatchObject({ id: primaryCustomerId });
    expect(response.body.data.createdBy).toMatchObject({ id: opsUserId });

    const shippedItemNames = response.body.data.items.map(
      (item: { purchaseOrderItem: { name: string } }) => item.purchaseOrderItem.name,
    );
    expect(shippedItemNames).toEqual(expect.arrayContaining(['Item A', 'Item B']));

    const firstItem = response.body.data.items.find(
      (item: { purchaseOrderItemId: string }) => item.purchaseOrderItemId === itemAId,
    );
    expect(firstItem.quantity).toBe(6);
    expect(firstItem.purchaseOrderItem).toMatchObject({
      id: itemAId,
      quantity: 10,
      purchaseOrderId: approvedPurchaseOrderId,
    });
    expect(firstItem.purchaseOrderItem.purchaseOrder).toMatchObject({
      id: approvedPurchaseOrderId,
      orderNumber: approvedPurchaseOrderNumber,
      status: 'APPROVED',
    });

    shipmentOneId = response.body.data.id;
    shipmentOneNumber = response.body.data.shipmentNumber;

    const second = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        carrier: carrierTwo,
        trackingNumber: trackingTwo,
        items: [
          { purchaseOrderItemId: itemAId, quantity: 4 },
          { purchaseOrderItemId: itemCId, quantity: 2 },
        ],
      });

    expect(second.status).toBe(201);
    expect(second.body.data.customerId).toBe(primaryCustomerId);
    expect(second.body.data.items).toHaveLength(2);
    shipmentTwoId = second.body.data.id;

    const exceedA = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemAId, quantity: 1 }] });

    expect(exceedA.status).toBe(400);
    expect(exceedA.body.message).toBe(
      `Shipment quantity exceeds the ordered quantity for purchase order item ${itemAId}`,
    );

    const exceedB = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemBId, quantity: 4 }] });

    expect(exceedB.status).toBe(400);

    const secondary = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        carrier: carrierThree,
        trackingNumber: trackingThree,
        items: [{ purchaseOrderItemId: itemDId, quantity: 3 }],
      });

    expect(secondary.status).toBe(201);
    expect(secondary.body.data.customerId).toBe(secondaryCustomerId);
    expect(secondary.body.data.createdById).toBe(adminId);
    shipmentThreeId = secondary.body.data.id;

    const exceedD = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemDId, quantity: 8 }] });

    expect(exceedD.status).toBe(400);
  });

  it('lists and gets shipments with filters, search, sorting, and pagination', async () => {
    const byNumber = await request(app)
      .get('/api/v1/shipments')
      .query({ search: shipmentOneNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byNumber.status).toBe(200);
    expect(byNumber.body.data).toHaveLength(1);
    expect(byNumber.body.data[0].id).toBe(shipmentOneId);
    expect(byNumber.body.data[0]._count.items).toBe(2);

    const byCustomer = await request(app)
      .get('/api/v1/shipments')
      .query({ customerId: primaryCustomerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCustomer.status).toBe(200);
    expect(byCustomer.body.meta.total).toBe(2);
    expect(byCustomer.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([shipmentOneId, shipmentTwoId]),
    );

    const bySecondaryCustomer = await request(app)
      .get('/api/v1/shipments')
      .query({ customerId: secondaryCustomerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySecondaryCustomer.status).toBe(200);
    expect(bySecondaryCustomer.body.data).toHaveLength(1);
    expect(bySecondaryCustomer.body.data[0].id).toBe(shipmentThreeId);

    const byPurchaseOrder = await request(app)
      .get('/api/v1/shipments')
      .query({ purchaseOrderId: approvedPurchaseOrderId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byPurchaseOrder.status).toBe(200);
    expect(byPurchaseOrder.body.meta.total).toBe(2);
    expect(byPurchaseOrder.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([shipmentOneId, shipmentTwoId]),
    );

    const byInProductionPurchaseOrder = await request(app)
      .get('/api/v1/shipments')
      .query({ purchaseOrderId: inProductionPurchaseOrderId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byInProductionPurchaseOrder.status).toBe(200);
    expect(byInProductionPurchaseOrder.body.data).toHaveLength(1);
    expect(byInProductionPurchaseOrder.body.data[0].id).toBe(shipmentTwoId);

    const byCarrier = await request(app)
      .get('/api/v1/shipments')
      .query({ carrier: carrierOne })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCarrier.status).toBe(200);
    expect(byCarrier.body.data).toHaveLength(1);
    expect(byCarrier.body.data[0].id).toBe(shipmentOneId);

    const byTrackingNumber = await request(app)
      .get('/api/v1/shipments')
      .query({ trackingNumber: trackingTwo })
      .set('Authorization', bearer(adminAccessToken));

    expect(byTrackingNumber.status).toBe(200);
    expect(byTrackingNumber.body.data).toHaveLength(1);
    expect(byTrackingNumber.body.data[0].id).toBe(shipmentTwoId);

    const byCustomerName = await request(app)
      .get('/api/v1/shipments')
      .query({ search: primaryCustomerName })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCustomerName.status).toBe(200);
    expect(byCustomerName.body.meta.total).toBe(2);

    const byApprovedOrderNumber = await request(app)
      .get('/api/v1/shipments')
      .query({ search: approvedPurchaseOrderNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byApprovedOrderNumber.status).toBe(200);
    expect(byApprovedOrderNumber.body.meta.total).toBe(2);
    expect(byApprovedOrderNumber.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([shipmentOneId, shipmentTwoId]),
    );

    const byInProductionOrderNumber = await request(app)
      .get('/api/v1/shipments')
      .query({ search: inProductionPurchaseOrderNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byInProductionOrderNumber.status).toBe(200);
    expect(byInProductionOrderNumber.body.data).toHaveLength(1);
    expect(byInProductionOrderNumber.body.data[0].id).toBe(shipmentTwoId);

    const bySecondaryOrderNumber = await request(app)
      .get('/api/v1/shipments')
      .query({ search: secondaryPurchaseOrderNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySecondaryOrderNumber.status).toBe(200);
    expect(bySecondaryOrderNumber.body.data).toHaveLength(1);
    expect(bySecondaryOrderNumber.body.data[0].id).toBe(shipmentThreeId);

    const sorted = await request(app)
      .get('/api/v1/shipments')
      .query({
        customerId: primaryCustomerId,
        sortBy: 'shipmentNumber',
        sortOrder: 'asc',
      })
      .set('Authorization', bearer(adminAccessToken));

    expect(sorted.status).toBe(200);
    expect(sorted.body.data).toHaveLength(2);
    expect(sorted.body.data[0].shipmentNumber <= sorted.body.data[1].shipmentNumber).toBe(true);

    const paginated = await request(app)
      .get('/api/v1/shipments')
      .query({ customerId: primaryCustomerId, page: 1, limit: 1 })
      .set('Authorization', bearer(adminAccessToken));

    expect(paginated.status).toBe(200);
    expect(paginated.body.data).toHaveLength(1);
    expect(paginated.body.meta).toEqual({ page: 1, limit: 1, total: 2 });

    const combined = await request(app)
      .get('/api/v1/shipments')
      .query({ customerId: primaryCustomerId, status: 'PENDING' })
      .set('Authorization', bearer(adminAccessToken));

    expect(combined.status).toBe(200);
    expect(combined.body.meta.total).toBe(2);

    const invalidStatus = await request(app)
      .get('/api/v1/shipments')
      .query({ status: 'INVALID' })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidStatus.status).toBe(400);

    const invalidSort = await request(app)
      .get('/api/v1/shipments')
      .query({ sortBy: 'customer' })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidSort.status).toBe(400);

    const invalidLimit = await request(app)
      .get('/api/v1/shipments')
      .query({ limit: 101 })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidLimit.status).toBe(400);

    const fetched = await request(app)
      .get(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.items).toHaveLength(2);
    expect(fetched.body.data.notes).toBe('First shipment');

    const missing = await request(app)
      .get('/api/v1/shipments/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe('Shipment not found');
  });

  it('updates pending shipments and validates item changes', async () => {
    const updated = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({
        carrier: 'MSC',
        trackingNumber: 'TRACK-UPDATED',
        shippingMethod: 'Air',
        origin: '',
        destination: 'Abu Dhabi',
        estimatedDeliveryDate: null,
        notes: 'Updated shipment',
        items: [
          { purchaseOrderItemId: itemAId, quantity: 6 },
          { purchaseOrderItemId: itemBId, quantity: 5 },
        ],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.carrier).toBe('MSC');
    expect(updated.body.data.trackingNumber).toBe('TRACK-UPDATED');
    expect(updated.body.data.shippingMethod).toBe('Air');
    expect(updated.body.data.origin).toBeNull();
    expect(updated.body.data.destination).toBe('Abu Dhabi');
    expect(updated.body.data.estimatedDeliveryDate).toBeNull();
    expect(updated.body.data.notes).toBe('Updated shipment');
    expect(updated.body.data.items).toHaveLength(2);

    const itemQuantities = updated.body.data.items.map(
      (item: { purchaseOrderItemId: string; quantity: number }) => [
        item.purchaseOrderItemId,
        item.quantity,
      ],
    );
    expect(itemQuantities).toEqual(
      expect.arrayContaining([
        [itemAId, 6],
        [itemBId, 5],
      ]),
    );

    const exceedsAfterOtherShipment = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemAId, quantity: 10 }] });

    expect(exceedsAfterOtherShipment.status).toBe(400);
    expect(exceedsAfterOtherShipment.body.message).toBe(
      `Shipment quantity exceeds the ordered quantity for purchase order item ${itemAId}`,
    );

    const otherCustomerItem = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemDId, quantity: 1 }] });

    expect(otherCustomerItem.status).toBe(400);
    expect(otherCustomerItem.body.message).toBe(
      'Shipment items must belong to the shipment customer',
    );

    const draftOrderItem = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemEId, quantity: 1 }] });

    expect(draftOrderItem.status).toBe(400);

    const duplicateItems = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({
        items: [
          { purchaseOrderItemId: itemAId, quantity: 1 },
          { purchaseOrderItemId: itemAId, quantity: 2 },
        ],
      });

    expect(duplicateItems.status).toBe(400);

    const exceedsOrdered = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemAId, quantity: 11 }] });

    expect(exceedsOrdered.status).toBe(400);

    const zeroQuantity = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemAId, quantity: 0 }] });

    expect(zeroQuantity.status).toBe(400);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);

    const invalidDate = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ estimatedDeliveryDate: 'not-a-date' });

    expect(invalidDate.status).toBe(400);

    const missing = await request(app)
      .patch('/api/v1/shipments/does-not-exist')
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Missing' });

    expect(missing.status).toBe(404);

    const restore = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({
        items: [
          { purchaseOrderItemId: itemAId, quantity: 6 },
          { purchaseOrderItemId: itemBId, quantity: 2 },
        ],
      });

    expect(restore.status).toBe(200);
  });

  it('enforces shipment status transitions and releases cancelled quantities', async () => {
    const directInTransit = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_TRANSIT' });

    expect(directInTransit.status).toBe(400);

    const directDelivered = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'DELIVERED' });

    expect(directDelivered.status).toBe(400);

    const preparing = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PREPARING' });

    expect(preparing.status).toBe(200);
    expect(preparing.body.data.status).toBe('PREPARING');

    const updatePreparing = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Should fail' });

    expect(updatePreparing.status).toBe(400);
    expect(updatePreparing.body.message).toBe('Only pending shipments can be updated');

    const preparingToDelivered = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'DELIVERED' });

    expect(preparingToDelivered.status).toBe(400);

    const inTransit = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_TRANSIT' });

    expect(inTransit.status).toBe(200);
    expect(inTransit.body.data.status).toBe('IN_TRANSIT');
    expect(inTransit.body.data.shippedAt).not.toBeNull();

    const cancelInTransit = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelInTransit.status).toBe(400);

    const delivered = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'DELIVERED' });

    expect(delivered.status).toBe(200);
    expect(delivered.body.data.status).toBe('DELIVERED');
    expect(delivered.body.data.deliveredAt).not.toBeNull();
    expect(delivered.body.data.actualDeliveryDate).not.toBeNull();

    const deliveredAgain = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'DELIVERED' });

    expect(deliveredAgain.status).toBe(200);

    const reopenDelivered = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_TRANSIT' });

    expect(reopenDelivered.status).toBe(400);

    const cancelDelivered = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelDelivered.status).toBe(400);

    const updateDelivered = await request(app)
      .patch(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateDelivered.status).toBe(400);

    const cancelled = await request(app)
      .patch(`/api/v1/shipments/${shipmentTwoId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('CANCELLED');
    expect(cancelled.body.data.cancelledAt).not.toBeNull();

    const cancelledAgain = await request(app)
      .patch(`/api/v1/shipments/${shipmentTwoId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelledAgain.status).toBe(200);

    const reopenCancelled = await request(app)
      .patch(`/api/v1/shipments/${shipmentTwoId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PREPARING' });

    expect(reopenCancelled.status).toBe(400);

    const updateCancelled = await request(app)
      .patch(`/api/v1/shipments/${shipmentTwoId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateCancelled.status).toBe(400);

    const secondaryPreparing = await request(app)
      .patch(`/api/v1/shipments/${shipmentThreeId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'PREPARING' });

    expect(secondaryPreparing.status).toBe(200);

    const updateSecondaryPreparing = await request(app)
      .patch(`/api/v1/shipments/${shipmentThreeId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateSecondaryPreparing.status).toBe(400);

    const released = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        carrier: 'Released',
        trackingNumber: 'TRACK-RELEASED',
        items: [
          { purchaseOrderItemId: itemAId, quantity: 4 },
          { purchaseOrderItemId: itemCId, quantity: 2 },
        ],
      });

    expect(released.status).toBe(201);
    expect(released.body.data.customerId).toBe(primaryCustomerId);
    shipmentFourId = released.body.data.id;

    const exceedAfterRelease = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemAId, quantity: 1 }] });

    expect(exceedAfterRelease.status).toBe(400);

    const invalidStatus = await request(app)
      .patch(`/api/v1/shipments/${shipmentFourId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING' });

    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.message).toBe('Validation failed');

    const missing = await request(app)
      .patch('/api/v1/shipments/does-not-exist/status')
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(missing.status).toBe(404);
  });

  it('scopes customers to their own shipments and keeps them read-only', async () => {
    const list = await request(app)
      .get('/api/v1/shipments')
      .set('Authorization', bearer(portalAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(3);
    expect(list.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([shipmentOneId, shipmentTwoId, shipmentFourId]),
    );
    expect(list.body.data.map((item: { id: string }) => item.id)).not.toContain(shipmentThreeId);

    const own = await request(app)
      .get(`/api/v1/shipments/${shipmentOneId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(own.status).toBe(200);

    const ownPending = await request(app)
      .get(`/api/v1/shipments/${shipmentFourId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(ownPending.status).toBe(200);

    const other = await request(app)
      .get(`/api/v1/shipments/${shipmentThreeId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(other.status).toBe(404);

    const search = await request(app)
      .get('/api/v1/shipments')
      .query({ search: shipmentOneNumber })
      .set('Authorization', bearer(portalAccessToken));

    expect(search.status).toBe(200);
    expect(search.body.data).toHaveLength(1);
    expect(search.body.data[0].id).toBe(shipmentOneId);

    const delivered = await request(app)
      .get('/api/v1/shipments')
      .query({ status: 'DELIVERED' })
      .set('Authorization', bearer(portalAccessToken));

    expect(delivered.status).toBe(200);
    expect(delivered.body.data).toHaveLength(1);
    expect(delivered.body.data[0].id).toBe(shipmentOneId);

    const otherCustomerFilter = await request(app)
      .get('/api/v1/shipments')
      .query({ customerId: secondaryCustomerId })
      .set('Authorization', bearer(portalAccessToken));

    expect(otherCustomerFilter.status).toBe(200);
    expect(otherCustomerFilter.body.data).toHaveLength(0);

    const create = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(portalAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemAId, quantity: 1 }] });

    expect(create.status).toBe(403);

    const update = await request(app)
      .patch(`/api/v1/shipments/${shipmentFourId}`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ notes: 'Should fail' });

    expect(update.status).toBe(403);

    const status = await request(app)
      .patch(`/api/v1/shipments/${shipmentFourId}/status`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ status: 'CANCELLED' });

    expect(status.status).toBe(403);

    const remove = await request(app)
      .delete(`/api/v1/shipments/${shipmentFourId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(remove.status).toBe(404);
  });

  it('enforces sales, finance, operations, and admin permissions', async () => {
    const salesList = await request(app)
      .get('/api/v1/shipments')
      .set('Authorization', bearer(salesAccessToken));

    expect(salesList.status).toBe(200);
    expect(salesList.body.data.map((item: { id: string }) => item.id)).toContain(shipmentThreeId);

    const salesGet = await request(app)
      .get(`/api/v1/shipments/${shipmentThreeId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesGet.status).toBe(200);

    const salesCreate = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(salesAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemCId, quantity: 1 }] });

    expect(salesCreate.status).toBe(403);

    const salesUpdate = await request(app)
      .patch(`/api/v1/shipments/${shipmentFourId}`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ notes: 'Should fail' });

    expect(salesUpdate.status).toBe(403);

    const salesStatus = await request(app)
      .patch(`/api/v1/shipments/${shipmentFourId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'CANCELLED' });

    expect(salesStatus.status).toBe(403);

    const salesDelete = await request(app)
      .delete(`/api/v1/shipments/${shipmentFourId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesDelete.status).toBe(404);

    const financeList = await request(app)
      .get('/api/v1/shipments')
      .set('Authorization', bearer(financeAccessToken));

    expect(financeList.status).toBe(200);
    expect(financeList.body.data.map((item: { id: string }) => item.id)).toContain(shipmentThreeId);

    const financeGet = await request(app)
      .get(`/api/v1/shipments/${shipmentThreeId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeGet.status).toBe(200);

    const financeCreate = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(financeAccessToken))
      .send({ items: [{ purchaseOrderItemId: itemCId, quantity: 1 }] });

    expect(financeCreate.status).toBe(403);

    const financeUpdate = await request(app)
      .patch(`/api/v1/shipments/${shipmentFourId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ notes: 'Should fail' });

    expect(financeUpdate.status).toBe(403);

    const financeStatus = await request(app)
      .patch(`/api/v1/shipments/${shipmentFourId}/status`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ status: 'CANCELLED' });

    expect(financeStatus.status).toBe(403);

    const opsCreate = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        carrier: 'Ops carrier',
        items: [{ purchaseOrderItemId: itemCId, quantity: 5 }],
      });

    expect(opsCreate.status).toBe(201);
    expect(opsCreate.body.data.createdById).toBe(opsUserId);
    shipmentSixId = opsCreate.body.data.id;

    const opsUpdate = await request(app)
      .patch(`/api/v1/shipments/${shipmentSixId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Ops updated' });

    expect(opsUpdate.status).toBe(200);
    expect(opsUpdate.body.data.notes).toBe('Ops updated');

    const opsStatus = await request(app)
      .patch(`/api/v1/shipments/${shipmentSixId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PREPARING' });

    expect(opsStatus.status).toBe(200);
    expect(opsStatus.body.data.status).toBe('PREPARING');

    const adminCreate = await request(app)
      .post('/api/v1/shipments')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        carrier: 'Admin carrier',
        items: [{ purchaseOrderItemId: itemCId, quantity: 1 }],
      });

    expect(adminCreate.status).toBe(201);
    expect(adminCreate.body.data.createdById).toBe(adminId);
    shipmentSevenId = adminCreate.body.data.id;

    const adminUpdate = await request(app)
      .patch(`/api/v1/shipments/${shipmentSevenId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Admin updated' });

    expect(adminUpdate.status).toBe(200);
    expect(adminUpdate.body.data.notes).toBe('Admin updated');

    const adminStatus = await request(app)
      .patch(`/api/v1/shipments/${shipmentSevenId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'PREPARING' });

    expect(adminStatus.status).toBe(200);

    const adminList = await request(app)
      .get('/api/v1/shipments')
      .set('Authorization', bearer(adminAccessToken));

    expect(adminList.status).toBe(200);
    expect(adminList.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([shipmentOneId, shipmentTwoId, shipmentThreeId, shipmentFourId]),
    );

    const adminDelete = await request(app)
      .delete(`/api/v1/shipments/${shipmentSevenId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminDelete.status).toBe(404);

    const opsDelete = await request(app)
      .delete(`/api/v1/shipments/${shipmentSevenId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsDelete.status).toBe(404);

    const missingGet = await request(app)
      .get('/api/v1/shipments/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missingGet.status).toBe(404);

    const missingUpdate = await request(app)
      .patch('/api/v1/shipments/does-not-exist')
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Missing' });

    expect(missingUpdate.status).toBe(404);

    const missingStatus = await request(app)
      .patch('/api/v1/shipments/does-not-exist/status')
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'CANCELLED' });

    expect(missingStatus.status).toBe(404);
  });
});
