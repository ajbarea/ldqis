import type { APIRoute } from "astro";

// research(2026-05): generate robots.txt at build time so the `Sitemap:`
// directive tracks the CUSTOM_DOMAIN switch (project-page base `/ldqis/`
// vs apex `/`) instead of hardcoding a URL that goes stale at the DNS
// handoff. @astrojs/sitemap emits `sitemap-index.xml` at the site root.
// Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/
const body = (sitemap: string): string => `User-agent: *
Allow: /

Sitemap: ${sitemap}
`;

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  // `site` is always set in astro.config.mjs; guard keeps the types honest.
  const sitemapUrl = site ? new URL(`${base}sitemap-index.xml`, site).href : "";
  const text = sitemapUrl ? body(sitemapUrl) : "User-agent: *\nAllow: /\n";
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
