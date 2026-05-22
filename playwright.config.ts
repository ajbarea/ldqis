// research(2026-05): Playwright drives a headless Chromium against the
// production build (`npm run preview` after `npm run build`). Spawning the
// preview server inside the config keeps CI hermetic — no separate `start`
// step in the workflow YAML. The `webServer.url` matches Astro's default
// preview port (4321) with the `/ldqis` base path that astro.config.mjs
// applies on the GitHub-Pages deploy.
import { defineConfig, devices } from "@playwright/test";

const PREVIEW_PORT = 4321;

// `astro preview` honors the `base: "/ldqis"` set in astro.config.mjs and
// serves the homepage at `/ldqis/`. Playwright's `page.goto("/")` resolves
// against the URL origin, not the baseURL path — so the baseURL needs the
// trailing-slash form and tests use relative paths (`""` for the homepage,
// `"projects/"` later) to compose cleanly with the base prefix.
const BASE_PATH = "/ldqis/";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}${BASE_PATH}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // `npm run preview` serves the static build. Run `npm run build` first;
    // `reuseExistingServer` lets `npm run test:e2e` skip the rebuild if the
    // dev server is already up.
    command: `npm run preview -- --host --port ${PREVIEW_PORT}`,
    url: `http://localhost:${PREVIEW_PORT}${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
