import * as Sentry from '@sentry/react-native';
import { env, isProduction } from '@/config/env';

let initialized = false;

export const initSentry = (): void => {
  if (initialized || !env.sentryDsn) return;

  Sentry.init({
    dsn: env.sentryDsn,
    enabled: isProduction,
    tracesSampleRate: isProduction ? 0.15 : 0,
    sendDefaultPii: false,
    environment: env.appEnv,
  });
  initialized = true;
};

export { Sentry };
