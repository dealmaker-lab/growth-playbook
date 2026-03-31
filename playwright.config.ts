import { defineConfig } from '@playwright/test';

/**
 * Validation Algorithms: E2E Test Configuration
 *
 * Connects to Lightpanda CDP for headless browser automation.
 * Tests run against live Vercel deployment URL.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://growth-playbook-six.vercel.app';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  workers: 2,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile',
      use: {
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
