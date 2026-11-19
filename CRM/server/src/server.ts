import http from 'node:http';
import { app } from '@/app';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const server = http.createServer(app);
const SHUTDOWN_TIMEOUT_MS = 10_000;

let shuttingDown = false;

const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, 'Shutting down');

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    server.closeAllConnections();
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  server.close(async (error) => {
    let finalExitCode = exitCode;

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.error({ err: disconnectError }, 'Failed to disconnect Prisma');
      finalExitCode = 1;
    }

    clearTimeout(forceExit);

    if (error) {
      logger.error({ err: error }, 'Failed to close HTTP server');
      finalExitCode = 1;
    }

    logger.info('Shutdown complete');
    process.exit(finalExitCode);
  });
};

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'CRM API server listening');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
  void shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  void shutdown('uncaughtException', 1);
});
