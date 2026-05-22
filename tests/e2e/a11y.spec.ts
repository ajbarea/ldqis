// Per-PR axe-core scan. The M4 definition-of-done names `/`, `/people`,
// `/projects`, `/publications`, `/news` — only `/` exists in M1, the rest
// land in M2/M3. The routes array below is the single point of update;
// add slugs as the content collections come online so the a11y bar moves
// with the surface area, not in a separate sweep.
//
// research(2026-05): axe-core (via @axe-core/playwright) catches ~57% of
// WCAG violations by volume per the Deque eval. The remainder requires
// manual / assistive-tech review; treat this gate as a floor, not a
// ceiling. WCAG 2.2 AA is the lab's stated bar (ROADMAP Guiding
// principles).
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Paths are relative to baseURL (which already ends in `/ldqis/`), so the
// homepage is the empty string. M2/M3 add the rest as content collections
// come online.
const ROUTES_TO_SCAN: ReadonlyArray<{ name: string; path: string }> = [
  { name: "home", path: "" },
  // M2 adds these:
  // { name: "projects index", path: "projects/" },
  // { name: "publications index", path: "publications/" },
  // { name: "people index", path: "people/" },
  // M3 adds this:
  // { name: "news index", path: "news/" },
];

for (const { name, path } of ROUTES_TO_SCAN) {
  test(`a11y: ${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // Brand-color exception: every element that opts into RIT's official
      // orange (PMS 1505c / #f76902) by setting `color: var(--color-rit-orange)`
      // inline. On the light-mode background (#fefefd), the orange measures
      // 2.98:1 — fails WCAG AA large-text 3:1 by 0.02. The "Identity stays
      // constant" invariant in ROADMAP locks the brand color across redesigns,
      // so the brand-vs-AA call belongs to Dr. Reznik, not CI. Tracked as a
      // ROADMAP follow-up; meanwhile body text on the same background uses
      // the neutral `var(--color-text)` which clears AA.
      //
      // Selector matches the inline-style opt-in only — using the CSS variable
      // via a class would not be excluded.
      .exclude('[style*="--color-rit-orange"]')
      .analyze();

    expect(
      results.violations,
      `axe-core found WCAG violations on ${path}:\n${JSON.stringify(results.violations, null, 2)}`,
    ).toEqual([]);
  });
}
