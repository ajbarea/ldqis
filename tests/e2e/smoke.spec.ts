// Smoke tests: confirm the homepage loads, the skip-link is reachable from
// keyboard, and the theme toggle round-trips through localStorage. The M4
// definition-of-done calls out theme-toggle and skip-link as preserved
// affordances; this spec is the per-PR guard.
import { expect, test } from "@playwright/test";

test.describe("LDQIS homepage smoke", () => {
  test("loads with the LDQIS title", async ({ page }) => {
    await page.goto("");
    await expect(page).toHaveTitle(/LDQIS/);
  });

  test("skip-link is the first focusable element", async ({ page }) => {
    await page.goto("");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText(/skip to main content/i);
    await expect(focused).toHaveAttribute("href", "#main");
  });

  test("theme toggle flips data-theme and persists across reloads", async ({ page }) => {
    await page.goto("");
    const html = page.locator("html");

    // Default: light (no data-theme attribute).
    await expect(html).not.toHaveAttribute("data-theme", "dark");

    // Toggle once -> dark.
    await page.locator("#theme-toggle").click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    // localStorage was written.
    const stored = await page.evaluate(() => localStorage.getItem("ldqis-theme"));
    expect(stored).toBe("dark");

    // Reload -> still dark (FOUC-prevention script reapplies before paint).
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Toggle back -> light, attribute removed.
    await page.locator("#theme-toggle").click();
    await expect(html).not.toHaveAttribute("data-theme", "dark");
    const storedAfter = await page.evaluate(() => localStorage.getItem("ldqis-theme"));
    expect(storedAfter).toBe("light");
  });
});
