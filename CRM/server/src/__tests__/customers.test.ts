import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.customers.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const portalEmail = `test.customers.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';
const secondaryPortalEmail = `test.customers.secondary.${unique}@example.com`;
const secondaryPortalPassword = 'SecondaryPass123!';

const customerName = `Acme Search ${unique}`;
const updatedCustomerName = `Acme Updated ${unique}`;
const primaryCustomerName = `Primary Scope ${unique}`;
const secondaryCustomerName = `Secondary Scope ${unique}`;

let adminId: string;
let portalUserId: string;
let secondaryPortalUserId: string;
let adminAccessToken: string;
let portalAccessToken: string;
let secondaryRefreshToken: string;
let primaryCustomerId: string;
let secondaryCustomerId: string;
let createdCustomerId: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

beforeAll(async () => {
  const [superAdminRole, customerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CUSTOMER' } }),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      firstName: 'Test',
      lastName: 'Admin',
      roleId: superAdminRole.id,
    },
  });
  adminId = admin.id;

  const primaryCustomer = await prisma.customer.create({
    data: { name: primaryCustomerName },
  });
  primaryCustomerId = primaryCustomer.id;

  const secondaryCustomer = await prisma.customer.create({
    data: { name: secondaryCustomerName },
  });
  secondaryCustomerId = secondaryCustomer.id;

  const portalUser = await prisma.user.create({
    data: {
      email: portalEmail,
      passwordHash: await bcrypt.hash(portalPassword, 10),
      firstName: 'Portal',
      lastName: 'User',
      roleId: customerRole.id,
      customerId: primaryCustomer.id,
    },
  });
  portalUserId = portalUser.id;

  const secondaryPortalUser = await prisma.user.create({
    data: {
      email: secondaryPortalEmail,
      passwordHash: await bcrypt.hash(secondaryPortalPassword, 10),
      firstName: 'Secondary',
      lastName: 'Portal',
      roleId: customerRole.id,
      customerId: secondaryCustomer.id,
    },
  });
  secondaryPortalUserId = secondaryPortalUser.id;

  const adminLogin = await login(adminEmail, adminPassword);
  adminAccessToken = adminLogin.body.data.accessToken;

  const portalLogin = await login(portalEmail, portalPassword);
  portalAccessToken = portalLogin.body.data.accessToken;

  const secondaryPortalLogin = await login(secondaryPortalEmail, secondaryPortalPassword);
  secondaryRefreshToken = secondaryPortalLogin.body.data.refreshToken;
});

afterAll(async () => {
  const userIds = [adminId, portalUserId, secondaryPortalUserId].filter((id): id is string =>
    Boolean(id),
  );
  const customerIds = [primaryCustomerId, secondaryCustomerId, createdCustomerId].filter(
    (id): id is string => Boolean(id),
  );

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        { resourceId: { in: customerIds } },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: portalEmail } },
        { metadata: { path: ['email'], equals: secondaryPortalEmail } },
      ],
    },
  });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('customers module', () => {
  it('requires authentication', async () => {
    const response = await request(app).get('/api/v1/customers');

    expect(response.status).toBe(401);
  });

  it('creates a customer as an admin', async () => {
    const response = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        name: customerName,
        contactName: 'Jane Doe',
        email: `jane.${unique}@example.com`,
        phone: '+123456789',
        address: '123 Test Street',
        city: 'Testville',
        country: 'Testland',
        taxId: `TAX-${unique}`,
        notes: 'Created by integration test',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      name: customerName,
      contactName: 'Jane Doe',
      status: 'ACTIVE',
    });
    expect(response.body.data.id).toEqual(expect.any(String));

    createdCustomerId = response.body.data.id;
  });

  it('validates customer payloads', async () => {
    const missingName = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', bearer(adminAccessToken))
      .send({ email: 'not-an-email' });

    expect(missingName.status).toBe(400);
    expect(missingName.body.message).toBe('Validation failed');

    const invalidEmail = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: 'Valid Name', email: 'not-an-email' });

    expect(invalidEmail.status).toBe(400);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);
  });

  it('lists customers with search, status filter, sorting, and pagination', async () => {
    const response = await request(app)
      .get('/api/v1/customers')
      .query({
        search: 'Acme Search',
        status: 'ACTIVE',
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      })
      .set('Authorization', bearer(adminAccessToken));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(createdCustomerId);
    expect(response.body.meta).toEqual({ page: 1, limit: 10, total: 1 });
  });

  it('gets and updates a customer', async () => {
    const fetched = await request(app)
      .get(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.name).toBe(customerName);

    const updated = await request(app)
      .patch(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: updatedCustomerName, email: '', city: 'Updated City' });

    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe(updatedCustomerName);
    expect(updated.body.data.email).toBeNull();
    expect(updated.body.data.city).toBe('Updated City');

    const missing = await request(app)
      .get('/api/v1/customers/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
  });

  it('enforces customer status transitions', async () => {
    const statusUrl = `/api/v1/customers/${createdCustomerId}/status`;

    const sameStatus = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'ACTIVE' });
    expect(sameStatus.status).toBe(200);
    expect(sameStatus.body.data.status).toBe('ACTIVE');

    const blocked = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'BLOCKED' });
    expect(blocked.status).toBe(200);
    expect(blocked.body.data.status).toBe('BLOCKED');

    const invalidFromBlocked = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'ACTIVE' });
    expect(invalidFromBlocked.status).toBe(400);

    const inactive = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'INACTIVE' });
    expect(inactive.status).toBe(200);
    expect(inactive.body.data.status).toBe('INACTIVE');

    const reactivated = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'ACTIVE' });
    expect(reactivated.status).toBe(200);
    expect(reactivated.body.data.status).toBe('ACTIVE');

    const invalidStatus = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'UNKNOWN' });
    expect(invalidStatus.status).toBe(400);
  });

  it('scopes customer portal users to their own customer', async () => {
    const list = await request(app)
      .get('/api/v1/customers')
      .set('Authorization', bearer(portalAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].id).toBe(primaryCustomerId);
    expect(list.body.meta.total).toBe(1);

    const own = await request(app)
      .get(`/api/v1/customers/${primaryCustomerId}`)
      .set('Authorization', bearer(portalAccessToken));
    expect(own.status).toBe(200);

    const other = await request(app)
      .get(`/api/v1/customers/${secondaryCustomerId}`)
      .set('Authorization', bearer(portalAccessToken));
    expect(other.status).toBe(404);

    const otherCreated = await request(app)
      .get(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', bearer(portalAccessToken));
    expect(otherCreated.status).toBe(404);

    const create = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', bearer(portalAccessToken))
      .send({ name: 'Nope' });
    expect(create.status).toBe(403);

    const update = await request(app)
      .patch(`/api/v1/customers/${primaryCustomerId}`)
      .set('Authorization', bearer(portalAccessToken))
      .send({ name: 'Nope' });
    expect(update.status).toBe(403);

    const remove = await request(app)
      .delete(`/api/v1/customers/${primaryCustomerId}`)
      .set('Authorization', bearer(portalAccessToken));
    expect(remove.status).toBe(403);
  });

  it('soft deletes a customer and deactivates linked portal users', async () => {
    const deleted = await request(app)
      .delete(`/api/v1/customers/${secondaryCustomerId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleted.status).toBe(200);

    const fetched = await request(app)
      .get(`/api/v1/customers/${secondaryCustomerId}`)
      .set('Authorization', bearer(adminAccessToken));
    expect(fetched.status).toBe(404);

    const list = await request(app)
      .get('/api/v1/customers')
      .query({ search: secondaryCustomerName })
      .set('Authorization', bearer(adminAccessToken));
    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(0);

    const linkedUser = await prisma.user.findUniqueOrThrow({
      where: { id: secondaryPortalUserId },
    });
    expect(linkedUser.status).toBe('INACTIVE');

    const deletedCustomer = await prisma.customer.findUniqueOrThrow({
      where: { id: secondaryCustomerId },
    });
    expect(deletedCustomer.deletedAt).not.toBeNull();
    expect(deletedCustomer.status).toBe('INACTIVE');

    const refresh = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: secondaryRefreshToken });
    expect(refresh.status).toBe(401);
  });
});
