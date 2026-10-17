// research(2026-05): Playwright drives a headless Chromium against the
// production build (`npm run preview` after `npm run build`). Spawning the
// preview server inside the config keeps CI hermetic — no separate `start`
// step in the workflow YAML. The `webServer.url` matches Astro's default
// preview port (4321); the site is served at the root.
import { defineConfig, devices } from "@playwright/test";

const PREVIEW_PORT = 4321;

// Tests use relative paths (`""` for the homepage, `"projects/"` later) so they
// compose with the baseURL; a leading `/` would resolve against the origin.
const BASE_PATH = "/";

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
    // Astro 7 backgrounds `astro preview` under an AI agent, so the command exits and
    // Playwright reports "exited early"; keep it in the foreground.
    env: { ASTRO_PREVIEW_BACKGROUND: "0" },
  },
});
