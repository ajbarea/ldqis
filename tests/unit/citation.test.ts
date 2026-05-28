// Unit tests for the academic-citation metadata builders. These power the
// Highwire Press `citation_*` meta tags — the format Google Scholar actually
// parses (research(2026-05): Scholar ignores JSON-LD; it reads Highwire /
// Dublin Core / Eprints tags) — plus the complementary schema.org
// ScholarlyArticle JSON-LD that general search + AI-mode crawlers consume.
// Pure functions, no DOM.
import { describe, expect, it } from "vitest";
import {
  buildCitationTags,
  buildPublicationJsonLd,
  extractDoi,
  parseAuthors,
  type PublicationData,
} from "../../src/lib/citation";

const journalPub: PublicationData = {
  title: "InteFL Framework: Optimizing Federated Learning with Metacognition",
  authors: "D. Korobeinikov, R. Zatsarenko, S. Chuprov, A. Barea, L. Reznik",
  year: "2026",
  venue: "IEEE Intelligent Systems",
  venueType: "journal",
  link: { label: "DOI ↗", href: "https://doi.org/10.1109/MIS.2026.3658072" },
};

const conferencePub: PublicationData = {
  title: "Trust-Based Anomaly Detection in Federated Edge Learning",
  authors: "D. Korobeinikov, et al.",
  year: "2024",
  venue: "IEEE AIIoT 2024",
  venueType: "conference",
  link: { label: "IEEE Xplore ↗", href: "https://ieeexplore.ieee.org/document/10578967/" },
};

const bookPub: PublicationData = {
  title:
    "Intelligent Security Systems: How AI, ML and Data Science Work For and Against Computer Security",
  authors: "L. Reznik",
  year: "2022",
  venue: "Wiley-IEEE Press",
  venueType: "book",
  isbn: "9781119771531",
  link: { label: "Wiley ↗", href: "https://doi.org/10.1002/9781119771579" },
};

describe("parseAuthors", () => {
  it("splits a comma-separated citation string into individual authors", () => {
    expect(parseAuthors(journalPub.authors)).toEqual([
      "D. Korobeinikov",
      "R. Zatsarenko",
      "S. Chuprov",
      "A. Barea",
      "L. Reznik",
    ]);
  });

  it("drops an 'et al.' token rather than treating it as an author", () => {
    expect(parseAuthors("D. Korobeinikov, et al.")).toEqual(["D. Korobeinikov"]);
  });

  it("drops 'et al' without a trailing period too", () => {
    expect(parseAuthors("D. Korobeinikov, et al")).toEqual(["D. Korobeinikov"]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseAuthors("")).toEqual([]);
  });
});

describe("extractDoi", () => {
  it("pulls the DOI out of a doi.org URL", () => {
    expect(extractDoi("https://doi.org/10.1109/MIS.2026.3658072")).toBe("10.1109/MIS.2026.3658072");
  });

  it("handles the dx.doi.org host", () => {
    expect(extractDoi("https://dx.doi.org/10.1000/xyz123")).toBe("10.1000/xyz123");
  });

  it("returns null for non-DOI publisher URLs", () => {
    expect(extractDoi("https://ieeexplore.ieee.org/document/10578967/")).toBeNull();
    expect(extractDoi("https://par.nsf.gov/biblio/10532530")).toBeNull();
  });
});

