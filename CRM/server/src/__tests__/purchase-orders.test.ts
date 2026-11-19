import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.purchase-orders.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const salesEmail = `test.purchase-orders.sales.${unique}@example.com`;
const salesPassword = 'SalesPass123!';
const financeEmail = `test.purchase-orders.finance.${unique}@example.com`;
const financePassword = 'FinancePass123!';
const opsEmail = `test.purchase-orders.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const portalEmail = `test.purchase-orders.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';

const primaryCustomerName = `Purchase Orders Primary ${unique}`;
const secondaryCustomerName = `Purchase Orders Secondary ${unique}`;
const primarySupplierName = `Purchase Orders Primary Supplier ${unique}`;
const alternateSupplierName = `Purchase Orders Alternate Supplier ${unique}`;
const thirdSupplierName = `Purchase Orders Third Supplier ${unique}`;
const inactiveSupplierName = `Purchase Orders Inactive Supplier ${unique}`;
const primaryRequestTitle = `Primary purchase order request ${unique}`;
const secondaryRequestTitle = `Secondary purchase order request ${unique}`;

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
let primarySupplierId: string;
let alternateSupplierId: string;
let thirdSupplierId: string;
let inactiveSupplierId: string;
let primaryRequestId: string;
let secondaryRequestId: string;
let primaryQuotationId: string;
let primaryQuotationNumber: string;
let secondaryQuotationId: string;
let draftQuotationId: string;
let primaryPurchaseOrderId: string;
let primaryPurchaseOrderNumber: string;
let secondaryPurchaseOrderId: string;
let deletePurchaseOrderId: string;
let deletePurchaseOrderNumber: string;
let pendingCancelPurchaseOrderId: string;
let approvedCancelPurchaseOrderId: string;
let recreatedPurchaseOrderId: string;
let financeDraftPurchaseOrderId: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

let counter = 0;

const createProductRequest = async (customerId: string, title: string) => {
  counter += 1;

  return prisma.productRequest.create({
    data: {
      requestNumber: `PR-PO-TEST-${unique}-${counter}`,
      customerId,
      title,
      status: 'APPROVED',
      createdById: adminId,
    },
  });
};

