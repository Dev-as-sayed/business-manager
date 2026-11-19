import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z
    .url('VITE_API_URL must be a valid URL')
    .default('http://localhost:4000/api/v1')
    .transform((value) => value.replace(/\/+$/, '')),
  VITE_APP_NAME: z.string().trim().min(1).default('Manifest CRM'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');

  throw new Error(`Invalid client environment configuration:\n${details}`);
}

export const env = parsed.data;
