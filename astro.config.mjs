// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { cpSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { URL, fileURLToPath } from "node:url";

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
// research(2026-10): Sveltia is self-hosted from the `@sveltia/cms` npm package
// rather than unpkg. Its entry script resolves its chunks relative to its own URL
// (`document.currentScript`), so a same-origin copy loads them locally. The copy
// goes into the build output (`astro:build:done`) and is served from node_modules
// in dev (`astro:server:setup`), so nothing is written into public/.
const CMS_DIST = fileURLToPath(new URL("./node_modules/@sveltia/cms/dist", import.meta.url));
const CMS_SKIP = /\.(map|mjs)$/;
/** @type {Record<string, string>} */
const CMS_TYPES = { ".js": "text/javascript; charset=utf-8" };

/** @type {() => import("astro").AstroIntegration} */
const sveltiaCms = () => {
  let base = "/";
  return {
    name: "sveltia-cms",
    hooks: {
      "astro:config:setup": ({ config }) => {
        base = config.base.endsWith("/") ? config.base : `${config.base}/`;
      },
      "astro:server:setup": ({ server }) => {
        // Vite strips the base from req.url, so match on the original URL: only base +
        // admin/cms/ is served, as in production.
        const prefix = "/admin/cms/";
        server.middlewares.use((req, res, next) => {
          if (!(req.originalUrl ?? "").startsWith(`${base}admin/cms/`)) return next();
          const stripped = (req.url ?? "").split("?")[0];
          if (!stripped.startsWith(prefix)) return next();
          try {
            const rel = decodeURIComponent(stripped.slice(prefix.length));
            const file = resolve(CMS_DIST, rel);
            if (CMS_SKIP.test(rel) || !file.startsWith(CMS_DIST + sep)) return next();
            if (!statSync(file).isFile()) return next();
            res.setHeader("Content-Type", CMS_TYPES[extname(file)] ?? "application/octet-stream");
            res.end(readFileSync(file));
          } catch {
            next();
          }
        });
      },
      "astro:build:done": ({ dir }) => {
        cpSync(CMS_DIST, join(fileURLToPath(dir), "admin", "cms"), {
          recursive: true,
          filter: (f) => !CMS_SKIP.test(f),
        });
      },
    },
  };
};

const isCustomDomain = process.env.CUSTOM_DOMAIN === "true";

export default defineConfig({
  site: isCustomDomain ? "https://dataqualitylabs.com" : "https://ajbarea.github.io",
  base: isCustomDomain ? "/" : "/ldqis",
  // research(2026-05): @astrojs/sitemap auto-generates
  // sitemap-index.xml from `site` + `base`, surfacing the publication /
  // people / project detail pages to crawlers (incl. Google Scholar). The
  // build-time robots.txt endpoint (src/pages/robots.txt.ts) points at it.
  // Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/
  integrations: [sitemap(), sveltiaCms()],
  vite: {
    plugins: [tailwindcss()],
  },
});
