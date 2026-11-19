import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
    },
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
  },
});
