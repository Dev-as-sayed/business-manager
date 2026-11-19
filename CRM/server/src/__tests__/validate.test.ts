import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { globalErrorHandler } from '@/shared/middleware/globalErrorHandler';
import { validate } from '@/shared/middleware/validate';
import { sendResponse } from '@/shared/utils/sendResponse';

const testApp = express();
testApp.use(express.json());

testApp.get(
  '/items',
  validate({ query: z.object({ page: z.coerce.number().int().positive() }) }),
  (req, res) => {
    sendResponse(res, { data: { page: req.query.page } });
  },
);

testApp.post('/items', validate({ body: z.object({ name: z.string().min(1) }) }), (req, res) => {
  sendResponse(res, { statusCode: 201, data: req.body });
});

testApp.use(globalErrorHandler);

describe('validate middleware', () => {
  it('parses and replaces the query object', async () => {
    const response = await request(testApp).get('/items?page=2');

    expect(response.status).toBe(200);
    expect(response.body.data.page).toBe(2);
  });

  it('returns per-field errors for invalid input', async () => {
    const response = await request(testApp).post('/items').send({ name: '' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Validation failed',
    });
    expect(response.body.errors[0].field).toBe('name');
    expect(response.body.errors[0].message).toBeTruthy();
  });
});
