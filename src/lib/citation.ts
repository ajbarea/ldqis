// Academic-citation metadata builders for publication detail pages.
//
// research(2026-05): Google Scholar does NOT parse JSON-LD — it reads the
// Highwire Press `citation_*` meta-tag family (also Dublin Core / Eprints /
// BE Press / PRISM). So Scholar indexing relies on `buildCitationTags`;
// `buildScholarlyArticleJsonLd` is the complementary schema.org markup that
// general search engines and AI-mode crawlers (Gemini) consume. Emitting
// only JSON-LD — as the original ROADMAP item proposed — would have been
// invisible to the single most important discovery channel for a lab.
// Sources: scholar.google.com/intl/en/scholar/inclusion.html#indexing;
// developers.google.com/search/docs/appearance/structured-data/article

export interface PublicationData {
  title: string;
  // Flat citation-form author string, e.g. "D. Korobeinikov, R. Zatsarenko".
  authors: string;
  year: string;
  venue: string;
  venueType: "journal" | "conference";
  link: { label: string; href: string };
}

export interface MetaTag {
  name: string;
  content: string;
}

// Split the flat citation string into individual author names, dropping an
// "et al." token (with or without trailing period) so it isn't emitted as a
// fake author in `citation_author` / the JSON-LD author list.
export function parseAuthors(authors: string): string[] {
  return authors
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0 && !/^et al\.?$/i.test(a));
}

// Pull the bare DOI out of a doi.org / dx.doi.org URL; null for any other host.
export function extractDoi(href: string): string | null {
  const match = /^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i.exec(href);
  return match ? match[1] : null;
}

// Highwire Press tags Google Scholar parses from the article landing page.
export function buildCitationTags(pub: PublicationData): MetaTag[] {
  const tags: MetaTag[] = [{ name: "citation_title", content: pub.title }];
  for (const author of parseAuthors(pub.authors)) {
    tags.push({ name: "citation_author", content: author });
  }
  tags.push({ name: "citation_publication_date", content: pub.year });
  tags.push({
    name: pub.venueType === "journal" ? "citation_journal_title" : "citation_conference_title",
    content: pub.venue,
  });
  const doi = extractDoi(pub.link.href);
  if (doi) tags.push({ name: "citation_doi", content: doi });
  return tags;
}

// schema.org ScholarlyArticle JSON-LD for general/AI-mode crawlers. `url` is
// the canonical detail-page URL; `sameAs` points at the publisher landing page.
export function buildScholarlyArticleJsonLd(
  pub: PublicationData,
  url: string,
): Record<string, unknown> {
  const doi = extractDoi(pub.link.href);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: pub.title,
    author: parseAuthors(pub.authors).map((name) => ({ "@type": "Person", name })),
    datePublished: pub.year,
    isPartOf: {
      "@type": pub.venueType === "journal" ? "Periodical" : "CreativeWorkSeries",
      name: pub.venue,
    },
    url,
    sameAs: pub.link.href,
  };
  if (doi) {
    jsonLd.identifier = { "@type": "PropertyValue", propertyID: "DOI", value: doi };
  }
  return jsonLd;
}
