// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// research(2026-05): Tailwind 4 ships as a Vite plugin (`@tailwindcss/vite`).
// The older `@astrojs/tailwind` integration is deprecated for Tailwind 4 per
// astro docs + the official Tailwind installation guide. Source:
// https://tailwindcss.com/docs/installation/framework-guides/astro
//
// research(2026-05): pinned to Astro 5.x (^5.18.1) rather than 6.x because
// Astro 6's rolldown-vite build pipeline has an open upstream incompatibility
// with @tailwindcss/vite (withastro/astro#16542 — "Missing field
// `tsconfigPaths` on BindingViteResolvePluginConfig.resolveOptions"). Two
// moderate-severity advisories apply to Astro 5.x (GHSA-j687-52p2-xcff
// `define:vars` XSS, GHSA-xr5h-phrj-8vxv server-island encrypted-param
// replay). Neither code path is exercised here — this is a `output: "static"`
// build with zero `define:vars` and no server islands — so the advisories
// don't translate to actual exposure. Migrate to Astro 6 in M-future once
// the Tailwind-vite bug is closed. Mirrors AJ's phalanx-fl PR #11
// "unpatched-upstream ignore list" pattern.

// Until the M5 DNS handoff lands `dataqualitylabs.com` on GitHub Pages,
// the site is deployed as a project page at `ajbarea.github.io/ldqis/`.
// Astro generates asset URLs against `site + base`, so without `base`
// set, the CSS link in the rendered HTML resolves to `/_astro/...`
// (which 404s under the project subpath). Flip `CUSTOM_DOMAIN=true` in
// the deploy workflow once DNS resolves to make this drop the `/ldqis`
// prefix and target the apex domain.
const isCustomDomain = process.env.CUSTOM_DOMAIN === "true";

export default defineConfig({
  site: isCustomDomain ? "https://dataqualitylabs.com" : "https://ajbarea.github.io",
  base: isCustomDomain ? "/" : "/ldqis",
  vite: {
    plugins: [tailwindcss()],
  },
});
