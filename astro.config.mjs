// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// research(2026-05): Tailwind 4 ships as a Vite plugin (`@tailwindcss/vite`).
// The older `@astrojs/tailwind` integration is deprecated for Tailwind 4 per
// astro docs + the official Tailwind installation guide. Source:
// https://tailwindcss.com/docs/installation/framework-guides/astro
//
// research(2026-05): @tailwindcss/vite's wide vite peer range
// (^5.2 || ^6 || ^7 || ^8) lets npm hoist vite 8 over Astro 6's required
// vite 7, breaking the build ("Missing field `tsconfigPaths`..."). The
// `overrides.vite: ^7` pin in package.json prevents this; don't drop it
// without re-testing the build. (withastro/astro#16542; Astro 6 uses
// vite 7 + Rollup, not rolldown.)

// Until the DNS handoff lands `dataqualitylabs.com` on GitHub Pages,
// the site is deployed as a project page at `ajbarea.github.io/ldqis/`.
// Astro generates asset URLs against `site + base`, so without `base`
// set, the CSS link in the rendered HTML resolves to `/_astro/...`
// (which 404s under the project subpath). Flip `CUSTOM_DOMAIN=true` in
// the deploy workflow once DNS resolves to make this drop the `/ldqis`
// prefix and target the apex domain.
//
// Domain-migration checklist (the app pages AND the CMS config need NO changes:
// pages resolve URLs via import.meta.env.BASE_URL, and src/pages/admin/
// config.yml.ts derives the CMS site_url + preview_path prefixes from `site` +
// base — all flip with the two settings below). Beyond setting CUSTOM_DOMAIN=true:
// (1) update the apex literal below if it isn't dataqualitylabs.com; (2) the
// hardcoded links in README.md, src/content/news/2026-05-welcome.md, and
// scripts/check-readme-claims.mjs; (3) add the new domain to the
// sveltia-cms-auth Worker's ALLOWED_DOMAINS.
const isCustomDomain = process.env.CUSTOM_DOMAIN === "true";

export default defineConfig({
  site: isCustomDomain ? "https://dataqualitylabs.com" : "https://ajbarea.github.io",
  base: isCustomDomain ? "/" : "/ldqis",
  // research(2026-05): @astrojs/sitemap auto-generates
  // sitemap-index.xml from `site` + `base`, surfacing the publication /
  // people / project detail pages to crawlers (incl. Google Scholar). The
  // build-time robots.txt endpoint (src/pages/robots.txt.ts) points at it.
  // Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
