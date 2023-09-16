import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  retries: 0,
  webServer: {
    command: 'pnpm preview-ladle',
    url: `http://localhost:61000/canvas-styled-text/`,
    reuseExistingServer: true,
  },
});
