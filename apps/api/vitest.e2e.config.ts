import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    globals: true,
    environment: 'node',
    globalSetup: ['./test/global-setup.ts'],
    testTimeout: 60_000,
    reporters: ['default'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
