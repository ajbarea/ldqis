// @ts-check
// research(2026-05): @astrojs/rss writes a valid RSS 2.0 feed from a
// content-collection iterable. `site` must be set in astro.config (it is —
// per-env via CUSTOM_DOMAIN). Atom namespace + atom:link self-reference
// added per W3C feed-validation spec so the feed clears strict validators.
// Source: https://docs.astro.build/en/recipes/rss/
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

/** @param {import('astro').APIContext} context */
export async function GET(context) {
  const all = await getCollection("news");
  const now = Date.now();
  // Hide drafts AND future-dated posts (scheduled-but-not-live).
  const live = all
    .filter((post) => !post.data.draft && post.data.pubDate.getTime() <= now)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  // astro.config.mjs sets `site` for both prod envs; the union with `undefined`
  // exists purely to support `astro dev --host 0.0.0.0` without a `site` set,
  // which we don't run. Narrow it for the RSS endpoint.
  if (!context.site) {
    throw new Error("Astro `site` must be configured to generate the RSS feed.");
  }
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const siteOrigin = String(context.site).replace(/\/$/, "");
  const selfHref = `${siteOrigin}${base}/news/rss.xml`;

  return rss({
    title: "LDQIS — News",
    description: "News from the Laboratory of Data Quality and Intelligent Security at RIT.",
    site: context.site,
    items: live.map((post) => ({
      title: post.data.title,
      description: post.data.summary ?? post.data.description ?? "",
      pubDate: post.data.pubDate,
      author: post.data.author,
      link: `${base}/news/${post.id}/`,
      categories: post.data.tags,
    })),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<atom:link href="${selfHref}" rel="self" type="application/rss+xml"/>`,
  });
}
