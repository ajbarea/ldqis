// research(2026-05): Astro recommends `getViteConfig()` from `astro/config`
// to seed Vitest with the project's Vite resolution (path aliases, plugins,
// `~` imports), so component tests use the same module graph as the build.
// happy-dom is lighter than jsdom and supported natively by Vitest 4.
// Source: https://docs.astro.build/en/guides/testing/

import { getViteConfig } from "astro/config";
import { defineConfig } from "vitest/config";

export default getViteConfig(
  defineConfig({
    test: {
      environment: "happy-dom",
      include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        // research(2026-05): scope coverage to the unit-testable logic in
        // src/lib. The .astro components/layouts/pages and content.config.ts
        // are validated by `astro build` + the Playwright e2e suite, never by
        // Vitest, so a broad `src/**` sweep only reported them at 0% and sank
        // the metric (citation.ts is 100%, the blended "All files" was 18%).
        // Vitest's guidance is to `include` only the files you measure rather
        // than exclude from a sweep. https://vitest.dev/guide/coverage.html
        include: ["src/lib/**/*.ts"],
        exclude: ["src/**/*.test.ts", "src/**/__tests__/**"],
      },
    },
  }),
);
