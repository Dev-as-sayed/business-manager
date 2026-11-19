import { prisma } from '@/lib/prisma';

export const checkDatabase = async (): Promise<void> => {
  await prisma.$queryRaw`SELECT 1`;
};
