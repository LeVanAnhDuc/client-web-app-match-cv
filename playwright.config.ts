import "dotenv/config"; // load client/.env (E2E_DATABASE_URL for db-cleanup) into node process
import { defineConfig, devices } from "@playwright/test";

// Gate A of the §4.3 dual-gate (docs/specs/cv-jd-matching-wizard/e2e.md).
// Runs against the ALREADY-RUNNING dev servers (server :5200, client :5300)
// — this config intentionally has no `webServer` block; it never starts or
// stops anything itself.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  timeout: 30_000,
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    // Override when the dev server runs on another port — e.g. a git worktree
    // running in parallel with the main checkout that already owns :5300.
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5300",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  // Three viewport classes per docs/specs/wizard-responsive/design.md §8.2.
  // All chromium on purpose: the `iPhone 13` / `iPad (gen 7)` descriptors force
  // `defaultBrowserType: "webkit"`, which means installing another browser for
  // no gain when what we assert is CSS breakpoint behaviour.
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 820, height: 1180 },
        hasTouch: true
      }
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        hasTouch: true
      }
    }
  ]
});
