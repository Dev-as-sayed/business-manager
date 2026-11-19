import { z } from 'zod';

export const registerDeviceTokenBodySchema = z.object({
  token: z.string().trim().min(1).max(500),
  platform: z.enum(['ios', 'android', 'web']),
  deviceName: z.string().trim().max(200).optional(),
});

export const unregisterDeviceTokenBodySchema = z.object({
  token: z.string().trim().min(1).max(500),
});
