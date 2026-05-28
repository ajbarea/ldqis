// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
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
  // research(2026-05): @astrojs/sitemap (Astro 5 line) auto-generates
  // sitemap-index.xml from `site` + `base`, surfacing the publication /
  // people / project detail pages to crawlers (incl. Google Scholar). The
  // build-time robots.txt endpoint (src/pages/robots.txt.ts) points at it.
  // Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/
  integrations: [sitemap()],
  vite: {
    // research(2026-05): @tailwindcss/vite peer-Vite version differs from
    // Astro's nested Vite (HotUpdatePluginContext vs MinimalPluginContext);
    // PluginOption type assignability fails. The runtime path is fine —
    // pinned to ^4.0.0 since that's what Tailwind 4 publishes. Re-evaluate
    // when @tailwindcss/vite catches up to Astro's Vite minor.
    // @ts-expect-error -- upstream type mismatch; runtime is unaffected.
    plugins: [tailwindcss()],
  },
});
