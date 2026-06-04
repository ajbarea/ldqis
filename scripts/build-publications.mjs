#!/usr/bin/env node
// Build the lab's authoritative publication list from Dr. Reznik's CV.
// His CV (scripts/reznik-cv.txt, from his official "List of Products" PDF) is
// the INCLUSION list — which papers are actually his, which is what excludes
// other "L. Reznik" authors. OpenAlex/Crossref then supply clean structured
// fields, but only when their result is validated against the CV entry text.
// Papers his CV lists that no metadata API carries (mostly pre-DOI 1981–2009
// work) render as their exact CV citation. Output: src/data/publications-all.json
//   Re-run: node scripts/build-publications.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const MAILTO = "ajbareaa@gmail.com";
const ORCID = "0000-0003-4622-220X";

// ---------- helpers ----------
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
const initials = (name = "") => {
  const p = name.trim().split(/\s+/);
  if (p.length < 2) return name;
  return `${p
    .slice(0, -1)
    .map((x) => x[0].toUpperCase() + ".")
    .join(" ")} ${p.at(-1)}`;
};
const crAuthors = (list = []) =>
  list.map((a) => `${a.given ? a.given[0] + ". " : ""}${a.family || a.name || ""}`.trim());
const norm = (s = "") =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const toks = (s = "") =>
  new Set(
    norm(s)
      .split(" ")
      .filter((w) => w.length > 3),
  );
