import bcrypt from 'bcrypt';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';
import { auth } from '@/shared/middleware/auth';
import { authorize } from '@/shared/middleware/authorize';
import { globalErrorHandler } from '@/shared/middleware/globalErrorHandler';
import { sendResponse } from '@/shared/utils/sendResponse';

const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const adminEmail = `test.admin.${unique}@example.com`;
const adminPassword = 'AdminPass123!';
const customerEmail = `test.customer.${unique}@example.com`;
const customerPassword = 'CustomerPass123!';

let adminId: string;
let customerId: string | undefined;
let adminAccessToken: string;
let customerAccessToken: string;
let customerRefreshToken: string;

const rbacApp = express();
rbacApp.get('/admin-only', auth, authorize('users', 'create'), (_req, res) => {
  sendResponse(res, { data: { allowed: true } });
});
rbacApp.use(globalErrorHandler);

const login = async (email: string, password: string) =>
  request(app).post('/api/v1/auth/login').send({ email, password });

beforeAll(async () => {
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      firstName: 'Test',
      lastName: 'Admin',
      roleId: superAdminRole.id,
    },
  });

  adminId = admin.id;
});

afterAll(async () => {
  const userIds = [adminId, customerId].filter((id): id is string => Boolean(id));

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { actorId: { in: userIds } },
        { metadata: { path: ['email'], equals: adminEmail } },
        { metadata: { path: ['email'], equals: customerEmail } },
      ],
    },
  });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('auth module', () => {
  it('logs in a super admin and returns tokens', async () => {
    const response = await login(adminEmail, adminPassword);

    expect(response.status).toBe(200);
    expect(response.body.data.user.role).toBe('SUPER_ADMIN');
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));

    adminAccessToken = response.body.data.accessToken;
  });

  it('returns the current user for a valid access token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(adminEmail);
    expect(response.body.data.role).toBe('SUPER_ADMIN');
  });

  it('rejects missing and invalid access tokens', async () => {
    const missing = await request(app).get('/api/v1/auth/me');
    const invalid = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-token');

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
  });

  it('registers a customer with the CUSTOMER role', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: customerEmail,
      password: customerPassword,
      firstName: 'Test',
      lastName: 'Customer',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe('CUSTOMER');
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));

    customerId = response.body.data.user.id;
    customerAccessToken = response.body.data.accessToken;
    customerRefreshToken = response.body.data.refreshToken;
  });

  it('enforces permission checks with authorize()', async () => {
    const adminResponse = await request(rbacApp)
      .get('/admin-only')
      .set('Authorization', `Bearer ${adminAccessToken}`);
    const customerResponse = await request(rbacApp)
      .get('/admin-only')
      .set('Authorization', `Bearer ${customerAccessToken}`);
    const anonymousResponse = await request(rbacApp).get('/admin-only');

    expect(adminResponse.status).toBe(200);
    expect(customerResponse.status).toBe(403);
    expect(customerResponse.body.message).toBe('Missing permission: users:create');
    expect(anonymousResponse.status).toBe(401);
  });

  it('rotates refresh tokens and detects reuse', async () => {
    const rotated = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: customerRefreshToken });

    expect(rotated.status).toBe(200);
    expect(rotated.body.data.refreshToken).not.toBe(customerRefreshToken);

    const reused = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: customerRefreshToken });
    expect(reused.status).toBe(401);

    const rotatedAfterReuse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: rotated.body.data.refreshToken });
    expect(rotatedAfterReuse.status).toBe(401);
  });

  it('changes the password and revokes existing sessions', async () => {
    const session = await login(customerEmail, customerPassword);
    expect(session.status).toBe(200);

    const newPassword = 'CustomerPass456!';
    const change = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${session.body.data.accessToken}`)
      .send({ currentPassword: customerPassword, newPassword });

    expect(change.status).toBe(200);

    const oldPasswordLogin = await login(customerEmail, customerPassword);
    expect(oldPasswordLogin.status).toBe(401);

    const newPasswordLogin = await login(customerEmail, newPassword);
    expect(newPasswordLogin.status).toBe(200);

    const revokedRefresh = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.body.data.refreshToken });
    expect(revokedRefresh.status).toBe(401);
  });

  it('resets the password with a single-use token', async () => {
    const forgot = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: customerEmail });

    expect(forgot.status).toBe(200);
    expect(forgot.body.data.token).toEqual(expect.any(String));

    const resetToken = forgot.body.data.token as string;
    const newPassword = 'CustomerPass789!';
    const reset = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, password: newPassword });

    expect(reset.status).toBe(200);

    const reusedReset = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, password: 'CustomerPass000!' });
    expect(reusedReset.status).toBe(400);

    const newPasswordLogin = await login(customerEmail, newPassword);
    expect(newPasswordLogin.status).toBe(200);
  });

  it('logs out and revokes the refresh token', async () => {
    const session = await login(customerEmail, 'CustomerPass789!');
    expect(session.status).toBe(200);

    const logout = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: session.body.data.refreshToken });
    expect(logout.status).toBe(200);

    const refreshAfterLogout = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.body.data.refreshToken });
    expect(refreshAfterLogout.status).toBe(401);
  });

  it('revokes all sessions with logout-all', async () => {
    const firstSession = await login(customerEmail, 'CustomerPass789!');
    const secondSession = await login(customerEmail, 'CustomerPass789!');
    expect(firstSession.status).toBe(200);
    expect(secondSession.status).toBe(200);

    const logoutAll = await request(app)
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${secondSession.body.data.accessToken}`);
    expect(logoutAll.status).toBe(200);

    const firstRefresh = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: firstSession.body.data.refreshToken });
    const secondRefresh = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: secondSession.body.data.refreshToken });

    expect(firstRefresh.status).toBe(401);
    expect(secondRefresh.status).toBe(401);
  });
});
