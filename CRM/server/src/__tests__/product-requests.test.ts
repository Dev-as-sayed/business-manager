import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.requests.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const opsEmail = `test.requests.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const salesEmail = `test.requests.sales.${unique}@example.com`;
const salesPassword = 'SalesPass123!';
const portalEmail = `test.requests.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';
const secondaryPortalEmail = `test.requests.secondary.${unique}@example.com`;
const secondaryPortalPassword = 'SecondaryPass123!';

const primaryCustomerName = `Requests Primary ${unique}`;
const secondaryCustomerName = `Requests Secondary ${unique}`;
const primaryRequestTitle = `Primary request ${unique}`;
const updatedPrimaryRequestTitle = `Primary request updated ${unique}`;
const secondaryRequestTitle = `Secondary request ${unique}`;
const customerRequestTitle = `Customer request ${unique}`;
const updatedCustomerRequestTitle = `Customer request updated ${unique}`;
const salesRequestTitle = `Sales request ${unique}`;
const updatedSalesRequestTitle = `Sales request updated ${unique}`;

let adminId: string;
let opsUserId: string;
let salesUserId: string;
let portalUserId: string;
let secondaryPortalUserId: string;
let adminAccessToken: string;
let opsAccessToken: string;
let salesAccessToken: string;
let portalAccessToken: string;
let primaryCustomerId: string;
let secondaryCustomerId: string;
let primaryRequestId: string;
let secondaryRequestId: string;
let customerRequestId: string;
let salesRequestId: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

beforeAll(async () => {
  const [superAdminRole, opsRole, salesRole, customerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CHINA_OPERATIONS' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'SALES' } }),
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

  const [admin, opsUser, salesUser, portalUser, secondaryPortalUser] = await Promise.all([
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
        email: portalEmail,
        passwordHash: await bcrypt.hash(portalPassword, 10),
        firstName: 'Portal',
        lastName: 'User',
        roleId: customerRole.id,
        customerId: primaryCustomer.id,
      },
    }),
    prisma.user.create({
      data: {
        email: secondaryPortalEmail,
        passwordHash: await bcrypt.hash(secondaryPortalPassword, 10),
        firstName: 'Secondary',
        lastName: 'Portal',
        roleId: customerRole.id,
        customerId: secondaryCustomer.id,
      },
    }),
  ]);

  adminId = admin.id;
  opsUserId = opsUser.id;
  salesUserId = salesUser.id;
  portalUserId = portalUser.id;
  secondaryPortalUserId = secondaryPortalUser.id;

  const [adminLogin, opsLogin, salesLogin, portalLogin] = await Promise.all([
    login(adminEmail, adminPassword),
    login(opsEmail, opsPassword),
    login(salesEmail, salesPassword),
    login(portalEmail, portalPassword),
  ]);

  adminAccessToken = adminLogin.body.data.accessToken;
  opsAccessToken = opsLogin.body.data.accessToken;
  salesAccessToken = salesLogin.body.data.accessToken;
  portalAccessToken = portalLogin.body.data.accessToken;
});