describe("buildCitationTags", () => {
  it("emits citation_title, one citation_author per author, and the publication date", () => {
    const tags = buildCitationTags(journalPub);
    expect(tags).toContainEqual({ name: "citation_title", content: journalPub.title });
    expect(tags.filter((t) => t.name === "citation_author").map((t) => t.content)).toEqual([
      "D. Korobeinikov",
      "R. Zatsarenko",
      "S. Chuprov",
      "A. Barea",
      "L. Reznik",
    ]);
    expect(tags).toContainEqual({ name: "citation_publication_date", content: "2026" });
  });

  it("uses citation_journal_title for journal venues", () => {
    const tags = buildCitationTags(journalPub);
    expect(tags).toContainEqual({
      name: "citation_journal_title",
      content: "IEEE Intelligent Systems",
    });
    expect(tags.some((t) => t.name === "citation_conference_title")).toBe(false);
  });

  it("uses citation_conference_title for conference venues", () => {
    const tags = buildCitationTags(conferencePub);
    expect(tags).toContainEqual({
      name: "citation_conference_title",
      content: "IEEE AIIoT 2024",
    });
    expect(tags.some((t) => t.name === "citation_journal_title")).toBe(false);
  });

  it("uses citation_publisher + citation_isbn for book venues", () => {
    const tags = buildCitationTags(bookPub);
    expect(tags).toContainEqual({ name: "citation_publisher", content: "Wiley-IEEE Press" });
    expect(tags).toContainEqual({ name: "citation_isbn", content: "9781119771531" });
    expect(tags.some((t) => t.name === "citation_journal_title")).toBe(false);
    expect(tags.some((t) => t.name === "citation_conference_title")).toBe(false);
  });

  it("emits citation_doi when the link is a DOI and omits it otherwise", () => {
    expect(buildCitationTags(journalPub)).toContainEqual({
      name: "citation_doi",
      content: "10.1109/MIS.2026.3658072",
    });
    expect(buildCitationTags(conferencePub).some((t) => t.name === "citation_doi")).toBe(false);
  });
});

describe("buildPublicationJsonLd", () => {
  const url = "https://dataqualitylabs.com/publications/intefl-mis-2026/";

  it("produces a schema.org ScholarlyArticle with headline, authors, date, and links", () => {
    const ld = buildPublicationJsonLd(journalPub, url);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("ScholarlyArticle");
    expect(ld.headline).toBe(journalPub.title);
    expect(ld.author).toEqual([
      { "@type": "Person", name: "D. Korobeinikov" },
      { "@type": "Person", name: "R. Zatsarenko" },
      { "@type": "Person", name: "S. Chuprov" },
      { "@type": "Person", name: "A. Barea" },
      { "@type": "Person", name: "L. Reznik" },
    ]);
    expect(ld.datePublished).toBe("2026");
    expect(ld.url).toBe(url);
    expect(ld.sameAs).toBe(journalPub.link.href);
  });

  it("models a journal venue as a Periodical in isPartOf", () => {
    const ld = buildPublicationJsonLd(journalPub, url);
    expect(ld.isPartOf).toEqual({ "@type": "Periodical", name: "IEEE Intelligent Systems" });
  });

  it("models a conference venue as a CreativeWorkSeries in isPartOf", () => {
    const ld = buildPublicationJsonLd(conferencePub, url);
    expect(ld.isPartOf).toEqual({ "@type": "CreativeWorkSeries", name: "IEEE AIIoT 2024" });
  });

  it("models a book as a schema.org Book with isbn + publisher", () => {
    const ld = buildPublicationJsonLd(bookPub, url);
    expect(ld["@type"]).toBe("Book");
    expect(ld.name).toBe(bookPub.title);
    expect(ld.isbn).toBe("9781119771531");
    expect(ld.publisher).toEqual({ "@type": "Organization", name: "Wiley-IEEE Press" });
    expect(ld.identifier).toEqual({
      "@type": "PropertyValue",
      propertyID: "DOI",
      value: "10.1002/9781119771579",
    });
    expect(ld.isPartOf).toBeUndefined();
    expect(ld.headline).toBeUndefined();
  });

  it("includes a DOI PropertyValue identifier when present", () => {
    const ld = buildPublicationJsonLd(journalPub, url);
    expect(ld.identifier).toEqual({
      "@type": "PropertyValue",
      propertyID: "DOI",
      value: "10.1109/MIS.2026.3658072",
    });
  });

  it("omits the identifier field when there is no DOI", () => {
    const ld = buildPublicationJsonLd(conferencePub, url);
    expect(ld.identifier).toBeUndefined();
  });
});
