import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '@/app';

describe('health endpoints', () => {
  it('returns liveness status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Service is alive',
      data: { status: 'ok' },
    });
  });

  it('returns the standard error shape for unknown routes', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Route GET /does-not-exist not found',
      errors: [],
    });
  });
});