afterAll(async () => {
  const userIds = [adminId, opsUserId, salesUserId, portalUserId, secondaryPortalUserId].filter(
    (id): id is string => Boolean(id),
  );
  const customerIds = [primaryCustomerId, secondaryCustomerId].filter((id): id is string =>
    Boolean(id),
  );
  const requestIds = [
    primaryRequestId,
    secondaryRequestId,
    customerRequestId,
    salesRequestId,
  ].filter((id): id is string => Boolean(id));

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        { resourceId: { in: [...requestIds, ...customerIds] } },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: opsEmail } },
        { metadata: { path: ['email'], equals: salesEmail } },
        { metadata: { path: ['email'], equals: portalEmail } },
        { metadata: { path: ['email'], equals: secondaryPortalEmail } },
      ],
    },
  });
  await prisma.productRequest.deleteMany({ where: { id: { in: requestIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('product requests module', () => {
  it('requires authentication', async () => {
    const response = await request(app).get('/api/v1/product-requests');

    expect(response.status).toBe(401);
  });

  it('validates product request payloads', async () => {
    const missingCustomer = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        title: 'Missing customer',
        items: [{ name: 'Item', quantity: 1 }],
      });

    expect(missingCustomer.status).toBe(400);
    expect(missingCustomer.body.message).toBe('customerId is required');

    const missingTitle = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        customerId: primaryCustomerId,
        items: [{ name: 'Item', quantity: 1 }],
      });

    expect(missingTitle.status).toBe(400);
    expect(missingTitle.body.message).toBe('Validation failed');

    const emptyItems = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        customerId: primaryCustomerId,
        title: 'Empty items',
        items: [],
      });

    expect(emptyItems.status).toBe(400);

    const invalidQuantity = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        customerId: primaryCustomerId,
        title: 'Invalid quantity',
        items: [{ name: 'Item', quantity: 0 }],
      });

    expect(invalidQuantity.status).toBe(400);

    const invalidPrice = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        customerId: primaryCustomerId,
        title: 'Invalid price',
        items: [{ name: 'Item', quantity: 1, targetPrice: -1 }],
      });

    expect(invalidPrice.status).toBe(400);
  });

  it('creates a product request as an admin and assigns an operations user', async () => {
    const response = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        customerId: primaryCustomerId,
        title: primaryRequestTitle,
        description: 'Primary request description',
        assignedUserId: opsUserId,
        items: [
          {
            name: 'Widget A',
            description: 'Red widget',
            quantity: 10,
            targetPrice: 12.5,
          },
          { name: 'Widget B', quantity: 5, notes: 'Blue widget' },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      title: primaryRequestTitle,
      status: 'DRAFT',
      customerId: primaryCustomerId,
      assignedUserId: opsUserId,
    });
    expect(response.body.data.requestNumber).toMatch(/^PR-\d+-[A-F0-9]{8}$/);
    expect(response.body.data.customer).toMatchObject({ id: primaryCustomerId });
    expect(response.body.data.assignedUser).toMatchObject({ id: opsUserId });
    expect(response.body.data.items).toHaveLength(2);
    expect(Number(response.body.data.items[0].targetPrice)).toBe(12.5);
    expect(response.body.data._count.items).toBe(2);

    primaryRequestId = response.body.data.id;
  });

  it('creates a product request for another customer as an admin', async () => {
    const response = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        customerId: secondaryCustomerId,
        title: secondaryRequestTitle,
        items: [{ name: 'Secondary item', quantity: 1 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.customerId).toBe(secondaryCustomerId);
    expect(response.body.data.assignedUserId).toBeNull();

    secondaryRequestId = response.body.data.id;
  });

  it('lists product requests with search, status filter, sorting, and pagination', async () => {
    const response = await request(app)
      .get('/api/v1/product-requests')
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
    expect(response.body.data[0].id).toBe(primaryRequestId);
    expect(response.body.data[0]._count.items).toBe(2);
    expect(response.body.data[0].customer).toMatchObject({ id: primaryCustomerId });
    expect(response.body.data[0].assignedUser).toMatchObject({ id: opsUserId });
    expect(response.body.meta).toEqual({ page: 1, limit: 10, total: 1 });
  });

  it('gets and updates a product request', async () => {
    const fetched = await request(app)
      .get(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.title).toBe(primaryRequestTitle);
    expect(fetched.body.data.items).toHaveLength(2);

    const updated = await request(app)
      .patch(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({
        title: updatedPrimaryRequestTitle,
        description: '',
        items: [{ name: 'Updated item', quantity: 5, targetPrice: 99.99 }],
      });

    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe(updatedPrimaryRequestTitle);
    expect(updated.body.data.description).toBeNull();
    expect(updated.body.data.items).toHaveLength(1);
    expect(updated.body.data.items[0]).toMatchObject({
      name: 'Updated item',
      quantity: 5,
    });
    expect(Number(updated.body.data.items[0].targetPrice)).toBe(99.99);

    const missing = await request(app)
      .get('/api/v1/product-requests/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
  });

  it('lets customers create and update their own requests and enforces scoping', async () => {
    const created = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(portalAccessToken))
      .send({
        title: customerRequestTitle,
        items: [{ name: 'Customer item', quantity: 2 }],
      });

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      customerId: primaryCustomerId,
      createdById: portalUserId,
      status: 'DRAFT',
    });
    expect(created.body.data.assignedUserId).toBeNull();

    customerRequestId = created.body.data.id;

    const otherCustomer = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(portalAccessToken))
      .send({
        customerId: secondaryCustomerId,
        title: 'Other customer request',
        items: [{ name: 'Item', quantity: 1 }],
      });

    expect(otherCustomer.status).toBe(403);

    const assign = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(portalAccessToken))
      .send({
        title: 'Customer assigned request',
        assignedUserId: opsUserId,
        items: [{ name: 'Item', quantity: 1 }],
      });

    expect(assign.status).toBe(403);

    const updated = await request(app)
      .patch(`/api/v1/product-requests/${customerRequestId}`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ title: updatedCustomerRequestTitle });

    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe(updatedCustomerRequestTitle);

    const list = await request(app)
      .get('/api/v1/product-requests')
      .set('Authorization', bearer(portalAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);
    expect(list.body.meta.total).toBe(2);
    expect(list.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([primaryRequestId, customerRequestId]),
    );

    const own = await request(app)
      .get(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(own.status).toBe(200);

    const other = await request(app)
      .get(`/api/v1/product-requests/${secondaryRequestId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(other.status).toBe(404);

    const remove = await request(app)
      .delete(`/api/v1/product-requests/${customerRequestId}`)
      .set('Authorization', bearer(portalAccessToken));

    expect(remove.status).toBe(403);
  });

  it('enforces customer status transitions', async () => {
    const statusUrl = `/api/v1/product-requests/${customerRequestId}/status`;

    const submitted = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(portalAccessToken))
      .send({ status: 'SUBMITTED' });

    expect(submitted.status).toBe(200);
    expect(submitted.body.data.status).toBe('SUBMITTED');

    const reviewing = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(portalAccessToken))
      .send({ status: 'REVIEWING' });

    expect(reviewing.status).toBe(400);

    const cancelled = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(portalAccessToken))
      .send({ status: 'CANCELLED' });

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('CANCELLED');

    const updateClosed = await request(app)
      .patch(`/api/v1/product-requests/${customerRequestId}`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ title: 'Closed request update' });

    expect(updateClosed.status).toBe(400);

    const assignClosed = await request(app)
      .patch(`/api/v1/product-requests/${customerRequestId}/assign`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ assignedUserId: opsUserId });

    expect(assignClosed.status).toBe(403);
  });

  it('scopes operations users to assigned requests and enforces status transitions', async () => {
    const list = await request(app)
      .get('/api/v1/product-requests')
      .set('Authorization', bearer(opsAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].id).toBe(primaryRequestId);
    expect(list.body.meta.total).toBe(1);

    const unassignedSecondary = await request(app)
      .get(`/api/v1/product-requests/${secondaryRequestId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(unassignedSecondary.status).toBe(404);

    const unassignedCustomer = await request(app)
      .get(`/api/v1/product-requests/${customerRequestId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(unassignedCustomer.status).toBe(404);

    const updated = await request(app)
      .patch(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ title: 'Operations updated request' });

    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe('Operations updated request');

    const assigned = await request(app)
      .patch(`/api/v1/product-requests/${primaryRequestId}/assign`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ assignedUserId: opsUserId });

    expect(assigned.status).toBe(200);
    expect(assigned.body.data.assignedUserId).toBe(opsUserId);

    const invalidAssignee = await request(app)
      .patch(`/api/v1/product-requests/${primaryRequestId}/assign`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ assignedUserId: adminId });

    expect(invalidAssignee.status).toBe(400);

    const unassigned = await request(app)
      .patch(`/api/v1/product-requests/${primaryRequestId}/assign`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ assignedUserId: '' });

    expect(unassigned.status).toBe(200);
    expect(unassigned.body.data.assignedUserId).toBeNull();

    const hiddenAfterUnassign = await request(app)
      .get(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(hiddenAfterUnassign.status).toBe(404);

    const reassigned = await request(app)
      .patch(`/api/v1/product-requests/${primaryRequestId}/assign`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ assignedUserId: opsUserId });

    expect(reassigned.status).toBe(200);
    expect(reassigned.body.data.assignedUserId).toBe(opsUserId);

    const statusUrl = `/api/v1/product-requests/${primaryRequestId}/status`;
    const submitted = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'SUBMITTED' });
    expect(submitted.status).toBe(200);

    const reviewing = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'REVIEWING' });
    expect(reviewing.status).toBe(200);

    const quoted = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'QUOTED' });
    expect(quoted.status).toBe(200);

    const approved = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'APPROVED' });
    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe('APPROVED');

    const invalidFromApproved = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(opsAccessToken))
      .send({ status: 'CANCELLED' });
    expect(invalidFromApproved.status).toBe(400);

    const updateApproved = await request(app)
      .patch(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ title: 'Approved request update' });
    expect(updateApproved.status).toBe(400);

    const assignApproved = await request(app)
      .patch(`/api/v1/product-requests/${primaryRequestId}/assign`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ assignedUserId: opsUserId });
    expect(assignApproved.status).toBe(400);

    const remove = await request(app)
      .delete(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(opsAccessToken));
    expect(remove.status).toBe(403);

    const create = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(opsAccessToken))
      .send({
        customerId: primaryCustomerId,
        title: 'Operations created request',
        items: [{ name: 'Item', quantity: 1 }],
      });
    expect(create.status).toBe(403);
  });

  it('enforces sales permissions and unscoped access', async () => {
    const created = await request(app)
      .post('/api/v1/product-requests')
      .set('Authorization', bearer(salesAccessToken))
      .send({
        customerId: primaryCustomerId,
        title: salesRequestTitle,
        items: [{ name: 'Sales item', quantity: 3, targetPrice: 7 }],
      });

    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('DRAFT');
    expect(created.body.data.assignedUserId).toBeNull();

    salesRequestId = created.body.data.id;

    const list = await request(app)
      .get('/api/v1/product-requests')
      .query({ search: salesRequestTitle })
      .set('Authorization', bearer(salesAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.meta.total).toBe(1);

    const anyRequest = await request(app)
      .get(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(anyRequest.status).toBe(200);

    const updated = await request(app)
      .patch(`/api/v1/product-requests/${salesRequestId}`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ title: updatedSalesRequestTitle });

    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe(updatedSalesRequestTitle);

    const remove = await request(app)
      .delete(`/api/v1/product-requests/${salesRequestId}`)
      .set('Authorization', bearer(salesAccessToken));

    expect(remove.status).toBe(403);

    const assigned = await request(app)
      .patch(`/api/v1/product-requests/${salesRequestId}/assign`)
      .set('Authorization', bearer(salesAccessToken))
      .send({ assignedUserId: opsUserId });

    expect(assigned.status).toBe(200);
    expect(assigned.body.data.assignedUserId).toBe(opsUserId);
  });

  it('validates assignment targets', async () => {
    const customerTarget = await request(app)
      .patch(`/api/v1/product-requests/${salesRequestId}/assign`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ assignedUserId: portalUserId });

    expect(customerTarget.status).toBe(400);

    const missingTarget = await request(app)
      .patch(`/api/v1/product-requests/${salesRequestId}/assign`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ assignedUserId: 'does-not-exist' });

    expect(missingTarget.status).toBe(400);

    const opsTarget = await request(app)
      .patch(`/api/v1/product-requests/${salesRequestId}/assign`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ assignedUserId: opsUserId });

    expect(opsTarget.status).toBe(200);
    expect(opsTarget.body.data.assignedUserId).toBe(opsUserId);

    const cleared = await request(app)
      .patch(`/api/v1/product-requests/${salesRequestId}/assign`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ assignedUserId: null });

    expect(cleared.status).toBe(200);
    expect(cleared.body.data.assignedUserId).toBeNull();
  });

  it('soft deletes product requests', async () => {
    const deleted = await request(app)
      .delete(`/api/v1/product-requests/${secondaryRequestId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleted.status).toBe(200);

    const fetched = await request(app)
      .get(`/api/v1/product-requests/${secondaryRequestId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(404);

    const list = await request(app)
      .get('/api/v1/product-requests')
      .query({ search: secondaryRequestTitle })
      .set('Authorization', bearer(adminAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(0);

    const stored = await prisma.productRequest.findUniqueOrThrow({
      where: { id: secondaryRequestId },
    });

    expect(stored.deletedAt).not.toBeNull();
    expect(stored.status).toBe('CANCELLED');

    const deleteApproved = await request(app)
      .delete(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteApproved.status).toBe(200);

    const approvedFetched = await request(app)
      .get(`/api/v1/product-requests/${primaryRequestId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(approvedFetched.status).toBe(404);
  });
});
