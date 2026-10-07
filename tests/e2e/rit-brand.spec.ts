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

  // The modifier the page itself picks: Cmd on macOS, Ctrl elsewhere.
  const MOD = process.platform === "darwin" ? "Meta" : "Control";
  test("the platform shortcut opens it from the page, not from inside a text field", async ({
    page,
  }) => {
    await page.goto("");
    await page.evaluate(() => {
      const input = document.createElement("input");
      input.id = "scratch";
      input.setAttribute("aria-label", "scratch");
      document.querySelector("main")!.append(input);
    });
    await page.locator("#scratch").focus();
    await page.keyboard.press(`${MOD}+k`);
    await expect(dialogOf(page)).toBeHidden();
    await page.locator("#scratch").blur();
    await page.keyboard.press(`${MOD}+k`);
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

  test("a failed bundle load says so and the next try retries", async ({ page }) => {
    await page.route("**/pagefind/pagefind-component-ui.js", (r) => r.abort());
    await page.goto("");
    const trigger = page.getByRole("button", { name: "Search" });
    await trigger.click();
    await expect(page.locator("#search-status")).toHaveText(/unavailable/);
    await expect(trigger).toBeVisible();
    await page.unroute("**/pagefind/pagefind-component-ui.js");
    await trigger.click();
    await expect(dialogOf(page)).toBeVisible();
    await expect(page.locator("#search-status")).toHaveText("");
  });

  test("a slow bundle shows progress and still opens on one click", async ({ page }) => {
    test.setTimeout(60_000);
    await page.route("**/pagefind/pagefind-component-ui.js", async (r) => {
      await new Promise((done) => setTimeout(done, 9000));
      await r.continue();
    });
    await page.goto("");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.locator("#search-status")).toHaveText("Loading search…");
    await expect(dialogOf(page)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#search-status")).toHaveText("");
  });

  test("results are titled by page and homepage listings do not match", async ({ page }) => {
    await page.goto("");
    await page.getByRole("button", { name: "Search" }).click();
    // This title is listed on the homepage and has its own page.
    const dialog = await search(page, "Optimizing Federated Learning with Metacognition");
    const hit = dialog.locator('a[href*="publications/intefl-mis-2026"]').first();
    await expect(hit).toContainText(/InteFL/);
    await expect(dialog.getByText("· LDQIS")).toHaveCount(0);
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

  // WCAG 1.4.3 on what Pagefind paints: the match highlight in excerpts and the title of the
  // keyboard-selected card, each against its real (composited) background.
  for (const theme of ["light", "dark"] as const) {
    test(`excerpt marks and the selected result are AA (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("ldqis-theme", t), theme);
      await page.goto("");
      await page.getByRole("button", { name: "Search" }).click();
      const dialog = await search(page, "Reznik");
      await expect(dialog.locator("a.pf-result-link").first()).toBeVisible();
      await page.keyboard.press("ArrowDown");
      const selected = dialog.locator("[data-pf-selected]");
      await expect(selected).toHaveCount(1);
      const ratios = await page.evaluate(() => {
        const rgba = (css: string) => {
          const c = document
            .createElement("canvas")
            .getContext("2d", { willReadFrequently: true })!;
          c.clearRect(0, 0, 1, 1);
          c.fillStyle = css;
          c.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = c.getImageData(0, 0, 1, 1).data;
          return { r, g, b, a: a / 255 };
        };
        const over = (top: ReturnType<typeof rgba>, bottom: ReturnType<typeof rgba>) => ({
          r: top.r * top.a + bottom.r * (1 - top.a),
          g: top.g * top.a + bottom.g * (1 - top.a),
          b: top.b * top.a + bottom.b * (1 - top.a),
          a: 1,
        });
        const background = (el: Element) => {
          const layers: ReturnType<typeof rgba>[] = [];
          for (let n: Element | null = el; n; n = n.parentElement)
            layers.push(rgba(getComputedStyle(n).backgroundColor));
          return layers.reduceRight((acc, l) => over(l, acc), { r: 255, g: 255, b: 255, a: 1 });
        };
        const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
          const f = (v: number) => {
            const x = v / 255;
            return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const ratio = (el: Element) => {
          const bg = background(el);
          const fg = over(rgba(getComputedStyle(el).color), bg);
          const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
          return (hi + 0.05) / (lo + 0.05);
        };
        const marks = [...document.querySelectorAll("dialog mark")];
        const card = document
          .querySelector("dialog [data-pf-selected]")!
          .closest(".pf-result-card")!;
        const title = card.querySelector("a.pf-result-link")!;
        const excerpt = card.querySelector(".pf-result-excerpt")!;
        return {
          marks: marks.map(ratio),
          title: ratio(title),
          excerpt: ratio(excerpt),
          count: marks.length,
        };
      });
      expect(ratios.count).toBeGreaterThan(0);
      for (const r of ratios.marks) expect(r).toBeGreaterThanOrEqual(4.5);
      expect(ratios.title).toBeGreaterThanOrEqual(4.5);
      expect(ratios.excerpt).toBeGreaterThanOrEqual(4.5);
    });
  }

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
