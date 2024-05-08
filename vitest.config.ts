import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    include: ['./tests/**/*.spec.ts'],
    env: {
      // Sandbox environment
      ...config({ path: './.env.testing' }).parsed,
    },
  },
});
