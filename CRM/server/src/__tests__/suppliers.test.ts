import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.suppliers.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const opsEmail = `test.suppliers.ops.${unique}@example.com`;
const opsPassword = 'OpsPass123!';
const supplierName = `Supplier Search ${unique}`;
const updatedSupplierName = `Supplier Updated ${unique}`;
const opsSupplierName = `Supplier Ops ${unique}`;

let adminId: string;
let opsUserId: string;
let adminAccessToken: string;
let opsAccessToken: string;
let supplierId: string;
let opsSupplierId: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

beforeAll(async () => {
  const [superAdminRole, opsRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CHINA_OPERATIONS' } }),
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

  const adminLogin = await login(adminEmail, adminPassword);
  adminAccessToken = adminLogin.body.data.accessToken;

  const opsUser = await request(app)
    .post('/api/v1/users')
    .set('Authorization', bearer(adminAccessToken))
    .send({
      email: opsEmail,
      password: opsPassword,
      firstName: 'Ops',
      lastName: 'User',
      roleId: opsRole.id,
    });

  expect(opsUser.status).toBe(201);
  expect(opsUser.body.data.role.name).toBe('CHINA_OPERATIONS');
  opsUserId = opsUser.body.data.id;

  const opsLogin = await login(opsEmail, opsPassword);
  opsAccessToken = opsLogin.body.data.accessToken;
});

afterAll(async () => {
  const userIds = [adminId, opsUserId].filter((id): id is string => Boolean(id));
  const supplierIds = [supplierId, opsSupplierId].filter((id): id is string => Boolean(id));

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        { resourceId: { in: [...userIds, ...supplierIds] } },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: opsEmail } },
      ],
    },
  });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
  await prisma.$disconnect();
});

describe('suppliers module', () => {
  it('requires authentication', async () => {
    const response = await request(app).get('/api/v1/suppliers');

    expect(response.status).toBe(401);
  });

  it('creates a supplier as an admin', async () => {
    const response = await request(app)
      .post('/api/v1/suppliers')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        name: supplierName,
        contactName: 'Jane Supplier',
        email: `jane.${unique}@example.com`,
        phone: '+123456789',
        address: '123 Supplier Street',
        city: 'Supplier City',
        country: 'Supplier Land',
        taxId: `SUP-${unique}`,
        notes: 'Created by integration test',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: supplierName,
      contactName: 'Jane Supplier',
      status: 'ACTIVE',
    });
    expect(response.body.data.id).toEqual(expect.any(String));

    supplierId = response.body.data.id;
  });

  it('validates supplier payloads', async () => {
    const missingName = await request(app)
      .post('/api/v1/suppliers')
      .set('Authorization', bearer(adminAccessToken))
      .send({ email: 'not-an-email' });

    expect(missingName.status).toBe(400);
    expect(missingName.body.message).toBe('Validation failed');

    const invalidEmail = await request(app)
      .post('/api/v1/suppliers')
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: 'Valid Name', email: 'not-an-email' });

    expect(invalidEmail.status).toBe(400);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/suppliers/${supplierId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);
  });

  it('lists suppliers with search, status filter, sorting, and pagination', async () => {
    const response = await request(app)
      .get('/api/v1/suppliers')
      .query({
        search: 'Supplier Search',
        status: 'ACTIVE',
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      })
      .set('Authorization', bearer(adminAccessToken));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(supplierId);
    expect(response.body.meta).toEqual({ page: 1, limit: 10, total: 1 });
  });

  it('gets and updates a supplier', async () => {
    const fetched = await request(app)
      .get(`/api/v1/suppliers/${supplierId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.name).toBe(supplierName);

    const updated = await request(app)
      .patch(`/api/v1/suppliers/${supplierId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: updatedSupplierName, email: '', city: 'Updated City' });

    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe(updatedSupplierName);
    expect(updated.body.data.email).toBeNull();
    expect(updated.body.data.city).toBe('Updated City');

    const missing = await request(app)
      .get('/api/v1/suppliers/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
  });

  it('enforces supplier status transitions', async () => {
    const statusUrl = `/api/v1/suppliers/${supplierId}/status`;

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

  it('enforces supplier permissions for operations users', async () => {
    const created = await request(app)
      .post('/api/v1/suppliers')
      .set('Authorization', bearer(opsAccessToken))
      .send({ name: opsSupplierName, city: 'Ops City' });

    expect(created.status).toBe(201);
    opsSupplierId = created.body.data.id;

    const fetched = await request(app)
      .get(`/api/v1/suppliers/${opsSupplierId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(fetched.status).toBe(200);

    const updated = await request(app)
      .patch(`/api/v1/suppliers/${opsSupplierId}`)
      .set('Authorization', bearer(opsAccessToken))
      .send({ notes: 'Updated by operations' });

    expect(updated.status).toBe(200);
    expect(updated.body.data.notes).toBe('Updated by operations');

    const list = await request(app)
      .get('/api/v1/suppliers')
      .query({ search: opsSupplierName })
      .set('Authorization', bearer(opsAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(1);

    const deleteOpsSupplier = await request(app)
      .delete(`/api/v1/suppliers/${opsSupplierId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(deleteOpsSupplier.status).toBe(403);

    const deleteAdminSupplier = await request(app)
      .delete(`/api/v1/suppliers/${supplierId}`)
      .set('Authorization', bearer(opsAccessToken));

    expect(deleteAdminSupplier.status).toBe(403);

    const users = await request(app)
      .get('/api/v1/users')
      .set('Authorization', bearer(opsAccessToken));

    expect(users.status).toBe(403);

    const adminDelete = await request(app)
      .delete(`/api/v1/suppliers/${opsSupplierId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(adminDelete.status).toBe(200);

    const missing = await request(app)
      .get(`/api/v1/suppliers/${opsSupplierId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
  });

  it('soft deletes a supplier', async () => {
    const deleted = await request(app)
      .delete(`/api/v1/suppliers/${supplierId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleted.status).toBe(200);

    const fetched = await request(app)
      .get(`/api/v1/suppliers/${supplierId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(404);

    const list = await request(app)
      .get('/api/v1/suppliers')
      .query({ search: updatedSupplierName })
      .set('Authorization', bearer(adminAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(0);
  });
});
