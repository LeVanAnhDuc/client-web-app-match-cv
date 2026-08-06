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
    // Default to the standard dev port; override with E2E_BASE_URL when the
    // app runs on another port (e.g. a worktree pair on :5302).
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5300",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
