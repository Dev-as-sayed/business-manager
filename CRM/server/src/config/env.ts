import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const durationSchema = z
  .string()
  .regex(/^\d+\s*(s|m|h|d|w)$/i, 'Use a duration such as 15m, 7d, or 1h');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  TRUST_PROXY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: durationSchema.default('15m'),
  JWT_REFRESH_EXPIRES_IN: durationSchema.default('7d'),
  PASSWORD_RESET_EXPIRES_IN: durationSchema.default('1h'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  UPLOAD_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  COOKIE_SECRET: z.string().min(16).optional(),
  SEED_ADMIN_EMAIL: z.email().default('admin@crm.local'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  SEED_ADMIN_FIRST_NAME: z.string().min(1).default('Super'),
  SEED_ADMIN_LAST_NAME: z.string().min(1).default('Admin'),
  BASE_CURRENCY: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .default('USD'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  CLOUDINARY_FOLDER: z.string().trim().min(1).default('crm/attachments'),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().max(50).default(10),
  UPLOAD_ALLOWED_MIME_TYPES: z
    .string()
    .default(
      'image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    .transform((value) =>
      value
        .split(',')
        .map((mimeType) => mimeType.trim())
        .filter(Boolean),
    ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  console.error(`Invalid environment configuration:\n${details}`);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
