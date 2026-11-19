import { baseApi } from '@/api/baseApi';

interface RegisterDeviceTokenInput {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    registerDeviceToken: build.mutation<{ id: string }, RegisterDeviceTokenInput>({
      query: (body) => ({ url: '/notifications/device-tokens', method: 'POST', body }),
    }),
    unregisterDeviceToken: build.mutation<null, { token: string }>({
      query: (body) => ({
        url: '/notifications/device-tokens/unregister',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRegisterDeviceTokenMutation } = notificationsApi;
