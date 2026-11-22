import type { ConfigContext, ExpoConfig } from 'expo/config';
import { z } from 'zod';

const appEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'preview', 'production']).default('development'),
  EXPO_PUBLIC_API_URL: z.string().url().default('http://localhost:4000/api/v1'),
  EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  EXPO_PUBLIC_EAS_PROJECT_ID: z
    .string()
    .min(1)
    .default('bb4a834b-dc5d-4559-b562-5ce9f1b10932'),
  EXPO_PUBLIC_UPDATES_URL: z
    .string()
    .url()
    .default('https://u.expo.dev/bb4a834b-dc5d-4559-b562-5ce9f1b10932'),
  EXPO_PUBLIC_PRIVACY_URL: z.string().url().default('https://example.com/privacy'),
  EXPO_PUBLIC_MIN_SUPPORTED_VERSION: z.string().default('1.0.0'),
});

const parsed = appEnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid app environment:\n${parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n')}`,
  );
}

const appEnv = parsed.data;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Manifest CRM',
  slug: 'omnia',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'omnia',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.manifestcrm.mobile',
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.manifestcrm.mobile',
    adaptiveIcon: {
      backgroundColor: '#14211C',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: true,
    softwareKeyboardLayoutMode: 'resize',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#14211C',
        image: './assets/images/splash-icon.png',
        imageWidth: 120,
        resizeMode: 'contain',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Manifest CRM uses the camera to capture QC photos and scan carton barcodes.',
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Manifest CRM needs photo access to attach product and QC images.',
        cameraPermission: 'Manifest CRM uses the camera to capture product and QC images.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#059669',
        defaultChannel: 'default',
      },
    ],
    [
      'expo-secure-store',
      {
        faceIDPermission: 'Allow Manifest CRM to use Face ID to protect your session.',
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow Manifest CRM to use biometrics to unlock the app.',
      },
    ],
    '@sentry/react-native',
    'expo-document-picker',
    'expo-sharing',
    'expo-localization',
  ],
  experiments: {
    typedRoutes: true,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  ...(appEnv.EXPO_PUBLIC_UPDATES_URL
    ? { updates: { url: appEnv.EXPO_PUBLIC_UPDATES_URL, checkAutomatically: 'ON_LOAD' as const } }
    : {}),
  extra: {
    appEnv: appEnv.APP_ENV,
    apiUrl: appEnv.EXPO_PUBLIC_API_URL,
    privacyUrl: appEnv.EXPO_PUBLIC_PRIVACY_URL,
    minSupportedVersion: appEnv.EXPO_PUBLIC_MIN_SUPPORTED_VERSION,
    sentryDsn: appEnv.EXPO_PUBLIC_SENTRY_DSN,
    ...(appEnv.EXPO_PUBLIC_EAS_PROJECT_ID
      ? { eas: { projectId: appEnv.EXPO_PUBLIC_EAS_PROJECT_ID } }
      : {}),
  },
});
