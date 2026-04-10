import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/vitest.setup.ts'],
    globals: true,
    testTimeout: 30000,
  },
});