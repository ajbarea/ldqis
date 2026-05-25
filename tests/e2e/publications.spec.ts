// Guards the academic-discovery metadata on publication detail pages. The
// Highwire `citation_*` tags are what Google Scholar parses (research(2026-05):
// Scholar ignores JSON-LD), and the schema.org ScholarlyArticle JSON-LD serves
// general + AI-mode crawlers. Unit coverage of the builders lives in
// tests/unit/citation.test.ts; this spec confirms they reach the rendered head.
import { expect, test } from "@playwright/test";

const JOURNAL_PUB = "publications/intefl-mis-2026/";

test.describe("publication detail — Highwire citation_* meta tags", () => {
  test("emits title, one author tag per author, journal venue, and DOI", async ({ page }) => {
    await page.goto(JOURNAL_PUB);
    await expect(page.locator('meta[name="citation_title"]')).toHaveAttribute(
      "content",
      /InteFL Framework/,
    );
    await expect(page.locator('meta[name="citation_author"]')).toHaveCount(5);
    await expect(page.locator('meta[name="citation_publication_date"]')).toHaveAttribute(
      "content",
      "2026",
    );
    await expect(page.locator('meta[name="citation_journal_title"]')).toHaveAttribute(
      "content",
      "IEEE Intelligent Systems",
    );
    await expect(page.locator('meta[name="citation_doi"]')).toHaveAttribute(
      "content",
      "10.1109/MIS.2026.3658072",
    );
  });
});

test.describe("publication detail — ScholarlyArticle JSON-LD", () => {
  test("embeds a single valid ScholarlyArticle block with authors and DOI", async ({ page }) => {
    await page.goto(JOURNAL_PUB);
    const ld = page.locator('script[type="application/ld+json"]');
    await expect(ld).toHaveCount(1);

    const parsed = JSON.parse((await ld.textContent()) ?? "{}");
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("ScholarlyArticle");
    expect(parsed.author).toHaveLength(5);
    expect(parsed.isPartOf).toEqual({ "@type": "Periodical", name: "IEEE Intelligent Systems" });
    expect(parsed.identifier.value).toBe("10.1109/MIS.2026.3658072");
  });
});
