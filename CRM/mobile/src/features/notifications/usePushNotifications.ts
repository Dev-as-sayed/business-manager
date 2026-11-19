import { useEffect } from 'react';
import {
  registerPushNotifications,
  subscribeToNotificationTaps,
} from '@/features/notifications/pushNotifications';

export const usePushNotifications = (): void => {
  useEffect(() => {
    void registerPushNotifications();
    const unsubscribe = subscribeToNotificationTaps();
    return unsubscribe;
  }, []);
};
