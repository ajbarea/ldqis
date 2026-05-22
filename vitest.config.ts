// research(2026-05): Astro recommends `getViteConfig()` from `astro/config`
// to seed Vitest with the project's Vite resolution (path aliases, plugins,
// `~` imports), so component tests use the same module graph as the build.
// happy-dom is lighter than jsdom and supported by Vitest 4 out of the box.
// Source: https://docs.astro.build/en/guides/testing/

import { getViteConfig } from "astro/config";
import { defineConfig } from "vitest/config";

export default getViteConfig(
  // research(2026-05): Vitest's defineConfig returns the top-level Vite
  // UserConfig type; Astro's getViteConfig expects its own nested-Vite
  // UserConfig type (same Vite version pinned differently in the dep tree).
  // The runtime path is fine. Same pattern as the `@tailwindcss/vite`
  // workaround in astro.config.mjs.
  // @ts-expect-error -- upstream type mismatch; runtime is unaffected.
  defineConfig({
    test: {
      environment: "happy-dom",
      include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        include: ["src/**/*.{ts,astro}"],
        exclude: ["src/**/*.test.ts", "src/**/__tests__/**"],
      },
    },
  }),
);
