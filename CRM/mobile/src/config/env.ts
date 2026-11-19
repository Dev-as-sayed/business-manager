import Constants from 'expo-constants';
import { z } from 'zod';

const envSchema = z.object({
  appEnv: z.enum(['development', 'preview', 'production']).default('development'),
  apiUrl: z.string().url(),
  privacyUrl: z.string().url(),
  minSupportedVersion: z.string().min(1),
  sentryDsn: z.string().url().optional(),
});

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const parsed = envSchema.safeParse({
  appEnv: extra.appEnv ?? 'development',
  apiUrl: extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  privacyUrl: extra.privacyUrl ?? 'https://example.com/privacy',
  minSupportedVersion: extra.minSupportedVersion ?? '1.0.0',
  sentryDsn: extra.sentryDsn || undefined,
});

if (!parsed.success) {
  throw new Error(
    `Invalid mobile environment:\n${parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')}`,
  );
}

export const env = parsed.data;
export const isProduction = env.appEnv === 'production';
