export interface RegisterDeviceTokenInput {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
}
