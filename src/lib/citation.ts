// Academic-citation metadata builders for publication detail pages.
//
// research(2026-05): Google Scholar does NOT parse JSON-LD — it reads the
// Highwire Press `citation_*` meta-tag family (also Dublin Core / Eprints /
// BE Press / PRISM). So Scholar indexing relies on `buildCitationTags`;
// `buildPublicationJsonLd` is the complementary schema.org markup that
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
  // Journal / conference name, or — for a book — the publisher.
  venue: string;
  venueType: "journal" | "conference" | "book";
  // ISBN (books only) → citation_isbn + the Book JSON-LD's isbn.
  isbn?: string;
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
  // research(2026-05): a whole book carries citation_publisher + citation_isbn
  // (citation_book_title is for a chapter WITHIN a book, not the book itself);
  // journal and conference each get their own venue-title tag.
  // Source: scholar.google.com/intl/en/scholar/inclusion.html#indexing
  if (pub.venueType === "book") {
    tags.push({ name: "citation_publisher", content: pub.venue });
    if (pub.isbn) tags.push({ name: "citation_isbn", content: pub.isbn });
  } else {
    tags.push({
      name: pub.venueType === "journal" ? "citation_journal_title" : "citation_conference_title",
      content: pub.venue,
    });
  }
  const doi = extractDoi(pub.link.href);
  if (doi) tags.push({ name: "citation_doi", content: doi });
  return tags;
}

// schema.org JSON-LD for general/AI-mode crawlers. `url` is the canonical
// detail-page URL; `sameAs` points at the publisher landing page. A standalone
// book is schema.org/Book; a journal/conference paper is a ScholarlyArticle
// whose `isPartOf` models the venue.
export function buildPublicationJsonLd(pub: PublicationData, url: string): Record<string, unknown> {
  const doi = extractDoi(pub.link.href);
  const authors = parseAuthors(pub.authors).map((name) => ({ "@type": "Person", name }));

  if (pub.venueType === "book") {
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Book",
      name: pub.title,
      author: authors,
      datePublished: pub.year,
      publisher: { "@type": "Organization", name: pub.venue },
      url,
      sameAs: pub.link.href,
    };
    if (pub.isbn) jsonLd.isbn = pub.isbn;
    if (doi) {
      jsonLd.identifier = { "@type": "PropertyValue", propertyID: "DOI", value: doi };
    }
    return jsonLd;
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: pub.title,
    author: authors,
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
