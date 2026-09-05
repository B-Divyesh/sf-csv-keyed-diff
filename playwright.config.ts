import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  use: { baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4173' },
  webServer: { command: 'node scripts/serve-dist.mjs', port: 4173, reuseExistingServer: false },
});
