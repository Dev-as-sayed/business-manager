import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const storageMock = vi.hoisted(() => ({
  upload: vi.fn(),
  delete: vi.fn(),
  getSignedUrl: vi.fn(),
}));

vi.mock('@/shared/services/storage/storage.service', () => ({
  storage: storageMock,
}));

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.attachments.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const opsEmail = `test.attachments.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const financeEmail = `test.attachments.finance.${unique}@example.com`;
const financePassword = 'FinancePass123!';
const salesEmail = `test.attachments.sales.${unique}@example.com`;
const salesPassword = 'SalesPass123!';
const portalEmail = `test.attachments.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';

const primaryCustomerName = `Attachments Primary Customer ${unique}`;
const secondaryCustomerName = `Attachments Secondary Customer ${unique}`;
const supplierName = `Attachments Supplier ${unique}`;

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
let primaryRequestId: string;
let secondaryRequestId: string;
let primaryQuotationId: string;
let secondaryQuotationId: string;
let primaryPurchaseOrderId: string;
let secondaryPurchaseOrderId: string;
let primaryQcReportId: string;
let primaryShipmentId: string;
let secondaryShipmentId: string;
let primaryCustomsRecordId: string;
let primaryLedgerEntryId: string;

const attachmentIds: string[] = [];
let storageCounter = 0;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

let counter = 0;

const createPurchaseOrder = async (input: {
  customerId: string;
  quotationId: string;
  total: number;
}) => {
  counter += 1;

  return prisma.purchaseOrder.create({
    data: {
      orderNumber: `PO-ATTACH-TEST-${unique}-${counter}`,
      quotationId: input.quotationId,
      customerId: input.customerId,
      supplierId,
      status: 'APPROVED',
      currency: 'USD',
      subtotal: input.total,
      shippingFee: 0,
      tax: 0,
      total: input.total,
      createdById: adminId,
      approvedById: adminId,
      approvedAt: new Date(),
      items: {
        create: [
          {
            name: `Attachment item ${counter}`,
            quantity: 1,
            unitCost: input.total,
            total: input.total,
          },
        ],
      },
    },
  });
};

