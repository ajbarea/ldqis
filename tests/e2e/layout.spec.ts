// WCAG 1.4.10 (reflow at 320 px) and 2.4.11 (focus not obscured by the sticky
// header) on every built route. axe has no rules for either.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { ROUTES } from "./routes";

test.describe("reflow at 320 px", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of ROUTES) {
    test(`${path || "home"}`, async ({ page }) => {
      await page.goto(path);
      const { scroll, client } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(scroll).toBeLessThanOrEqual(client);
    });
  }
});

test.describe("focus not obscured", () => {
  for (const path of ROUTES) {
    for (const [dir, key] of [
      ["forward", "Tab"],
      ["backward", "Shift+Tab"],
    ] as const) {
      test(`${path || "home"} (${dir})`, async ({ page }) => {
        await page.goto(path);
        // Shift+Tab from the top wraps to the end, then walks the page backward.
        const stops = await page.evaluate(
          () =>
            document.querySelectorAll(
              'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ).length,
        );
        if (dir === "backward") await page.keyboard.press("Shift+Tab");
        const covered: string[] = [];
        for (let i = 0; i < stops + 2; i++) {
          await page.keyboard.press(key);
          const hit = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height) return null;
            for (const h of document.querySelectorAll("nav, header")) {
              if (h.contains(el)) continue;
              const pos = getComputedStyle(h).position;
              if (pos !== "sticky" && pos !== "fixed") continue;
              const b = h.getBoundingClientRect();
              const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
              const inside =
                r.top >= b.top && r.bottom <= b.bottom && r.left >= b.left && r.right <= b.right;
              if (inside && top && h.contains(top) && !el.contains(top))
                return `${el.tagName} ${(el.textContent ?? "").trim().slice(0, 40)}`;
            }
            return null;
          });
          if (hit) covered.push(hit);
        }
        expect(covered, `focus fully under the sticky header on ${path}`).toEqual([]);
      });
    }
  }
});

test.describe("admin", () => {
  test("keeps pinch zoom", async ({ page }) => {
    await page.goto("admin/");
    await expect(page.getByText("Powered by")).toBeVisible();
    const metas = await page.evaluate(() =>
      [...document.querySelectorAll('meta[name="viewport"]')].map((m) => m.getAttribute("content")),
    );
    expect(metas.length).toBeGreaterThan(0);
    for (const c of metas) expect(c).not.toMatch(/maximum-scale|user-scalable/);
  });

  // The signed-out screen has no textboxes, and Sveltia's scoped styles only exist once its
  // editor mounts. So the test takes the real scoped CSS and class hashes from the loaded
  // bundle, injects it after our styles (as the bundle does), and renders stand-in elements
  // for the rules that set a textbox font size. It fails if Sveltia's markup changes enough
  // that no such rule is found.
  const RULES = [
    { sel: /\binput\.(svelte-\w+)\s*\{/, html: (h: string) => `<input class="${h}" />` },
    {
      sel: /:is\(textarea\.(svelte-\w+)/,
      html: (h: string) => `<textarea class="${h}"></textarea>`,
    },
    {
      sel: /\.lexical-root\.(svelte-\w+)\s*\{/,
      html: (h: string) => `<div class="lexical-root ${h}" contenteditable="true"></div>`,
    },
    {
      sel: /\.wrapper\.(svelte-\w+)\s*\{display:contents;textarea/,
      html: (h: string) => `<div class="wrapper ${h}"><textarea></textarea></div>`,
    },
  ];

  async function mountSveltiaTextboxes(page: import("@playwright/test").Page) {
    await page.goto("admin/");
    await expect(page.getByText("Powered by")).toBeVisible();
    const bundle = readFileSync(join(process.cwd(), "dist/admin/cms/sveltia-cms.js"), "utf8");
    const css = [...bundle.matchAll(/code:`([^`]*)`/g)]
      .map((m) => m[1])
      .filter((c) => /font-size:var\(--sui-(textbox-font-size|font-size-monospace)\)/.test(c));
    const html = RULES.map((r) => {
      const hash = css.join("\n").match(r.sel)?.[1];
      expect(hash, `no Sveltia rule matches ${r.sel}`).toBeTruthy();
      return r.html(hash as string);
    });
    await page.evaluate(
      ({ css, html }) => {
        document.head.insertAdjacentHTML("beforeend", `<style>${css.join("\n")}</style>`);
        document.body.insertAdjacentHTML("beforeend", html.join(""));
      },
      { css, html },
    );
  }

  const sizes = (page: import("@playwright/test").Page) =>
    page.evaluate(() =>
      [
        ...document.querySelectorAll(
          'body > input, body > textarea, body > [contenteditable]:not([contenteditable="false"]), body > .wrapper textarea',
        ),
      ].map((el) => parseFloat(getComputedStyle(el).fontSize)),
    );

  test("desktop keeps Sveltia's 15px textbox size", async ({ page }) => {
    await mountSveltiaTextboxes(page);
    const size = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.querySelector("textarea[class*=svelte-]")!).fontSize),
    );
    expect(size).toBe(15);
  });

  test.describe("touch textboxes", () => {
    test.use({ hasTouch: true, isMobile: true });

    test("are at least 16px so iOS does not zoom on focus", async ({ page }) => {
      await mountSveltiaTextboxes(page);
      const all = await sizes(page);
      expect(all.length).toBe(RULES.length);
      for (const size of all) expect(size).toBeGreaterThanOrEqual(16);
    });
  });
});
