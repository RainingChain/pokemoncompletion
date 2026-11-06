import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  // A new screenshot must be created explicitly, never silently during CI.
  updateSnapshots: 'none',
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'en-US',
    timezoneId: 'America/Toronto',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', testMatch: /(?:articles|pages|visual)\.spec\.js/, use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'bun run build:e2e && bun run start:e2e',
    url: 'http://localhost:3100',
    timeout: 240_000,
    reuseExistingServer: false,
    env: { PORT: '3100', HEROKU_APP_ID: '' },
  },
});