const uploadAttachment = async (
  token: string,
  entityType: string,
  entityId: string,
  options: { filename?: string; mimeType?: string; content?: string } = {},
) => {
  const response = await request(app)
    .post('/api/v1/attachments')
    .set('Authorization', bearer(token))
    .field('entityType', entityType)
    .field('entityId', entityId)
    .attach('file', Buffer.from(options.content ?? 'attachment-content'), {
      filename: options.filename ?? 'attachment.png',
      contentType: options.mimeType ?? 'image/png',
    });

  if (response.status === 201) {
    attachmentIds.push(response.body.data.id);
  }

  return response;
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

  const primaryRequest = await prisma.productRequest.create({
    data: {
      requestNumber: `PR-ATTACH-TEST-${unique}-1`,
      customerId: primaryCustomerId,
      title: `Attachments primary request ${unique}`,
      status: 'APPROVED',
      createdById: adminId,
    },
  });
  primaryRequestId = primaryRequest.id;

  const secondaryRequest = await prisma.productRequest.create({
    data: {
      requestNumber: `PR-ATTACH-TEST-${unique}-2`,
      customerId: secondaryCustomerId,
      title: `Attachments secondary request ${unique}`,
      status: 'APPROVED',
      createdById: adminId,
    },
  });
  secondaryRequestId = secondaryRequest.id;

  const primaryQuotation = await prisma.quotation.create({
    data: {
      quotationNumber: `QT-ATTACH-TEST-${unique}-1`,
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
      quotationNumber: `QT-ATTACH-TEST-${unique}-2`,
      productRequestId: secondaryRequestId,
      customerId: secondaryCustomerId,
      status: 'APPROVED',
      currency: 'USD',
      serviceFeeRate: 0,
      subtotal: 200,
      serviceFee: 0,
      shippingFee: 0,
      tax: 0,
      total: 200,
      createdById: adminId,
      approvedById: adminId,
      approvedAt: new Date(),
      items: {
        create: [{ name: 'Secondary quotation item', quantity: 1, unitPrice: 200 }],
      },
    },
  });
  secondaryQuotationId = secondaryQuotation.id;

  const primaryPurchaseOrder = await createPurchaseOrder({
    customerId: primaryCustomerId,
    quotationId: primaryQuotationId,
    total: 100,
  });
  primaryPurchaseOrderId = primaryPurchaseOrder.id;

  const secondaryPurchaseOrder = await createPurchaseOrder({
    customerId: secondaryCustomerId,
    quotationId: secondaryQuotationId,
    total: 200,
  });
  secondaryPurchaseOrderId = secondaryPurchaseOrder.id;

  const primaryQcReport = await prisma.qcReport.create({
    data: {
      reportNumber: `QC-ATTACH-TEST-${unique}`,
      purchaseOrderId: primaryPurchaseOrderId,
      customerId: primaryCustomerId,
      supplierId,
      inspectorId: opsUserId,
      status: 'PENDING',
      createdById: adminId,
    },
  });
  primaryQcReportId = primaryQcReport.id;

  const primaryShipment = await prisma.shipment.create({
    data: {
      shipmentNumber: `SH-ATTACH-TEST-${unique}-1`,
      customerId: primaryCustomerId,
      status: 'PENDING',
      createdById: adminId,
    },
  });
  primaryShipmentId = primaryShipment.id;

  const secondaryShipment = await prisma.shipment.create({
    data: {
      shipmentNumber: `SH-ATTACH-TEST-${unique}-2`,
      customerId: secondaryCustomerId,
      status: 'PENDING',
      createdById: adminId,
    },
  });
  secondaryShipmentId = secondaryShipment.id;

  const primaryCustomsRecord = await prisma.customsRecord.create({
    data: {
      recordNumber: `CU-ATTACH-TEST-${unique}`,
      shipmentId: primaryShipmentId,
      customerId: primaryCustomerId,
      supplierId,
      createdById: adminId,
    },
  });
  primaryCustomsRecordId = primaryCustomsRecord.id;

  const primaryLedgerEntry = await prisma.ledgerEntry.create({
    data: {
      entryNumber: `LE-ATTACH-TEST-${unique}`,
      customerId: primaryCustomerId,
      supplierId,
      type: 'REVENUE',
      amount: 100,
      amountInBaseCurrency: 100,
      createdById: adminId,
    },
  });
  primaryLedgerEntryId = primaryLedgerEntry.id;

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

beforeEach(async () => {
  await prisma.attachment.deleteMany({ where: { id: { in: attachmentIds } } });
  attachmentIds.length = 0;
  storageCounter = 0;

  storageMock.upload.mockReset();
  storageMock.delete.mockReset();
  storageMock.getSignedUrl.mockReset();

  storageMock.upload.mockImplementation(
    async (file: { originalName: string; mimeType: string }) => {
      storageCounter += 1;

      return {
        storageProvider: 'cloudinary',
        storageKey: `crm/attachments/test-${unique}-${storageCounter}`,
        resourceType: file.mimeType.startsWith('image/') ? 'image' : 'raw',
        format: file.mimeType === 'application/pdf' ? 'pdf' : null,
      };
    },
  );
  storageMock.delete.mockResolvedValue(undefined);
  storageMock.getSignedUrl.mockImplementation(
    async (file: { storageKey: string }) =>
      `https://res.cloudinary.com/test/image/authenticated/${file.storageKey}`,
  );
});

afterAll(async () => {
  const userIds = [adminId, opsUserId, financeUserId, salesUserId, portalUserId].filter(
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
  const purchaseOrderIds = [primaryPurchaseOrderId, secondaryPurchaseOrderId].filter(
    (id): id is string => Boolean(id),
  );
  const shipmentIds = [primaryShipmentId, secondaryShipmentId].filter((id): id is string =>
    Boolean(id),
  );

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        {
          resourceId: {
            in: [
              ...attachmentIds,
              primaryQcReportId,
              primaryCustomsRecordId,
              primaryLedgerEntryId,
              ...purchaseOrderIds,
              ...shipmentIds,
              ...quotationIds,
              ...productRequestIds,
              ...supplierIds,
              ...customerIds,
            ].filter((id): id is string => Boolean(id)),
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
  await prisma.attachment.deleteMany({ where: { id: { in: attachmentIds } } });
  await prisma.ledgerEntry.deleteMany({ where: { id: primaryLedgerEntryId } });
  await prisma.customsRecord.deleteMany({ where: { id: primaryCustomsRecordId } });
  await prisma.shipment.deleteMany({ where: { id: { in: shipmentIds } } });
  await prisma.qcReport.deleteMany({ where: { id: primaryQcReportId } });
  await prisma.purchaseOrder.deleteMany({ where: { id: { in: purchaseOrderIds } } });
  await prisma.quotation.deleteMany({ where: { id: { in: quotationIds } } });
  await prisma.productRequest.deleteMany({ where: { id: { in: productRequestIds } } });
  await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('attachments module', () => {
  it('requires authentication and validates upload requests', async () => {
    const unauthenticated = await request(app).get('/api/v1/attachments').query({
      entityType: 'shipment',
      entityId: primaryShipmentId,
    });

    expect(unauthenticated.status).toBe(401);

    const missingFile = await request(app)
      .post('/api/v1/attachments')
      .set('Authorization', bearer(opsAccessToken))
      .field('entityType', 'shipment')
      .field('entityId', primaryShipmentId);

    expect(missingFile.status).toBe(400);
    expect(missingFile.body.message).toBe('File is required');

    const missingEntityId = await request(app)
      .post('/api/v1/attachments')
      .set('Authorization', bearer(opsAccessToken))
      .field('entityType', 'shipment')
      .attach('file', Buffer.from('attachment-content'), {
        filename: 'attachment.png',
        contentType: 'image/png',
      });

    expect(missingEntityId.status).toBe(400);
    expect(missingEntityId.body.message).toBe('Validation failed');

    const invalidEntityType = await request(app)
      .post('/api/v1/attachments')
      .set('Authorization', bearer(opsAccessToken))
      .field('entityType', 'invoice')
      .field('entityId', primaryShipmentId)
      .attach('file', Buffer.from('attachment-content'), {
        filename: 'attachment.png',
        contentType: 'image/png',
      });

    expect(invalidEntityType.status).toBe(400);
    expect(invalidEntityType.body.message).toBe('Validation failed');

    const unsupportedFile = await request(app)
      .post('/api/v1/attachments')
      .set('Authorization', bearer(opsAccessToken))
      .field('entityType', 'shipment')
      .field('entityId', primaryShipmentId)
      .attach('file', Buffer.from('plain text'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(unsupportedFile.status).toBe(400);
    expect(unsupportedFile.body.message).toBe('Unsupported file type: text/plain');

    const missingEntity = await request(app)
      .post('/api/v1/attachments')
      .set('Authorization', bearer(opsAccessToken))
      .field('entityType', 'shipment')
      .field('entityId', 'does-not-exist')
      .attach('file', Buffer.from('attachment-content'), {
        filename: 'attachment.png',
        contentType: 'image/png',
      });

    expect(missingEntity.status).toBe(404);
    expect(missingEntity.body.message).toBe('Shipment not found');

    const salesQcUpload = await uploadAttachment(salesAccessToken, 'qc_report', primaryQcReportId);

    expect(salesQcUpload.status).toBe(403);
    expect(salesQcUpload.body.message).toBe('You do not have access to this entity type');

    const missingListEntity = await request(app)
      .get('/api/v1/attachments')
      .query({ entityType: 'shipment' })
      .set('Authorization', bearer(opsAccessToken));

    expect(missingListEntity.status).toBe(400);
    expect(storageMock.upload).not.toHaveBeenCalled();
  });

  it('uploads attachments for supported entities', async () => {
    const purchaseOrderAttachment = await uploadAttachment(
      salesAccessToken,
      'purchase_order',
      primaryPurchaseOrderId,
      { filename: 'purchase-order.pdf', mimeType: 'application/pdf', content: 'po document' },
    );

    expect(purchaseOrderAttachment.status).toBe(201);
    expect(purchaseOrderAttachment.body.data).toMatchObject({
      entityType: 'purchase_order',
      entityId: primaryPurchaseOrderId,
      originalName: 'purchase-order.pdf',
      mimeType: 'application/pdf',
      size: Buffer.byteLength('po document'),
      uploadedById: salesUserId,
    });
    expect(purchaseOrderAttachment.body.data.url).toContain(
      'https://res.cloudinary.com/test/image/authenticated/',
    );
    expect(purchaseOrderAttachment.body.data.storageKey).toBeUndefined();
    expect(storageMock.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        originalName: 'purchase-order.pdf',
        mimeType: 'application/pdf',
      }),
    );

    const qcAttachment = await uploadAttachment(opsAccessToken, 'qc_report', primaryQcReportId);
    expect(qcAttachment.status).toBe(201);
    expect(qcAttachment.body.data.uploadedById).toBe(opsUserId);

    const customsAttachment = await uploadAttachment(
      financeAccessToken,
      'customs_record',
      primaryCustomsRecordId,
    );
    expect(customsAttachment.status).toBe(201);

    const ledgerAttachment = await uploadAttachment(
      financeAccessToken,
      'ledger_entry',
      primaryLedgerEntryId,
    );
    expect(ledgerAttachment.status).toBe(201);

    const shipmentAttachment = await uploadAttachment(
      opsAccessToken,
      'shipment',
      primaryShipmentId,
    );
    expect(shipmentAttachment.status).toBe(201);

    const customerShipmentAttachment = await uploadAttachment(
      portalAccessToken,
      'shipment',
      primaryShipmentId,
    );
    expect(customerShipmentAttachment.status).toBe(201);
    expect(customerShipmentAttachment.body.data.uploadedById).toBe(portalUserId);

    const customerQuotationAttachment = await uploadAttachment(
      portalAccessToken,
      'quotation',
      primaryQuotationId,
    );
    expect(customerQuotationAttachment.status).toBe(201);

    expect(attachmentIds).toHaveLength(7);
    expect(storageMock.upload).toHaveBeenCalledTimes(7);

    const stored = await prisma.attachment.findUnique({
      where: { id: purchaseOrderAttachment.body.data.id },
    });
    expect(stored).not.toBeNull();
    expect(stored?.storageProvider).toBe('cloudinary');
  });

  it('lists attachments with entity scoping, search, and pagination', async () => {
    const first = await uploadAttachment(opsAccessToken, 'shipment', primaryShipmentId, {
      filename: 'primary-one.png',
    });
    const second = await uploadAttachment(opsAccessToken, 'shipment', primaryShipmentId, {
      filename: 'primary-two.pdf',
      mimeType: 'application/pdf',
    });
    await uploadAttachment(opsAccessToken, 'shipment', secondaryShipmentId, {
      filename: 'secondary.png',
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const customerList = await request(app)
      .get('/api/v1/attachments')
      .query({ entityType: 'shipment', entityId: primaryShipmentId })
      .set('Authorization', bearer(portalAccessToken));

    expect(customerList.status).toBe(200);
    expect(customerList.body.meta.total).toBe(2);
    expect(customerList.body.data).toHaveLength(2);
    expect(
      customerList.body.data.map((attachment: { originalName: string }) => attachment.originalName),
    ).toEqual(expect.arrayContaining(['primary-one.png', 'primary-two.pdf']));

    const customerOtherEntity = await request(app)
      .get('/api/v1/attachments')
      .query({ entityType: 'shipment', entityId: secondaryShipmentId })
      .set('Authorization', bearer(portalAccessToken));

    expect(customerOtherEntity.status).toBe(404);
    expect(customerOtherEntity.body.message).toBe('Shipment not found');

    const salesQcList = await request(app)
      .get('/api/v1/attachments')
      .query({ entityType: 'qc_report', entityId: primaryQcReportId })
      .set('Authorization', bearer(salesAccessToken));

    expect(salesQcList.status).toBe(403);
    expect(salesQcList.body.message).toBe('You do not have access to this entity type');

    const opsQcList = await request(app)
      .get('/api/v1/attachments')
      .query({ entityType: 'qc_report', entityId: primaryQcReportId })
      .set('Authorization', bearer(opsAccessToken));

    expect(opsQcList.status).toBe(200);
    expect(opsQcList.body.meta.total).toBe(0);

    const search = await request(app)
      .get('/api/v1/attachments')
      .query({
        entityType: 'shipment',
        entityId: primaryShipmentId,
        search: 'primary-two',
      })
      .set('Authorization', bearer(opsAccessToken));

    expect(search.status).toBe(200);
    expect(search.body.meta.total).toBe(1);
    expect(search.body.data[0].originalName).toBe('primary-two.pdf');

    const paginated = await request(app)
      .get('/api/v1/attachments')
      .query({ entityType: 'shipment', entityId: primaryShipmentId, limit: 1 })
      .set('Authorization', bearer(opsAccessToken));

    expect(paginated.status).toBe(200);
    expect(paginated.body.data).toHaveLength(1);
    expect(paginated.body.meta).toMatchObject({ page: 1, limit: 1, total: 2 });
  });

  it('gets and deletes attachments with permission checks', async () => {
    const uploaded = await uploadAttachment(opsAccessToken, 'shipment', primaryShipmentId, {
      filename: 'delete-me.png',
    });

    expect(uploaded.status).toBe(201);

    const attachmentId = uploaded.body.data.id as string;

    const fetched = await request(app)
      .get(`/api/v1/attachments/${attachmentId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.originalName).toBe('delete-me.png');
    expect(fetched.body.data.url).toContain('https://res.cloudinary.com/test/');

    const missing = await request(app)
      .get('/api/v1/attachments/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
    expect(missing.body.message).toBe('Attachment not found');

    const salesDelete = await request(app)
      .delete(`/api/v1/attachments/${attachmentId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(salesDelete.status).toBe(403);
    expect(salesDelete.body.message).toBe('Missing permission: attachments:delete');

    const customerDelete = await request(app)
      .delete(`/api/v1/attachments/${attachmentId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(customerDelete.status).toBe(403);

    const opsDelete = await request(app)
      .delete(`/api/v1/attachments/${attachmentId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(opsDelete.status).toBe(200);
    expect(storageMock.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        storageKey: expect.stringContaining(`crm/attachments/test-${unique}-`),
      }),
    );

    const listAfterDelete = await request(app)
      .get('/api/v1/attachments')
      .query({ entityType: 'shipment', entityId: primaryShipmentId })
      .set('Authorization', bearer(opsAccessToken));

    expect(listAfterDelete.status).toBe(200);
    expect(listAfterDelete.body.meta.total).toBe(0);

    const getAfterDelete = await request(app)
      .get(`/api/v1/attachments/${attachmentId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(getAfterDelete.status).toBe(404);

    const deleteAgain = await request(app)
      .delete(`/api/v1/attachments/${attachmentId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(deleteAgain.status).toBe(404);
  });
});
