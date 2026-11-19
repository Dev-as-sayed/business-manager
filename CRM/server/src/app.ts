import { randomUUID } from 'node:crypto';
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import httpStatus from 'http-status';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from '@/config/env';
import { API_PREFIX } from '@/config/constants';
import { logger } from '@/lib/logger';
import { openApiDocument } from '@/docs/openapi';
import { healthRouter } from '@/modules/health/health.route';
import { apiRouter } from '@/routes';
import { ApiError } from '@/shared/errors/ApiError';
import { globalErrorHandler } from '@/shared/middleware/globalErrorHandler';
import { notFound } from '@/shared/middleware/notFound';
import { globalLimiter } from '@/shared/middleware/rateLimiters';

const app = express();

if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const header = req.headers['x-request-id'];
      const incomingId = Array.isArray(header) ? header[0] : header;
      const requestId = incomingId ?? randomUUID();
      res.setHeader('x-request-id', requestId);
      return requestId;
    },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  }),
);

app.get('/docs.json', (_req, res) => {
  res.json(openApiDocument);
});
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'CRM API Docs',
    swaggerOptions: { persistAuthorization: true },
  }),
);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError(httpStatus.FORBIDDEN, `Origin ${origin} is not allowed`));
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/health', healthRouter);
app.use(API_PREFIX, globalLimiter, apiRouter);

app.use(notFound);
app.use(globalErrorHandler);

export { app };
export default app;
