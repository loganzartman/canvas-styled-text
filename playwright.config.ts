import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  retries: 0,
  webServer: {
    command: 'pnpm serve-ladle',
    url: `http://localhost:61000/`,
    reuseExistingServer: true,
  },
});