const overlap = (aSet, bSet) => {
  if (!aSet.size) return 0;
  let n = 0;
  for (const t of aSet) if (bSet.has(t)) n++;
  return n / aSet.size;
};
const cleanDoi = (d) =>
  d ? d.replace(/^https?:\/\/doi\.org\//i, "").replace(/[.,;]+$/, "") : null;
const fmtAuthors = (a = []) =>
  a.length > 10 ? a.slice(0, 10).join(", ") + ", et al." : a.join(", ");

// ---------- 1. parse the CV into the authoritative entry list ----------
const cleaned = readFileSync(join(__dir, "reznik-cv.txt"), "utf8")
  .split("\n")
  .filter((l) => {
    const t = l.trim();
    return !(/^Leon\s+Reznik$/i.test(t) || /^Curriculum Vitae$/i.test(t) || /^\d{1,2}$/.test(t));
  })
  .join("\n");
const pubIdx = cleaned.search(/\n\s*Publications\s*:\s*\n/);
const block = pubIdx >= 0 ? cleaned.slice(pubIdx) : cleaned;
const headers = [
  { type: "book", re: /\n\s*Books\s*\n/ },
  { type: "chapter", re: /\n\s*Chapters in Books\s*\n/ },
  { type: "journal", re: /\n\s*Journal articles \(refereed\)\s*\n/ },
  { type: "conference", re: /\n\s*Conference Papers \(peer reviewed\)\s*\n/ },
  { type: "__stop", re: /\n\s*Non-Refereed Papers\s*\n/ },
];
const positions = headers
  .map((h) => {
    const m = block.match(h.re);
    return { type: h.type, idx: m ? m.index : -1, len: m ? m[0].length : 0 };
  })
  .filter((p) => p.idx >= 0)
  .sort((a, b) => a.idx - b.idx);
const sections = positions.map((p, i) => ({
  type: p.type,
  text: block.slice(p.idx + p.len, i + 1 < positions.length ? positions[i + 1].idx : block.length),
}));
const extractTitle = (body) => {
  let m =
    body.match(/“([^”]{6,400})”/) ||
    body.match(/``([^`']{6,400}?)''/) ||
    body.match(/"([^"]{6,400}?)"/);
  return m ? m[1].trim() : null;
};
const entries = sections
  .filter((s) => s.type !== "__stop")
  .flatMap((s) =>
    s.text
      .split(/\n(?=\s*\[\d+\])/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter((p) => /^\[\d+\]/.test(p))
      .map((entryRaw) => {
        const body = entryRaw.replace(/^\[\d+\]\s*/, "");
        const doiM = body.match(/10\.\d{4,}\/[^\s,)"”'’]+/);
        const years = [...body.matchAll(/\b(?:19|20)\d{2}\b/g)].map((m) => +m[0]);
        return {
          type: s.type,
          year: years.length ? Math.max(...years) : null,
          doi: doiM ? cleanDoi(doiM[0]) : null,
          title: extractTitle(body),
          raw: body,
        };
      }),
  );

// ---------- 2. fetch OpenAlex (full fields) ----------
async function openAlex() {
  const out = [];
  let cur = "*";
  while (cur) {
    const r = await fetch(
      `https://api.openalex.org/works?filter=author.orcid:${ORCID}&per-page=200&cursor=${encodeURIComponent(cur)}&mailto=${MAILTO}`,
    );
    const j = await r.json();
    out.push(...j.results);
    cur = j.meta.next_cursor;
    if (!j.results.length) break;
  }
  return out.map((w) => ({
    title: cleanText(w.title || ""),
    authors: (w.authorships || []).map((a) =>
      initials(a.author?.display_name || a.raw_author_name || ""),
    ),
    venue: cleanText(w.primary_location?.source?.display_name || "") || null,
    year: w.publication_year,
    doi: cleanDoi(w.doi),
    link: w.doi || w.primary_location?.landing_page_url || w.id,
  }));
}

// ---------- 3/4. Crossref lookups ----------
const crToRec = (m) => ({
  title: cleanText(m.title?.[0] || ""),
  authors: crAuthors(m.author),
  venue: cleanText(m["container-title"]?.[0] || "") || null,
  year: m.issued?.["date-parts"]?.[0]?.[0] || null,
  doi: cleanDoi(m.DOI),
  link: `https://doi.org/${m.DOI}`,
});
async function crossrefByDoi(doi) {
  try {
    const r = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${MAILTO}`,
    );
    return r.ok ? crToRec((await r.json()).message) : null;
  } catch {
    return null;
  }
}
async function crossrefBiblio(rawText, cvTokens) {
  try {
    const r = await fetch(
      `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(rawText.slice(0, 300))}&rows=1&mailto=${MAILTO}`,
    );
    if (!r.ok) return null;
    const it = (await r.json()).message.items?.[0];
    if (!it) return null;
    const rec = crToRec(it);
    return overlap(toks(rec.title), cvTokens) >= 0.6 ? rec : null; // reject false matches
  } catch {
    return null;
  }
}

// ---------- 5. resolve each CV entry (one OpenAlex work per entry) ----------
const oa = (await openAlex()).map((w) => ({ w, set: toks(w.title) }));
const cvTok = entries.map((e) => toks(e.raw));

// Greedy one-to-one match so two different CV papers can't both grab the same
// OpenAlex record (that produced the duplicate/false matches).
const cand = [];
entries.forEach((e, ci) =>
  oa.forEach((o, oi) => {
    if (o.set.size < 4) return;
    const f = overlap(o.set, cvTok[ci]);
    if (f >= 0.7) cand.push({ ci, oi, f });
  }),
);
cand.sort((a, b) => b.f - a.f);
const cvToOa = new Map();
const usedOa = new Set();
for (const c of cand) {
  if (cvToOa.has(c.ci) || usedOa.has(c.oi)) continue;
  cvToOa.set(c.ci, oa[c.oi].w);
  usedOa.add(c.oi);
}

const results = [];
for (let ci = 0; ci < entries.length; ci++) {
  const e = entries[ci];
  let rec = cvToOa.get(ci) || null;
  if (!rec && e.doi) rec = await crossrefByDoi(e.doi);
  if (!rec) rec = await crossrefBiblio(e.raw, cvTok[ci]);
  results.push(
    rec
      ? {
          year: rec.year || e.year,
          type: e.type,
          title: rec.title,
          authors: fmtAuthors(rec.authors),
          venue: rec.venue,
          doi: rec.doi,
          link: rec.link,
          citation: null,
        }
      : {
          year: e.year,
          type: e.type,
          title: e.title,
          authors: null,
          venue: null,
          doi: e.doi,
          link: e.doi ? `https://doi.org/${e.doi}` : null,
          citation: e.raw,
        },
  );
}

// Final dedupe by DOI / normalized title (his CV occasionally lists the same
// paper under two sections). Structured records win over citation fallbacks.
const seen = new Set();
const deduped = [];
for (const r of [...results].sort((a, b) => (a.citation ? 1 : 0) - (b.citation ? 1 : 0))) {
  const key = r.doi ? `doi:${r.doi.toLowerCase()}` : `t:${norm(r.title || r.citation)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  deduped.push(r);
}
deduped.sort(
  (a, b) =>
    (b.year || 0) - (a.year || 0) || (a.title || a.citation).localeCompare(b.title || b.citation),
);
writeFileSync(
  join(__dir, "..", "src", "data", "publications-all.json"),
  JSON.stringify(deduped, null, 2) + "\n",
);
const struct = deduped.filter((r) => !r.citation).length;
const byType = {};
for (const r of deduped) byType[r.type] = (byType[r.type] || 0) + 1;
console.log(
  `${deduped.length} publications -> ${struct} structured, ${deduped.length - struct} CV-citation`,
);
console.log("by type:", byType);
