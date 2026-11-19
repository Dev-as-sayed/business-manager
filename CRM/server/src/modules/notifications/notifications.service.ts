import { prisma } from '@/lib/prisma';
import type { RegisterDeviceTokenInput } from '@/modules/notifications/notifications.types';

export const registerDeviceToken = async (userId: string, input: RegisterDeviceTokenInput) =>
  prisma.deviceToken.upsert({
    where: { token: input.token },
    create: {
      token: input.token,
      userId,
      platform: input.platform,
      deviceName: input.deviceName ?? null,
    },
    update: {
      userId,
      platform: input.platform,
      deviceName: input.deviceName ?? null,
      lastUsedAt: new Date(),
    },
    select: { id: true, platform: true, deviceName: true, updatedAt: true },
  });

export const unregisterDeviceToken = async (userId: string, token: string): Promise<void> => {
  await prisma.deviceToken.deleteMany({ where: { token, userId } });
};
