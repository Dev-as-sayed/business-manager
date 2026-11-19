import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '@/app';

describe('API documentation', () => {
  it('serves the generated OpenAPI document', async () => {
    const response = await request(app).get('/docs.json');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      openapi: '3.0.3',
      info: { title: 'CRM API', version: '1.0.0' },
    });
    expect(response.body.paths['/api/v1/auth/login']).toBeDefined();
    expect(response.body.paths['/api/v1/attachments']).toBeDefined();
  });

  it('serves Swagger UI', async () => {
    const response = await request(app).get('/docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('CRM API Docs');
    expect(response.text).toContain('id="swagger-ui"');
  });
});
