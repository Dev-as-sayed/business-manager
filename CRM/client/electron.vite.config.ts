import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';

const root = __dirname;

export default defineConfig({
  main: {
    build: {
      rolldownOptions: {
        input: path.resolve(root, 'electron/main/index.ts'),
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
    },
  },
  preload: {
    build: {
      rolldownOptions: {
        input: path.resolve(root, 'electron/preload/index.ts'),
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
    },
  },
  renderer: {
    root,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(root, 'src'),
      },
    },
    server: {
      port: 5174,
      strictPort: true,
    },
    build: {
      rolldownOptions: {
        input: path.resolve(root, 'index.html'),
      },
    },
  },
});
