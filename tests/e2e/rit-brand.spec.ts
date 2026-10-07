// RIT brand requirements: the black footer with its required links on every page, and
// site search in the header.
import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

const REQUIRED = {
  "Land Acknowledgment": "https://www.rit.edu/land-acknowledgment",
  Disclaimer: "https://www.rit.edu/disclaimer",
  "Copyright Infringement": "https://www.rit.edu/copyright-infringement",
  "Privacy Statement": "https://www.rit.edu/legalcomplianceaudit/privacy-rit",
  Nondiscrimination: "https://www.rit.edu/nondiscrimination",
  "Emergency Information": "https://www.rit.edu/emergency-information",
  Accessibility: "https://www.rit.edu/accessibility",
};
const NAV = ["Research", "Projects", "Publications", "People", "News"];

// /admin is the CMS app, not a site page.
const PAGES = ROUTES.filter((p) => !p.startsWith("admin/"));

test.describe("RIT footer", () => {
  for (const theme of ["light", "dark"] as const) {
    test.describe(theme, () => {
      test.use({ colorScheme: theme });
      for (const path of PAGES) {
        test(`${path || "home"}`, async ({ page }) => {
          await page.addInitScript((t) => localStorage.setItem("ldqis-theme", t), theme);
          await page.goto(path);
          const footer = page.locator("footer#rit-footer");
          await expect(footer).toHaveCount(1);
          await expect(footer).toHaveCSS("background-color", "rgb(0, 0, 0)");
          await expect(
            footer.getByRole("img", { name: "Rochester Institute of Technology" }),
          ).toBeVisible();
          await expect(footer.getByRole("link", { name: "lrvcs@rit.edu" })).toBeVisible();
          await expect(footer.getByText("1 Lomb Memorial Drive")).toBeVisible();
          for (const [name, href] of Object.entries(REQUIRED))
            await expect(footer.getByRole("link", { name, exact: true })).toHaveAttribute(
              "href",
              href,
            );
          for (const name of NAV)
            await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
        });
      }
    });
  }
});

test.describe("site search", () => {
  test("the header button opens a labelled dialog, finds a page, and returns focus on Escape", async ({
    page,
  }) => {
    await page.goto("news/");
    const trigger = page.getByRole("button", { name: "Search" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const input = dialog
      .getByRole("searchbox")
      .or(dialog.getByRole("combobox"))
      .or(dialog.locator("input"));
    await expect(input.first()).toBeFocused();
    await input.first().fill("Reznik");
    const hit = dialog.locator('a[href*="people/leon-reznik"]').first();
    await expect(hit).toBeVisible();
    await expect(hit).toHaveAttribute("href", /\/ldqis\/people\/leon-reznik\/?/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a result opens its page under the base path", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Search" }).click();
    await page.getByRole("dialog").locator("input").first().fill("Reznik");
    await page.getByRole("dialog").locator('a[href*="people/leon-reznik"]').first().click();
    await expect(page).toHaveURL(/\/ldqis\/people\/leon-reznik\/?$/);
  });

  test("the keyboard shortcut opens it", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Search" }).waitFor();
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("admin and 404 are not indexed", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Search" }).click();
    await page.getByRole("dialog").locator("input").first().fill("Powered by");
    await expect(page.getByRole("dialog").locator('a[href*="admin"]')).toHaveCount(0);
  });
});