const createQuotation = async (input: {
  productRequestId: string;
  customerId: string;
  status: 'DRAFT' | 'APPROVED';
  currency: string;
  unitPrice: number;
  quantity: number;
}) => {
  counter += 1;
  const subtotal = input.unitPrice * input.quantity;

  return prisma.quotation.create({
    data: {
      quotationNumber: `QT-PO-TEST-${unique}-${counter}`,
      productRequestId: input.productRequestId,
      customerId: input.customerId,
      status: input.status,
      currency: input.currency,
      serviceFeeRate: 0,
      subtotal,
      serviceFee: 0,
      shippingFee: 0,
      tax: 0,
      total: subtotal,
      createdById: adminId,
      approvedById: input.status === 'APPROVED' ? adminId : null,
      approvedAt: input.status === 'APPROVED' ? new Date() : null,
      items: {
        create: [
          {
            name: 'Quotation item',
            quantity: input.quantity,
            unitPrice: input.unitPrice,
          },
        ],
      },
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

  const [primaryCustomer, secondaryCustomer] = await Promise.all([
    prisma.customer.create({ data: { name: primaryCustomerName } }),
    prisma.customer.create({ data: { name: secondaryCustomerName } }),
  ]);
  primaryCustomerId = primaryCustomer.id;
  secondaryCustomerId = secondaryCustomer.id;

  const [primarySupplier, alternateSupplier, thirdSupplier, inactiveSupplier] = await Promise.all([
    prisma.supplier.create({ data: { name: primarySupplierName } }),
    prisma.supplier.create({ data: { name: alternateSupplierName } }),
    prisma.supplier.create({ data: { name: thirdSupplierName } }),
    prisma.supplier.create({ data: { name: inactiveSupplierName, status: 'INACTIVE' } }),
  ]);
  primarySupplierId = primarySupplier.id;
  alternateSupplierId = alternateSupplier.id;
  thirdSupplierId = thirdSupplier.id;
  inactiveSupplierId = inactiveSupplier.id;

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

  const primaryQuotation = await createQuotation({
    productRequestId: primaryRequestId,
    customerId: primaryCustomerId,
    status: 'APPROVED',
    currency: 'USD',
    unitPrice: 10,
    quantity: 10,
  });
  primaryQuotationId = primaryQuotation.id;
  primaryQuotationNumber = primaryQuotation.quotationNumber;

  const secondaryQuotation = await createQuotation({
    productRequestId: secondaryRequestId,
    customerId: secondaryCustomerId,
    status: 'APPROVED',
    currency: 'EUR',
    unitPrice: 15,
    quantity: 1,
  });
  secondaryQuotationId = secondaryQuotation.id;

  const draftQuotation = await createQuotation({
    productRequestId: primaryRequestId,
    customerId: primaryCustomerId,
    status: 'DRAFT',
    currency: 'USD',
    unitPrice: 10,
    quantity: 1,
  });
  draftQuotationId = draftQuotation.id;

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
  const supplierIds = [
    primarySupplierId,
    alternateSupplierId,
    thirdSupplierId,
    inactiveSupplierId,
  ].filter((id): id is string => Boolean(id));
  const productRequestIds = [primaryRequestId, secondaryRequestId].filter((id): id is string =>
    Boolean(id),
  );
  const quotationIds = [primaryQuotationId, secondaryQuotationId, draftQuotationId].filter(
    (id): id is string => Boolean(id),
  );
  const purchaseOrderIds = [
    primaryPurchaseOrderId,
    secondaryPurchaseOrderId,
    deletePurchaseOrderId,
    pendingCancelPurchaseOrderId,
    approvedCancelPurchaseOrderId,
    recreatedPurchaseOrderId,
    financeDraftPurchaseOrderId,
  ].filter((id): id is string => Boolean(id));

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        {
          resourceId: {
            in: [
              ...purchaseOrderIds,
              ...quotationIds,
              ...productRequestIds,
              ...supplierIds,
              ...customerIds,
            ],
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
  await prisma.purchaseOrder.deleteMany({ where: { id: { in: purchaseOrderIds } } });
  await prisma.quotation.deleteMany({ where: { id: { in: quotationIds } } });
  await prisma.productRequest.deleteMany({ where: { id: { in: productRequestIds } } });
  await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('purchase-orders module', () => {
  it('requires authentication and validates purchase order payloads', async () => {
    const unauthenticated = await request(app).get('/api/v1/purchase-orders');
    expect(unauthenticated.status).toBe(401);

    const missingFields = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [{ name: 'Item', quantity: 1, unitCost: 10 }] });

    expect(missingFields.status).toBe(400);
    expect(missingFields.body.message).toBe('Validation failed');

    const emptyItems = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: primarySupplierId,
        items: [],
      });

    expect(emptyItems.status).toBe(400);

    const zeroQuantity = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: primarySupplierId,
        items: [{ name: 'Item', quantity: 0, unitCost: 10 }],
      });

    expect(zeroQuantity.status).toBe(400);

    const negativeUnitCost = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: primarySupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: -1 }],
      });

    expect(negativeUnitCost.status).toBe(400);

    const invalidDate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: primarySupplierId,
        expectedDeliveryDate: 'not-a-date',
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(invalidDate.status).toBe(400);

    const missingQuotation = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: 'does-not-exist',
        supplierId: primarySupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(missingQuotation.status).toBe(404);
    expect(missingQuotation.body.message).toBe('Quotation not found');

    const draftQuotation = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: draftQuotationId,
        supplierId: primarySupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(draftQuotation.status).toBe(400);
    expect(draftQuotation.body.message).toBe(
      'Quotation must be approved before creating a purchase order',
    );

    const inactiveSupplier = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: inactiveSupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(inactiveSupplier.status).toBe(400);
    expect(inactiveSupplier.body.message).toBe('Supplier is not active');

    const missingSupplier = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: 'does-not-exist',
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(missingSupplier.status).toBe(400);
    expect(missingSupplier.body.message).toBe('Supplier not found');
  });

  it('creates purchase orders from approved quotations and calculates totals', async () => {
    const response = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: primarySupplierId,
        shippingFee: 20,
        tax: 5.5,
        expectedDeliveryDate: '2027-02-01T00:00:00.000Z',
        notes: 'Initial purchase order',
        items: [
          { name: 'Widget A', description: 'Red widget', quantity: 10, unitCost: 8.25 },
          { name: 'Widget B', quantity: 3, unitCost: 100, notes: 'Blue widget' },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      quotationId: primaryQuotationId,
      customerId: primaryCustomerId,
      supplierId: primarySupplierId,
      status: 'DRAFT',
      currency: 'USD',
      createdById: opsUserId,
      notes: 'Initial purchase order',
    });
    expect(response.body.data.orderNumber).toMatch(/^PO-\d+-[A-F0-9]{8}$/);
    expect(response.body.data.expectedDeliveryDate).toBe('2027-02-01T00:00:00.000Z');
    expect(response.body.data.submittedAt).toBeNull();
    expect(response.body.data.approvedAt).toBeNull();
    expect(Number(response.body.data.subtotal)).toBe(382.5);
    expect(Number(response.body.data.shippingFee)).toBe(20);
    expect(Number(response.body.data.tax)).toBe(5.5);
    expect(Number(response.body.data.total)).toBe(408);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data._count.items).toBe(2);
    expect(response.body.data.quotation).toMatchObject({
      id: primaryQuotationId,
      status: 'APPROVED',
    });
    expect(response.body.data.customer).toMatchObject({ id: primaryCustomerId });
    expect(response.body.data.supplier).toMatchObject({ id: primarySupplierId });
    expect(response.body.data.createdBy).toMatchObject({ id: opsUserId });

    const itemTotals = response.body.data.items.map((item: { total: string | number }) =>
      Number(item.total),
    );
    expect(itemTotals).toEqual(expect.arrayContaining([82.5, 300]));

    primaryPurchaseOrderId = response.body.data.id;
    primaryPurchaseOrderNumber = response.body.data.orderNumber;

    const duplicate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: primarySupplierId,
        items: [{ name: 'Duplicate', quantity: 1, unitCost: 10 }],
      });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.message).toBe(
      'A purchase order already exists for this supplier and quotation',
    );

    const salesCreate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: thirdSupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(salesCreate.status).toBe(403);

    const financeCreate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: thirdSupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(financeCreate.status).toBe(403);

    const customerCreate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(portalAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: thirdSupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(customerCreate.status).toBe(403);

    const adminCreate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: thirdSupplierId,
        items: [{ name: 'Delete item', quantity: 1, unitCost: 10 }],
      });

    expect(adminCreate.status).toBe(201);
    expect(adminCreate.body.data.customerId).toBe(primaryCustomerId);
    expect(adminCreate.body.data.supplierId).toBe(thirdSupplierId);
    deletePurchaseOrderId = adminCreate.body.data.id;
    deletePurchaseOrderNumber = adminCreate.body.data.orderNumber;

    const secondary = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: secondaryQuotationId,
        supplierId: alternateSupplierId,
        items: [{ name: 'Secondary item', quantity: 2, unitCost: 5 }],
      });

    expect(secondary.status).toBe(201);
    expect(secondary.body.data.customerId).toBe(secondaryCustomerId);
    expect(secondary.body.data.currency).toBe('EUR');
    expect(Number(secondary.body.data.total)).toBe(10);
    secondaryPurchaseOrderId = secondary.body.data.id;

    const secondaryDuplicate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: secondaryQuotationId,
        supplierId: alternateSupplierId,
        items: [{ name: 'Duplicate', quantity: 1, unitCost: 10 }],
      });

    expect(secondaryDuplicate.status).toBe(409);
  });

  it('lists purchase orders with filters, search, sorting, and pagination', async () => {
    const byNumber = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ search: primaryPurchaseOrderNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byNumber.status).toBe(200);
    expect(byNumber.body.data).toHaveLength(1);
    expect(byNumber.body.data[0].id).toBe(primaryPurchaseOrderId);
    expect(byNumber.body.data[0]._count.items).toBe(2);

    const drafts = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ status: 'DRAFT', search: 'Purchase Orders' })
      .set('Authorization', bearer(adminAccessToken));

    expect(drafts.status).toBe(200);
    expect(drafts.body.meta.total).toBe(3);

    const byCustomer = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ customerId: secondaryCustomerId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCustomer.status).toBe(200);
    expect(byCustomer.body.data).toHaveLength(1);
    expect(byCustomer.body.data[0].id).toBe(secondaryPurchaseOrderId);

    const bySupplier = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ supplierId: primarySupplierId })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySupplier.status).toBe(200);
    expect(bySupplier.body.data).toHaveLength(1);
    expect(bySupplier.body.data[0].id).toBe(primaryPurchaseOrderId);

    const byQuotation = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ quotationId: primaryQuotationId })
      .set('Authorization', bearer(adminAccessToken));

    expect(byQuotation.status).toBe(200);
    expect(byQuotation.body.meta.total).toBe(2);
    expect(byQuotation.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([primaryPurchaseOrderId, deletePurchaseOrderId]),
    );

    const bySupplierName = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ search: thirdSupplierName })
      .set('Authorization', bearer(adminAccessToken));

    expect(bySupplierName.status).toBe(200);
    expect(bySupplierName.body.data).toHaveLength(1);
    expect(bySupplierName.body.data[0].id).toBe(deletePurchaseOrderId);

    const byCustomerName = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ search: primaryCustomerName })
      .set('Authorization', bearer(adminAccessToken));

    expect(byCustomerName.status).toBe(200);
    expect(byCustomerName.body.meta.total).toBe(2);

    const byQuotationNumber = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ search: primaryQuotationNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(byQuotationNumber.status).toBe(200);
    expect(byQuotationNumber.body.meta.total).toBe(2);

    const sorted = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ search: 'Purchase Orders', sortBy: 'total', sortOrder: 'asc' })
      .set('Authorization', bearer(adminAccessToken));

    expect(sorted.status).toBe(200);
    expect(sorted.body.data).toHaveLength(3);
    expect(Number(sorted.body.data[0].total)).toBeLessThanOrEqual(
      Number(sorted.body.data[sorted.body.data.length - 1].total),
    );

    const paginated = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ search: 'Purchase Orders', page: 1, limit: 2 })
      .set('Authorization', bearer(adminAccessToken));

    expect(paginated.status).toBe(200);
    expect(paginated.body.data).toHaveLength(2);
    expect(paginated.body.meta).toEqual({ page: 1, limit: 2, total: 3 });

    const combined = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ status: 'DRAFT', supplierId: primarySupplierId })
      .set('Authorization', bearer(adminAccessToken));

    expect(combined.status).toBe(200);
    expect(combined.body.data).toHaveLength(1);
    expect(combined.body.data[0].id).toBe(primaryPurchaseOrderId);

    const invalidStatus = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ status: 'INVALID' })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidStatus.status).toBe(400);

    const invalidSort = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ sortBy: 'supplier' })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidSort.status).toBe(400);

    const invalidLimit = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ limit: 101 })
      .set('Authorization', bearer(adminAccessToken));

    expect(invalidLimit.status).toBe(400);
  });

  it('gets and updates a draft purchase order', async () => {
    const fetched = await request(app)
      .get(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.notes).toBe('Initial purchase order');
    expect(fetched.body.data.items).toHaveLength(2);

    const updated = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({
        supplierId: alternateSupplierId,
        shippingFee: 0,
        tax: 0,
        expectedDeliveryDate: null,
        notes: '',
        items: [{ name: 'Updated item', quantity: 2, unitCost: 50 }],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.supplierId).toBe(alternateSupplierId);
    expect(updated.body.data.notes).toBeNull();
    expect(updated.body.data.expectedDeliveryDate).toBeNull();
    expect(updated.body.data.items).toHaveLength(1);
    expect(Number(updated.body.data.subtotal)).toBe(100);
    expect(Number(updated.body.data.total)).toBe(100);

    const restored = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({
        supplierId: primarySupplierId,
        shippingFee: 20,
        tax: 5.5,
        expectedDeliveryDate: '2027-03-01T00:00:00.000Z',
        notes: 'Updated purchase order',
        items: [
          { name: 'Widget A', quantity: 10, unitCost: 8.25 },
          { name: 'Widget B', quantity: 3, unitCost: 100 },
        ],
      });

    expect(restored.status).toBe(200);
    expect(restored.body.data.supplierId).toBe(primarySupplierId);
    expect(restored.body.data.notes).toBe('Updated purchase order');
    expect(restored.body.data.expectedDeliveryDate).toBe('2027-03-01T00:00:00.000Z');
    expect(restored.body.data.items).toHaveLength(2);
    expect(Number(restored.body.data.subtotal)).toBe(382.5);
    expect(Number(restored.body.data.total)).toBe(408);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);

    const emptyItems = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ items: [] });

    expect(emptyItems.status).toBe(400);

    const invalidDate = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ expectedDeliveryDate: 'not-a-date' });

    expect(invalidDate.status).toBe(400);

    const missing = await request(app)
      .patch('/api/v1/purchase-orders/does-not-exist')
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Missing' });

    expect(missing.status).toBe(404);

    const inactiveSupplier = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ supplierId: inactiveSupplierId });

    expect(inactiveSupplier.status).toBe(400);
    expect(inactiveSupplier.body.message).toBe('Supplier is not active');

    const duplicateSupplier = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ supplierId: thirdSupplierId });

    expect(duplicateSupplier.status).toBe(409);
    expect(duplicateSupplier.body.message).toBe(
      'A purchase order already exists for this supplier and quotation',
    );

    const stillPrimary = await request(app)
      .get(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(stillPrimary.status).toBe(200);
    expect(stillPrimary.body.data.supplierId).toBe(primarySupplierId);
  });

  it('runs the full approval and fulfillment lifecycle', async () => {
    const submitted = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(submitted.status).toBe(200);
    expect(submitted.body.data.status).toBe('PENDING_APPROVAL');
    expect(submitted.body.data.submittedAt).not.toBeNull();

    const approveViaStatus = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'APPROVED' });

    expect(approveViaStatus.status).toBe(400);
    expect(approveViaStatus.body.message).toBe('Validation failed');

    const invalidTransition = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PRODUCTION' });

    expect(invalidTransition.status).toBe(400);

    const approved = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe('APPROVED');
    expect(approved.body.data.approvedById).toBe(financeUserId);
    expect(approved.body.data.approvedAt).not.toBeNull();

    const approvedAgain = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approvedAgain.status).toBe(200);
    expect(approvedAgain.body.data.status).toBe('APPROVED');

    const adminApprove = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminApprove.status).toBe(200);

    const opsApprove = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/approve`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsApprove.status).toBe(403);

    const salesApprove = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/approve`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesApprove.status).toBe(403);

    const customerApprove = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/approve`)
      .set('Authorization', bearer(portalAccessToken));

    expect(customerApprove.status).toBe(403);

    const inProduction = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PRODUCTION' });

    expect(inProduction.status).toBe(200);
    expect(inProduction.body.data.status).toBe('IN_PRODUCTION');
    expect(inProduction.body.data.productionStartedAt).not.toBeNull();

    const shipped = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'SHIPPED' });

    expect(shipped.status).toBe(200);
    expect(shipped.body.data.status).toBe('SHIPPED');
    expect(shipped.body.data.shippedAt).not.toBeNull();

    const completed = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'COMPLETED' });

    expect(completed.status).toBe(200);
    expect(completed.body.data.status).toBe('COMPLETED');
    expect(completed.body.data.completedAt).not.toBeNull();

    const completedAgain = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'COMPLETED' });

    expect(completedAgain.status).toBe(200);

    const cancelCompleted = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelCompleted.status).toBe(400);

    const reopenCompleted = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(reopenCompleted.status).toBe(400);

    const updateCompleted = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateCompleted.status).toBe(400);

    const deleteCompleted = await request(app)
      .delete(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteCompleted.status).toBe(400);

    const approveCompleted = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approveCompleted.status).toBe(400);
  });

  it('cancels draft, pending, and approved purchase orders', async () => {
    const pending = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: alternateSupplierId,
        items: [{ name: 'Pending cancel', quantity: 1, unitCost: 12 }],
      });

    expect(pending.status).toBe(201);
    pendingCancelPurchaseOrderId = pending.body.data.id;

    const submitted = await request(app)
      .patch(`/api/v1/purchase-orders/${pendingCancelPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(submitted.status).toBe(200);

    const cancelled = await request(app)
      .patch(`/api/v1/purchase-orders/${pendingCancelPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('CANCELLED');

    const reopenCancelled = await request(app)
      .patch(`/api/v1/purchase-orders/${pendingCancelPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(reopenCancelled.status).toBe(400);

    const approveCancelled = await request(app)
      .patch(`/api/v1/purchase-orders/${pendingCancelPurchaseOrderId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approveCancelled.status).toBe(400);

    const cancelDraft = await request(app)
      .patch(`/api/v1/purchase-orders/${secondaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelDraft.status).toBe(200);
    expect(cancelDraft.body.data.status).toBe('CANCELLED');

    const submitCancelledDraft = await request(app)
      .patch(`/api/v1/purchase-orders/${secondaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(submitCancelledDraft.status).toBe(400);

    const approvedCancel = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: secondaryQuotationId,
        supplierId: primarySupplierId,
        items: [{ name: 'Approved cancel', quantity: 1, unitCost: 13 }],
      });

    expect(approvedCancel.status).toBe(201);
    approvedCancelPurchaseOrderId = approvedCancel.body.data.id;

    const submitApprovedCancel = await request(app)
      .patch(`/api/v1/purchase-orders/${approvedCancelPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(submitApprovedCancel.status).toBe(200);

    const approved = await request(app)
      .patch(`/api/v1/purchase-orders/${approvedCancelPurchaseOrderId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe('APPROVED');

    const updateApproved = await request(app)
      .patch(`/api/v1/purchase-orders/${approvedCancelPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Should fail' });

    expect(updateApproved.status).toBe(400);

    const deleteApproved = await request(app)
      .delete(`/api/v1/purchase-orders/${approvedCancelPurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteApproved.status).toBe(400);

    const cancelApproved = await request(app)
      .patch(`/api/v1/purchase-orders/${approvedCancelPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelApproved.status).toBe(200);
    expect(cancelApproved.body.data.status).toBe('CANCELLED');

    const approveApprovedCancel = await request(app)
      .patch(`/api/v1/purchase-orders/${approvedCancelPurchaseOrderId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(approveApprovedCancel.status).toBe(400);

    const produceCancelled = await request(app)
      .patch(`/api/v1/purchase-orders/${approvedCancelPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'IN_PRODUCTION' });

    expect(produceCancelled.status).toBe(400);
  });

  it('soft deletes draft purchase orders and enforces uniqueness on updates', async () => {
    const duplicateSupplier = await request(app)
      .patch(`/api/v1/purchase-orders/${deletePurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ supplierId: alternateSupplierId });

    expect(duplicateSupplier.status).toBe(409);

    const deleted = await request(app)
      .delete(`/api/v1/purchase-orders/${deletePurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleted.status).toBe(200);

    const fetched = await request(app)
      .get(`/api/v1/purchase-orders/${deletePurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(404);

    const list = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ search: deletePurchaseOrderNumber })
      .set('Authorization', bearer(adminAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(0);

    const stored = await prisma.purchaseOrder.findUniqueOrThrow({
      where: { id: deletePurchaseOrderId },
    });

    expect(stored.deletedAt).not.toBeNull();

    const recreated = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: thirdSupplierId,
        items: [{ name: 'Recreated', quantity: 1, unitCost: 14 }],
      });

    expect(recreated.status).toBe(201);
    recreatedPurchaseOrderId = recreated.body.data.id;

    const opsDelete = await request(app)
      .delete(`/api/v1/purchase-orders/${recreatedPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsDelete.status).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/v1/purchase-orders/${recreatedPurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminDelete.status).toBe(200);

    const deleteMissing = await request(app)
      .delete('/api/v1/purchase-orders/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteMissing.status).toBe(404);

    const deleteNonDraft = await request(app)
      .delete(`/api/v1/purchase-orders/${pendingCancelPurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteNonDraft.status).toBe(400);

    const duplicate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: primarySupplierId,
        items: [{ name: 'Duplicate', quantity: 1, unitCost: 10 }],
      });

    expect(duplicate.status).toBe(409);
  });

  it('scopes customers to their own purchase orders and keeps them read-only', async () => {
    const list = await request(app)
      .get('/api/v1/purchase-orders')
      .set('Authorization', bearer(portalAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);
    expect(list.body.meta.total).toBe(2);
    expect(list.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([primaryPurchaseOrderId, pendingCancelPurchaseOrderId]),
    );
    expect(list.body.data.map((item: { id: string }) => item.id)).not.toContain(
      secondaryPurchaseOrderId,
    );
    expect(list.body.data.map((item: { id: string }) => item.id)).not.toContain(
      approvedCancelPurchaseOrderId,
    );

    const own = await request(app)
      .get(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(own.status).toBe(200);

    const ownCancelled = await request(app)
      .get(`/api/v1/purchase-orders/${pendingCancelPurchaseOrderId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(ownCancelled.status).toBe(200);

    const other = await request(app)
      .get(`/api/v1/purchase-orders/${secondaryPurchaseOrderId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(other.status).toBe(404);

    const otherApproved = await request(app)
      .get(`/api/v1/purchase-orders/${approvedCancelPurchaseOrderId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(otherApproved.status).toBe(404);

    const deleted = await request(app)
      .get(`/api/v1/purchase-orders/${deletePurchaseOrderId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(deleted.status).toBe(404);

    const search = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ search: primaryPurchaseOrderNumber })
      .set('Authorization', bearer(portalAccessToken));

    expect(search.status).toBe(200);
    expect(search.body.data).toHaveLength(1);
    expect(search.body.data[0].id).toBe(primaryPurchaseOrderId);

    const completed = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ status: 'COMPLETED' })
      .set('Authorization', bearer(portalAccessToken));

    expect(completed.status).toBe(200);
    expect(completed.body.data).toHaveLength(1);
    expect(completed.body.data[0].id).toBe(primaryPurchaseOrderId);

    const otherCustomerFilter = await request(app)
      .get('/api/v1/purchase-orders')
      .query({ customerId: secondaryCustomerId })
      .set('Authorization', bearer(portalAccessToken));

    expect(otherCustomerFilter.status).toBe(200);
    expect(otherCustomerFilter.body.data).toHaveLength(0);

    const create = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(portalAccessToken))
      .send({
        quotationId: primaryQuotationId,
        supplierId: thirdSupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(create.status).toBe(403);

    const update = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ notes: 'Should fail' });

    expect(update.status).toBe(403);

    const status = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/status`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ status: 'CANCELLED' });

    expect(status.status).toBe(403);

    const approve = await request(app)
      .patch(`/api/v1/purchase-orders/${primaryPurchaseOrderId}/approve`)
      .set('Authorization', bearer(portalAccessToken));

    expect(approve.status).toBe(403);

    const remove = await request(app)
      .delete(`/api/v1/purchase-orders/${primaryPurchaseOrderId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(remove.status).toBe(403);
  });

  it('enforces finance, sales, operations, and admin permissions', async () => {
    const financeDraft = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        quotationId: secondaryQuotationId,
        supplierId: thirdSupplierId,
        items: [{ name: 'Finance draft', quantity: 1, unitCost: 15 }],
      });

    expect(financeDraft.status).toBe(201);
    financeDraftPurchaseOrderId = financeDraft.body.data.id;

    const financeList = await request(app)
      .get('/api/v1/purchase-orders')
      .set('Authorization', bearer(financeAccessToken));

    expect(financeList.status).toBe(200);
    expect(financeList.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([secondaryPurchaseOrderId, approvedCancelPurchaseOrderId]),
    );

    const financeGet = await request(app)
      .get(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeGet.status).toBe(200);

    const financeCreate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(financeAccessToken))
      .send({
        quotationId: secondaryQuotationId,
        supplierId: primarySupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(financeCreate.status).toBe(403);

    const financeUpdate = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ notes: 'Should fail' });

    expect(financeUpdate.status).toBe(403);

    const financeStatus = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}/status`)
      .set('Authorization', bearer(financeAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(financeStatus.status).toBe(403);

    const financeDelete = await request(app)
      .delete(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeDelete.status).toBe(403);

    const financeApproveDraft = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeApproveDraft.status).toBe(400);

    const salesList = await request(app)
      .get('/api/v1/purchase-orders')
      .set('Authorization', bearer(salesAccessToken));

    expect(salesList.status).toBe(200);
    expect(salesList.body.data.map((item: { id: string }) => item.id)).toContain(
      secondaryPurchaseOrderId,
    );

    const salesGet = await request(app)
      .get(`/api/v1/purchase-orders/${secondaryPurchaseOrderId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesGet.status).toBe(200);

    const salesCreate = await request(app)
      .post('/api/v1/purchase-orders')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        quotationId: secondaryQuotationId,
        supplierId: primarySupplierId,
        items: [{ name: 'Item', quantity: 1, unitCost: 10 }],
      });

    expect(salesCreate.status).toBe(403);

    const salesUpdate = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ notes: 'Should fail' });

    expect(salesUpdate.status).toBe(403);

    const salesStatus = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}/status`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(salesStatus.status).toBe(403);

    const salesApprove = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}/approve`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesApprove.status).toBe(403);

    const salesDelete = await request(app)
      .delete(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesDelete.status).toBe(403);

    const opsList = await request(app)
      .get('/api/v1/purchase-orders')
      .set('Authorization', bearer(opsAccessToken));

    expect(opsList.status).toBe(200);
    expect(opsList.body.data.map((item: { id: string }) => item.id)).toContain(
      secondaryPurchaseOrderId,
    );

    const opsGet = await request(app)
      .get(`/api/v1/purchase-orders/${secondaryPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsGet.status).toBe(200);

    const opsUpdate = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Ops updated' });

    expect(opsUpdate.status).toBe(200);
    expect(opsUpdate.body.data.notes).toBe('Ops updated');

    const adminUpdate = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Admin updated' });

    expect(adminUpdate.status).toBe(200);
    expect(adminUpdate.body.data.notes).toBe('Admin updated');

    const opsSubmit = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}/status`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'PENDING_APPROVAL' });

    expect(opsSubmit.status).toBe(200);

    const opsApprove = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}/approve`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsApprove.status).toBe(403);

    const opsDelete = await request(app)
      .delete(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsDelete.status).toBe(403);

    const financeApprove = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}/approve`)
      .set('Authorization', bearer(financeAccessToken));

    expect(financeApprove.status).toBe(200);
    expect(financeApprove.body.data.status).toBe('APPROVED');
    expect(financeApprove.body.data.approvedById).toBe(financeUserId);

    const adminApprove = await request(app)
      .patch(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}/approve`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminApprove.status).toBe(200);

    const adminList = await request(app)
      .get('/api/v1/purchase-orders')
      .set('Authorization', bearer(adminAccessToken));

    expect(adminList.status).toBe(200);
    expect(adminList.body.data.map((item: { id: string }) => item.id)).toContain(
      financeDraftPurchaseOrderId,
    );

    const adminDeleteApproved = await request(app)
      .delete(`/api/v1/purchase-orders/${financeDraftPurchaseOrderId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminDeleteApproved.status).toBe(400);

    const getMissing = await request(app)
      .get('/api/v1/purchase-orders/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(getMissing.status).toBe(404);

    const updateMissing = await request(app)
      .patch('/api/v1/purchase-orders/does-not-exist')
      .set('Authorization', bearer(adminAccessToken))
      .send({ notes: 'Missing' });

    expect(updateMissing.status).toBe(404);

    const statusMissing = await request(app)
      .patch('/api/v1/purchase-orders/does-not-exist/status')
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'CANCELLED' });

    expect(statusMissing.status).toBe(404);

    const approveMissing = await request(app)
      .patch('/api/v1/purchase-orders/does-not-exist/approve')
      .set('Authorization', bearer(financeAccessToken));

    expect(approveMissing.status).toBe(404);

    const deleteMissing = await request(app)
      .delete('/api/v1/purchase-orders/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteMissing.status).toBe(404);
  });
});
