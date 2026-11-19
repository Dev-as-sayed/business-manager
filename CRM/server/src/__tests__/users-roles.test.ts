import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.users.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const portalEmail = `test.users.portal.${unique}@example.com`;
const portalPassword = 'PortalPass123!';
const roleUserEmail = `test.users.role.${unique}@example.com`;
const roleUserPassword = 'RolePass123!';
const customerName = `Users Test Customer ${unique}`;
const roleName = `TEST_ROLE_${unique.toUpperCase()}`;
const renamedRoleName = `TEST_ROLE_RENAMED_${unique.toUpperCase()}`;
const unknownRoleName = `UNKNOWN_ROLE_${unique.toUpperCase()}`;
const invalidPermissionRoleName = `INVALID_PERM_ROLE_${unique.toUpperCase()}`;

let adminId: string;
let portalUserId: string;
let roleUserId: string;
let customRoleId: string;
let customerId: string;
let superAdminRoleId: string;
let customerRoleId: string;
let adminAccessToken: string;
let portalAccessToken: string;
let portalRefreshToken: string;

const bearer = (token: string) => `Bearer ${token}`;

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

beforeAll(async () => {
  const [superAdminRole, customerRole] = await Promise.all([
    prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } }),
    prisma.role.findUniqueOrThrow({ where: { name: 'CUSTOMER' } }),
  ]);
  superAdminRoleId = superAdminRole.id;
  customerRoleId = customerRole.id;

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

  const customer = await prisma.customer.create({ data: { name: customerName } });
  customerId = customer.id;

  const adminLogin = await login(adminEmail, adminPassword);
  adminAccessToken = adminLogin.body.data.accessToken;
});

