import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { store } from '@/store/store';
import { notificationsApi } from '@/features/notifications/notifications.api';

let currentPushToken: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const projectId = (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)
  ?.projectId;

export const registerPushNotifications = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;

  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;

  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.granted;
  }

  if (!granted || !projectId) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: AndroidImportance.DEFAULT,
    });
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    currentPushToken = token.data;
    await store.dispatch(
      notificationsApi.endpoints.registerDeviceToken.initiate({
        token: token.data,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        deviceName: Constants.deviceName ?? undefined,
      }),
    );
    return token.data;
  } catch {
    return null;
  }
};

export const unregisterPushNotifications = async (): Promise<void> => {
  if (!currentPushToken) return;

  try {
    await store.dispatch(
      notificationsApi.endpoints.unregisterDeviceToken.initiate({ token: currentPushToken }),
    );
  } finally {
    currentPushToken = null;
  }
};

export const subscribeToNotificationTaps = (): (() => void) => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const url = response.notification.request.content.data?.url;

    if (typeof url === 'string' && url.startsWith('/')) {
      router.push(url as Href);
    }
  });

  return () => subscription.remove();
};
