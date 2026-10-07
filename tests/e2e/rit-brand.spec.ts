// RIT brand requirements: the black footer with its required links on every page, and
// site search in the header.
import { expect, test, type Page } from "@playwright/test";
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
          await footer.scrollIntoViewIfNeeded();
          await expect(footer).toHaveCSS("background-color", "rgb(0, 0, 0)");
          await expect(
            footer.getByRole("img", { name: "Rochester Institute of Technology" }),
          ).toBeVisible();
          await expect(footer.getByRole("link", { name: "cs-dql@rit.edu" })).toBeVisible();
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

const dialogOf = (page: Page) => page.getByRole("dialog");
// The results summary reads "N results for ..." or "No results for ...".
async function search(page: Page, query: string) {
  const dialog = dialogOf(page);
  await dialog.locator("input").first().fill(query);
  await expect(dialog.getByText(/\bresults? for\b/i).first()).toBeVisible();
  return dialog;
}

test.describe("site search", () => {
  test("the header button opens a labelled dialog, finds a page, and returns focus on Escape", async ({
    page,
  }) => {
    await page.goto("news/");
    const trigger = page.getByRole("button", { name: "Search" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await trigger.click();
    await expect(dialogOf(page)).toBeVisible();
    await expect(dialogOf(page).locator("input").first()).toBeFocused();
    const dialog = await search(page, "Reznik");
    const hit = dialog.locator('a[href*="people/leon-reznik"]').first();
    await expect(hit).toHaveAttribute("href", /\/ldqis\/people\/leon-reznik\/?/);
    await expect(hit).toContainText("Reznik");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("a result opens its page under the base path", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Search" }).click();
    const dialog = await search(page, "Reznik");
    await dialog.locator('a[href*="people/leon-reznik"]').first().click();
    await expect(page).toHaveURL(/\/ldqis\/people\/leon-reznik\/?$/);
  });

  test("Ctrl+K opens it", async ({ page }) => {
    await page.goto("");
    await page.keyboard.press("Control+k");
    await expect(dialogOf(page)).toBeVisible();
    await expect(dialogOf(page).locator("input").first()).toBeFocused();
  });

  test("the Pagefind bundle loads on first use, not on page load", async ({ page }) => {
    const bundle: string[] = [];
    page.on("request", (r) => r.url().includes("/pagefind/") && bundle.push(r.url()));
    await page.goto("");
    await page.waitForLoadState("networkidle");
    expect(bundle.filter((u) => u.endsWith(".js"))).toEqual([]);
    await page.getByRole("button", { name: "Search" }).click();
    await expect(dialogOf(page)).toBeVisible();
    expect(bundle.some((u) => u.endsWith("pagefind-component-ui.js"))).toBe(true);
  });

  test("results are titled by page and homepage listings do not match", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Search" }).click();
    // This title is listed on the homepage and has its own page.
    const dialog = await search(page, "Optimizing Federated Learning with Metacognition");
    await expect(dialog.locator('a[href*="publications/intefl-mis-2026"]').first()).toContainText(
      /InteFL/,
    );
    await expect(dialog.locator('a[href$="/ldqis/"]')).toHaveCount(0);
  });

  // 404 and /admin must stay out of the index; the queries are text only they contain.
  for (const [name, query, pattern] of [
    ["404", "may have moved", /404/],
    ["admin", "Content editor", /admin/],
  ] as const) {
    test(`${name} is not indexed`, async ({ page }) => {
      await page.goto("");
      await page.getByRole("button", { name: "Search" }).click();
      const dialog = await search(page, query);
      const hrefs = await dialog
        .locator("a")
        .evaluateAll((a) => a.map((x) => x.getAttribute("href")));
      expect(hrefs.filter((h) => pattern.test(h ?? ""))).toEqual([]);
    });
  }

  test("every built route except 404 and admin is in the index", async ({ page }) => {
    await page.goto("");
    const urls = await page.evaluate(async () => {
      const pf = await import(`${document.baseURI}pagefind/pagefind.js`);
      const all = await pf.search(null);
      const data = await Promise.all(
        all.results.map((r: { data(): Promise<{ url: string }> }) => r.data()),
      );
      return data.map((d: { url: string }) => d.url);
    });
    const indexed = urls
      .map((u: string) => u.replace(/^\/ldqis\//, "").replace(/^\//, ""))
      .map((u: string) => u.replace(/\.html$/, ""))
      .sort();
    const expected = ROUTES.filter((p) => p !== "404.html" && !p.startsWith("admin/")).map((p) =>
      p.replace(/\.html$/, ""),
    );
    expect(indexed).toEqual([...expected].sort());
  });

  test("the header button matches the round transparent theme toggle", async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.addInitScript((t) => localStorage.setItem("ldqis-theme", t), theme);
      await page.goto("");
      const style = (id: string) =>
        page.locator(id).evaluate((el) => {
          const c = getComputedStyle(el);
          return {
            w: c.width,
            h: c.height,
            radius: c.borderRadius,
            bg: c.backgroundColor,
            border: c.borderTopWidth,
            color: c.color,
          };
        });
      const search = await style("#search-btn");
      expect(search).toEqual(await style("#theme-toggle"));
      expect(search).toMatchObject({ w: "36px", h: "36px", bg: "rgba(0, 0, 0, 0)" });
    }
  });

  test("the modal follows the site theme", async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.addInitScript((t) => localStorage.setItem("ldqis-theme", t), theme);
      await page.goto("");
      await page.getByRole("button", { name: "Search" }).click();
      await expect(dialogOf(page)).toBeVisible();
      const [pf, site] = await page.evaluate(() => {
        const dialog = document.querySelector("dialog")!;
        const pf = getComputedStyle(dialog).backgroundColor;
        const probe = document.createElement("i");
        probe.style.backgroundColor = "var(--color-bg)";
        document.body.append(probe);
        const site = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return [pf, site];
      });
      expect(pf).toBe(site);
    }
  });
});
