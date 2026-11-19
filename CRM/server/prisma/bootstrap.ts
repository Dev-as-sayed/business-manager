import bcrypt from 'bcrypt';
import { PrismaClient, UserStatus } from '@prisma/client';
import { env } from '@/config/env';
import { getRoleId, seedPermissions, seedRoles } from './seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (env.NODE_ENV === 'production' && env.SEED_ADMIN_PASSWORD === 'ChangeMe123!') {
    throw new Error('SEED_ADMIN_PASSWORD must not use the development default in production');
  }

  const permissions = await seedPermissions(prisma);
  const roles = await seedRoles(permissions, prisma);
  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS);
  const email = env.SEED_ADMIN_EMAIL.toLowerCase();

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      firstName: env.SEED_ADMIN_FIRST_NAME,
      lastName: env.SEED_ADMIN_LAST_NAME,
      roleId: getRoleId(roles, 'SUPER_ADMIN'),
      status: UserStatus.ACTIVE,
      customerId: null,
      deletedAt: null,
    },
    create: {
      email,
      passwordHash,
      firstName: env.SEED_ADMIN_FIRST_NAME,
      lastName: env.SEED_ADMIN_LAST_NAME,
      roleId: getRoleId(roles, 'SUPER_ADMIN'),
      status: UserStatus.ACTIVE,
    },
  });

  console.info(
    `Bootstrap complete: ${permissions.size} permissions, ${roles.size} roles, super admin ${email}`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('Bootstrap failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
