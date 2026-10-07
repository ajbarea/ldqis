// Per-PR axe-core scan of every built route in both themes, with no exclusions.
// Routes come from dist/ (see routes.ts), /admin included, so new pages are covered
// automatically.
//
// research(2026-05): axe-core catches ~57% of WCAG issues by volume per the
// Deque eval; manual and assistive-tech review covers the rest. Treat this gate
// as a floor. WCAG 2.2 AA is the lab's stated bar (ROADMAP Guiding principles).
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES, THEMES } from "./routes";

for (const theme of THEMES) {
  test.describe(`a11y (${theme})`, () => {
    test.use({ colorScheme: theme });

    for (const path of ROUTES) {
      test(`${path || "home"}`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("ldqis-theme", t), theme);
        await page.goto(path);
        // /admin is the CMS app: it renders after load and follows the OS theme.
        if (path.startsWith("admin/")) {
          await expect(page.getByText("Powered by")).toBeVisible();
        } else {
          const dark = await page.evaluate(
            () => document.documentElement.getAttribute("data-theme") === "dark",
          );
          expect(dark).toBe(theme === "dark");
        }
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();

        expect(
          results.violations,
          `axe-core found WCAG violations on ${path} (${theme}):\n${JSON.stringify(results.violations, null, 2)}`,
        ).toEqual([]);
      });
    }
  });
}

// The search dialog in its open state, with a result list showing.
for (const theme of THEMES) {
  test.describe(`a11y, search open (${theme})`, () => {
    test.use({ colorScheme: theme });

    for (const path of ["", "news/"]) {
      test(`${path || "home"}`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("ldqis-theme", t), theme);
        await page.goto(path);
        await page.getByRole("button", { name: "Search" }).click();
        const dialog = page.getByRole("dialog");
        await dialog.locator("input").first().fill("Reznik");
        await expect(dialog.locator('a[href*="people/leon-reznik"]').first()).toBeVisible();
        // Select a result with the keyboard, so the selected-card colours are scanned too.
        await expect(dialog.locator("a.pf-result-link").first()).toBeVisible();
        await page.keyboard.press("ArrowDown");
        await expect(dialog.locator("[data-pf-selected]")).toHaveCount(1);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          results.violations,
          `axe-core found WCAG violations with search open on ${path} (${theme}):\n${JSON.stringify(results.violations, null, 2)}`,
        ).toEqual([]);
      });
    }
  });
}

// axe's full ruleset (best-practice rules such as landmark uniqueness), once per route.
test.describe("axe, all rules", () => {
  for (const path of ROUTES) {
    test(`${path || "home"}`, async ({ page }) => {
      await page.goto(path);
      if (path.startsWith("admin/")) await expect(page.getByText("Powered by")).toBeVisible();
      // Sveltia renders /admin outside any landmark; every other rule still applies there.
      const axe = new AxeBuilder({ page });
      if (path.startsWith("admin/")) axe.disableRules(["region", "landmark-one-main"]);
      const results = await axe.analyze();
      expect(
        results.violations,
        `axe-core found violations on ${path}:\n${JSON.stringify(results.violations, null, 2)}`,
      ).toEqual([]);
    });
  }
});
