import type { APIRoute } from "astro";
import template from "../../admin/config.template.yml?raw";

// research(2026-05): Sveltia builds every "View on Live Site" link as
// `new URL(site_url).origin + '/' + preview_path` (sveltia-cms config/index.js
// `_baseURL = new URL(siteURL).origin`, entry/index.js joins it) — it discards
// site_url's PATH, so on the `/ldqis/` project page the base was dropped and
// links 404'd to the apex. No site_url value can fix that; the base has to live
// in each preview_path. Serving config.yml from an endpoint lets both site_url
// and that prefix derive from astro's `site` + base, so the CUSTOM_DOMAIN switch
// (project page /ldqis/ → apex /) needs no manual CMS edit — same pattern as
// src/pages/robots.txt.ts. The .yml.ts → /admin/config.yml mapping mirrors
// robots.txt.ts and news/rss.xml.js.

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  // `site` is always set in astro.config.mjs; guard keeps the types honest.
  const origin = site ?? new URL("https://ajbarea.github.io");
  // Full site root → "open production site" link (Sveltia keeps this path).
  const siteURL = new URL(base, origin).href;
  // Base path Sveltia drops from site_url, re-attached to each preview_path.
  // "/ldqis/" → "ldqis/"; apex "/" → "" (no prefix).
  const basePrefix = base.replace(/^\//, "");

  const config = template
    .replaceAll("__SITE_URL__", siteURL)
    .replaceAll("__BASE_PREFIX__", basePrefix);

  if (config.includes("__SITE_URL__") || config.includes("__BASE_PREFIX__")) {
    throw new Error("admin/config.yml: unsubstituted template placeholder");
  }

  return new Response(config, {
    headers: { "Content-Type": "text/yaml; charset=utf-8" },
  });
};
