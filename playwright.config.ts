import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config.
 * Runs against the local vite dev server by default.
 *
 * Required env (set in your shell or `.env.test` and export):
 *   E2E_BASE_URL              default http://localhost:8080
 *   E2E_SUPABASE_URL          your Supabase project URL
 *   E2E_SUPABASE_ANON_KEY     publishable / anon key
 *   E2E_SUPABASE_SERVICE_KEY  service-role key (used to create + clean up the test user)
 *   E2E_TEST_EMAIL            e.g. e2e+mpesa@example.com
 *   E2E_TEST_PASSWORD         e.g. a long random string
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: "bun run dev",
        url: process.env.E2E_BASE_URL ?? "http://localhost:8080",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
