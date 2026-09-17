import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

// SWC (not esbuild, Vite's default) is required for `emitDecoratorMetadata`:
// esbuild strips decorators but never emits the type metadata Nest's DI reads
// at runtime — see https://docs.nestjs.com/recipes/swc#vitest.
export default defineConfig({
  test: {
    root: './',
    include: ['src/**/*.spec.ts'],
    globals: true,
    environment: 'node',
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage',
      include: ['src/**/*.(t|j)s'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
