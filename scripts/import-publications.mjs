#!/usr/bin/env node
// Re-runnable import of Dr. Reznik's complete works from OpenAlex (free, keyless,
// by ORCID) into a committed JSON file. Content-as-code: the output is committed
// to git; the site never fetches at build or runtime. Google Scholar has no API,
// so OpenAlex is the authoritative machine-readable source.
//   Re-run: node scripts/import-publications.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ORCID = "0000-0003-4622-220X"; // Dr. Leon Reznik (src/content/people/leon-reznik.md)
const MAILTO = "ajbareaa@gmail.com"; // OpenAlex "polite pool"
const KEEP_TYPES = new Set(["article", "book-chapter", "book"]); // drop preprint/paratext/other

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "..", "src", "data", "publications-all.json");

const initials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const last = parts.at(-1);
  return `${parts
    .slice(0, -1)
    .map((p) => p[0].toUpperCase() + ".")
    .join(" ")} ${last}`;
};
const cleanText = (t = "") => {
  let s = (t || "").replace(/<[^>]+>/g, "");
  for (let i = 0; i < 3 && s.includes("&amp;"); i++) s = s.replace(/&amp;/g, "&");
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};
const norm = (t = "") =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

async function fetchAll() {
  const out = [];
  let cursor = "*";
  while (cursor) {
    const url = `https://api.openalex.org/works?filter=author.orcid:${ORCID}&per-page=200&cursor=${encodeURIComponent(cursor)}&mailto=${MAILTO}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenAlex ${res.status}`);
    const json = await res.json();
    out.push(...json.results);
    cursor = json.meta.next_cursor;
    if (!json.results.length) break;
  }
  return out;
}

const works = await fetchAll();

const mapped = works
  .filter((w) => KEEP_TYPES.has(w.type) && w.publication_year && w.title)
  .map((w) => {
    const authors = (w.authorships || []).map((a) =>
      initials(a.author?.display_name || a.raw_author_name),
    );
    const doi = w.doi || w.ids?.doi || null;
    const venue = cleanText(w.primary_location?.source?.display_name || "") || null;
    return {
      title: cleanText(w.title),
      authors:
        authors.length > 8 ? authors.slice(0, 8).join(", ") + ", et al." : authors.join(", "),
      venue,
      year: w.publication_year,
      type: w.type,
      doi: doi ? doi.replace(/^https?:\/\/doi\.org\//, "") : null,
      link: doi || w.primary_location?.landing_page_url || w.id,
    };
  });

// Dedupe by normalized title (collapses arXiv preprint + published article, which
// have different DOIs). Prefer the published record: has a DOI, has a venue, and
// is not arXiv.
const score = (x) =>
  (x.doi ? 2 : 0) + (x.venue ? 1 : 0) + (x.venue && /arxiv/i.test(x.venue) ? -4 : 0);
const byTitle = new Map();
for (const p of mapped) {
  const key = norm(p.title);
  const prev = byTitle.get(key);
  if (!prev || score(p) > score(prev)) byTitle.set(key, p);
}

// OpenAlex often lacks the venue for IEEE/ACM conference papers; the DOI
// registrant (Crossref) has the proper container-title. Backfill venue-less
// entries that have a DOI. One-time cost at import; nothing is fetched at runtime.
async function crossrefVenue(doi) {
  try {
    const res = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${MAILTO}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.message?.["container-title"]?.[0] || null;
  } catch {
    return null;
  }
}
let enriched = 0;
for (const p of byTitle.values()) {
  if (!p.venue && p.doi) {
    const v = await crossrefVenue(p.doi);
    if (v) {
      p.venue = cleanText(v);
      enriched++;
    }
  }
}
console.log(`Enriched ${enriched} venues from Crossref`);

const final = [...byTitle.values()].sort(
  (a, b) => b.year - a.year || a.title.localeCompare(b.title),
);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(final, null, 2) + "\n");

const byYear = {};
for (const p of final) byYear[p.year] = (byYear[p.year] || 0) + 1;
const venueless = final.filter((p) => !p.venue).length;
console.log(`Fetched ${works.length} works -> ${final.length} publications after filter + dedupe`);
console.log(`(${venueless} have no venue; ${final.filter((p) => p.doi).length} have a DOI)`);
console.log("Recent years:");
Object.entries(byYear)
  .sort((a, b) => b[0] - a[0])
  .slice(0, 10)
  .forEach(([y, n]) => console.log(`  ${y}: ${n}`));