afterAll(async () => {
  const userIds = [adminId, portalUserId, roleUserId].filter((id): id is string => Boolean(id));
  const roleIds = [customRoleId].filter((id): id is string => Boolean(id));
  const customerIds = [customerId].filter((id): id is string => Boolean(id));

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        { resourceId: { in: [...userIds, ...roleIds, ...customerIds] } },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: portalEmail } },
        { metadata: { path: ['email'], equals: roleUserEmail } },
      ],
    },
  });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.role.deleteMany({ where: { id: { in: roleIds } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  await prisma.$disconnect();
});

describe('users and roles modules', () => {
  it('requires authentication', async () => {
    const users = await request(app).get('/api/v1/users');
    const roles = await request(app).get('/api/v1/roles');

    expect(users.status).toBe(401);
    expect(roles.status).toBe(401);
  });

  it('lists available permissions', async () => {
    const response = await request(app)
      .get('/api/v1/roles/permissions')
      .set('Authorization', bearer(adminAccessToken));

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(72);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: 'users:read' })]),
    );
  });

  it('creates a custom role', async () => {
    const response = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: roleName, description: 'Test role', permissions: ['customers:read'] });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: roleName,
      description: 'Test role',
      isSystem: false,
      userCount: 0,
      permissions: ['customers:read'],
    });

    customRoleId = response.body.data.id;

    const duplicate = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: roleName });

    expect(duplicate.status).toBe(409);

    const unknownPermission = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: unknownRoleName, permissions: ['unknown:read'] });

    expect(unknownPermission.status).toBe(400);

    const invalidPermissionFormat = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: invalidPermissionRoleName, permissions: ['customers'] });

    expect(invalidPermissionFormat.status).toBe(400);
  });

  it('lists, gets, and updates roles', async () => {
    const list = await request(app)
      .get('/api/v1/roles')
      .query({ search: roleName })
      .set('Authorization', bearer(adminAccessToken));

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].id).toBe(customRoleId);
    expect(list.body.meta.total).toBe(1);

    const fetched = await request(app)
      .get(`/api/v1/roles/${customRoleId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.userCount).toBe(0);

    const updated = await request(app)
      .patch(`/api/v1/roles/${customRoleId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ description: 'Updated role', permissions: ['customers:read', 'customers:create'] });

    expect(updated.status).toBe(200);
    expect(updated.body.data.description).toBe('Updated role');
    expect(updated.body.data.permissions).toEqual(['customers:create', 'customers:read']);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/roles/${customRoleId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);

    const missing = await request(app)
      .get('/api/v1/roles/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);

    const renameSystemRole = await request(app)
      .patch(`/api/v1/roles/${superAdminRoleId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ name: renamedRoleName });

    expect(renameSystemRole.status).toBe(400);

    const updateSystemPermissions = await request(app)
      .patch(`/api/v1/roles/${superAdminRoleId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ permissions: ['users:read'] });

    expect(updateSystemPermissions.status).toBe(400);

    const deleteSystemRole = await request(app)
      .delete(`/api/v1/roles/${superAdminRoleId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleteSystemRole.status).toBe(400);
  });

  it('validates user creation and customer linking', async () => {
    const linkCustomRole = await request(app)
      .post('/api/v1/users')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        email: `bad.link.${unique}@example.com`,
        password: roleUserPassword,
        firstName: 'Bad',
        lastName: 'Link',
        roleId: customRoleId,
        customerId,
      });

    expect(linkCustomRole.status).toBe(400);

    const missingRole = await request(app)
      .post('/api/v1/users')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        email: `missing.role.${unique}@example.com`,
        password: roleUserPassword,
        firstName: 'Missing',
        lastName: 'Role',
        roleId: 'does-not-exist',
      });

    expect(missingRole.status).toBe(400);

    const duplicateEmail = await request(app)
      .post('/api/v1/users')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        email: adminEmail,
        password: roleUserPassword,
        firstName: 'Duplicate',
        lastName: 'Email',
        roleId: customerRoleId,
      });

    expect(duplicateEmail.status).toBe(409);

    const shortPassword = await request(app)
      .post('/api/v1/users')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        email: `short.password.${unique}@example.com`,
        password: 'short',
        firstName: 'Short',
        lastName: 'Password',
        roleId: customerRoleId,
      });

    expect(shortPassword.status).toBe(400);

    const portalUser = await request(app)
      .post('/api/v1/users')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        email: portalEmail,
        password: portalPassword,
        firstName: 'Portal',
        lastName: 'User',
        roleId: customerRoleId,
        customerId,
      });

    expect(portalUser.status).toBe(201);
    expect(portalUser.body.data).toMatchObject({
      email: portalEmail,
      role: { name: 'CUSTOMER' },
      customerId,
      customer: { id: customerId, name: customerName },
    });
    expect(portalUser.body.data.passwordHash).toBeUndefined();

    portalUserId = portalUser.body.data.id;

    const duplicateLink = await request(app)
      .post('/api/v1/users')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        email: `duplicate.link.${unique}@example.com`,
        password: portalPassword,
        firstName: 'Duplicate',
        lastName: 'Link',
        roleId: customerRoleId,
        customerId,
      });

    expect(duplicateLink.status).toBe(409);

    const roleUser = await request(app)
      .post('/api/v1/users')
      .set('Authorization', bearer(adminAccessToken))
      .send({
        email: roleUserEmail,
        password: roleUserPassword,
        firstName: 'Role',
        lastName: 'User',
        roleId: customRoleId,
      });

    expect(roleUser.status).toBe(201);
    expect(roleUser.body.data.role.name).toBe(roleName);
    expect(roleUser.body.data.customerId).toBeNull();

    roleUserId = roleUser.body.data.id;

    const roleWithUser = await request(app)
      .get(`/api/v1/roles/${customRoleId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(roleWithUser.status).toBe(200);
    expect(roleWithUser.body.data.userCount).toBe(1);
  });

  it('lists and gets users', async () => {
    const portalList = await request(app)
      .get('/api/v1/users')
      .query({ search: portalEmail, role: 'CUSTOMER', status: 'ACTIVE', page: 1, limit: 10 })
      .set('Authorization', bearer(adminAccessToken));

    expect(portalList.status).toBe(200);
    expect(portalList.body.data).toHaveLength(1);
    expect(portalList.body.data[0].id).toBe(portalUserId);
    expect(portalList.body.meta).toEqual({ page: 1, limit: 10, total: 1 });

    const roleUserList = await request(app)
      .get('/api/v1/users')
      .query({ search: roleUserEmail, role: roleName })
      .set('Authorization', bearer(adminAccessToken));

    expect(roleUserList.status).toBe(200);
    expect(roleUserList.body.data).toHaveLength(1);
    expect(roleUserList.body.data[0].id).toBe(roleUserId);

    const fetched = await request(app)
      .get(`/api/v1/users/${portalUserId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(200);
    expect(fetched.body.data.role.name).toBe('CUSTOMER');
    expect(fetched.body.data.customer.id).toBe(customerId);

    const admin = await request(app)
      .get(`/api/v1/users/${adminId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(admin.status).toBe(200);
    expect(admin.body.data.role.name).toBe('SUPER_ADMIN');

    const missing = await request(app)
      .get('/api/v1/users/does-not-exist')
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
  });

  it('updates users', async () => {
    const updated = await request(app)
      .patch(`/api/v1/users/${portalUserId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ firstName: 'Linked', phone: '+987654321' });

    expect(updated.status).toBe(200);
    expect(updated.body.data.firstName).toBe('Linked');
    expect(updated.body.data.phone).toBe('+987654321');

    const duplicateEmail = await request(app)
      .patch(`/api/v1/users/${portalUserId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ email: adminEmail });

    expect(duplicateEmail.status).toBe(409);

    const emptyUpdate = await request(app)
      .patch(`/api/v1/users/${portalUserId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({});

    expect(emptyUpdate.status).toBe(400);

    const linkCustomRole = await request(app)
      .patch(`/api/v1/users/${roleUserId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ customerId });

    expect(linkCustomRole.status).toBe(400);

    const unlink = await request(app)
      .patch(`/api/v1/users/${portalUserId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ customerId: '' });

    expect(unlink.status).toBe(200);
    expect(unlink.body.data.customerId).toBeNull();

    const relink = await request(app)
      .patch(`/api/v1/users/${portalUserId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ customerId });

    expect(relink.status).toBe(200);
    expect(relink.body.data.customerId).toBe(customerId);
  });

  it('enforces user status transitions and self-protection', async () => {
    const statusUrl = `/api/v1/users/${portalUserId}/status`;

    const suspended = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'SUSPENDED' });

    expect(suspended.status).toBe(200);
    expect(suspended.body.data.status).toBe('SUSPENDED');

    const invalidTransition = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'INACTIVE' });

    expect(invalidTransition.status).toBe(400);

    const reactivated = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'ACTIVE' });

    expect(reactivated.status).toBe(200);

    const deactivated = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'INACTIVE' });

    expect(deactivated.status).toBe(200);
    expect(deactivated.body.data.status).toBe('INACTIVE');

    const activated = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'ACTIVE' });

    expect(activated.status).toBe(200);
    expect(activated.body.data.status).toBe('ACTIVE');

    const selfDeactivate = await request(app)
      .patch(`/api/v1/users/${adminId}/status`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'INACTIVE' });

    expect(selfDeactivate.status).toBe(400);

    const selfDelete = await request(app)
      .delete(`/api/v1/users/${adminId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(selfDelete.status).toBe(400);

    const invalidStatus = await request(app)
      .patch(statusUrl)
      .set('Authorization', bearer(adminAccessToken))
      .send({ status: 'UNKNOWN' });

    expect(invalidStatus.status).toBe(400);
  });

  it('enforces permissions for portal users', async () => {
    const session = await login(portalEmail, portalPassword);

    expect(session.status).toBe(200);
    portalAccessToken = session.body.data.accessToken;
    portalRefreshToken = session.body.data.refreshToken;

    const users = await request(app)
      .get('/api/v1/users')
      .set('Authorization', bearer(portalAccessToken));

    expect(users.status).toBe(403);

    const roles = await request(app)
      .get('/api/v1/roles')
      .set('Authorization', bearer(portalAccessToken));

    expect(roles.status).toBe(403);

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', bearer(portalAccessToken));

    expect(me.status).toBe(200);
    expect(me.body.data.customerId).toBe(customerId);
  });

  it('reassigns roles and deletes unused roles', async () => {
    const reassigned = await request(app)
      .patch(`/api/v1/users/${roleUserId}`)
      .set('Authorization', bearer(adminAccessToken))
      .send({ roleId: customerRoleId });

    expect(reassigned.status).toBe(200);
    expect(reassigned.body.data.role.name).toBe('CUSTOMER');

    const roleAfterReassignment = await request(app)
      .get(`/api/v1/roles/${customRoleId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(roleAfterReassignment.status).toBe(200);
    expect(roleAfterReassignment.body.data.userCount).toBe(0);

    const deleted = await request(app)
      .delete(`/api/v1/roles/${customRoleId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleted.status).toBe(200);

    const missing = await request(app)
      .get(`/api/v1/roles/${customRoleId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(missing.status).toBe(404);
  });

  it('soft deletes users and revokes sessions', async () => {
    const deleted = await request(app)
      .delete(`/api/v1/users/${portalUserId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(deleted.status).toBe(200);

    const fetched = await request(app)
      .get(`/api/v1/users/${portalUserId}`)
      .set('Authorization', bearer(adminAccessToken));

    expect(fetched.status).toBe(404);

    const refresh = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: portalRefreshToken });

    expect(refresh.status).toBe(401);

    const storedUser = await prisma.user.findUniqueOrThrow({ where: { id: portalUserId } });

    expect(storedUser.deletedAt).not.toBeNull();
    expect(storedUser.status).toBe('INACTIVE');
    expect(storedUser.customerId).toBeNull();

    const loginAfterDelete = await login(portalEmail, portalPassword);

    expect(loginAfterDelete.status).toBe(401);
  });
});
