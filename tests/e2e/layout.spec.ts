// WCAG 1.4.10 (reflow at 320 px) and 2.4.11 (focus not obscured by the sticky
// header) on every built route. axe has no rules for either.
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
  // editor mounts. So this fetches the served bundle, takes its real scoped CSS and class
  // hashes, injects the CSS after our styles (as the bundle does), and renders stand-in
  // elements for its textbox rules. Coverage is limited to textboxes sized through
  // --sui-textbox-font-size or --sui-font-size-monospace: the guard test fails if any
  // input, textarea or contenteditable rule sizes its text another way, but it cannot see
  // elements Sveltia renders with no matching rule at all.
  const SIZE_VARS = /var\(--sui-(textbox-font-size|font-size-monospace)\b/;

  // The `code:` template literals in the bundle, unescaped, each with balanced braces.
  function extractCss(bundle: string): string[] {
    const blocks: string[] = [];
    for (const m of bundle.matchAll(/code:`/g)) {
      let out = "";
      let i = m.index + m[0].length;
      for (; i < bundle.length && bundle[i] !== "`"; i++) {
        if (bundle[i] === "\\") i++;
        out += bundle[i];
      }
      const open = out.split("{").length - 1;
      const close = out.split("}").length - 1;
      if (open !== close)
        throw new Error(`unbalanced braces in a Sveltia CSS block: ${out.slice(0, 80)}`);
      blocks.push(out);
    }
    return blocks;
  }

  // The last compound selector of one comma-separated part, outside any parentheses.
  function subject(part: string): string {
    let depth = 0;
    let start = 0;
    for (let i = 0; i < part.length; i++) {
      const c = part[i];
      if (c === "(" || c === "[") depth++;
      else if (c === ")" || c === "]") depth--;
      else if (depth === 0 && /[\s>+~]/.test(c)) start = i + 1;
    }
    return part.slice(start);
  }

  function splitTop(sel: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < sel.length; i++) {
      if (sel[i] === "(" || sel[i] === "[") depth++;
      else if (sel[i] === ")" || sel[i] === "]") depth--;
      else if (sel[i] === "," && depth === 0) {
        parts.push(sel.slice(start, i));
        start = i + 1;
      }
    }
    return [...parts, sel.slice(start)].map((p) => p.trim());
  }

  const STAND_INS = [
    {
      name: "text input",
      sel: /\binput\.(svelte-\w+)\s*\{/,
      html: (h: string) => `<input class="${h}" />`,
      desktop: 15,
    },
    {
      name: "date-time input",
      sel: /\binput\.(svelte-\w+)\s*\{/,
      html: (h: string) => `<input type="datetime-local" class="${h}" />`,
      desktop: 15,
    },
    {
      name: "textarea",
      sel: /:is\(textarea\.(svelte-\w+)/,
      html: (h: string) => `<textarea class="${h}"></textarea>`,
      desktop: 15,
    },
    {
      name: "rich text",
      sel: /\.lexical-root\.(svelte-\w+)\s*\{/,
      html: (h: string) => `<div class="lexical-root ${h}" contenteditable="true"></div>`,
      desktop: 15,
    },
    {
      name: "asset text-edit textarea",
      sel: /\.wrapper\.(svelte-\w+)\s*\{display:contents;textarea/,
      html: (h: string) => `<div class="wrapper ${h}"><textarea></textarea></div>`,
      desktop: 14.4, // 0.9em of the 16px body here
    },
  ];

  type Page = import("@playwright/test").Page;

  async function mountSveltiaTextboxes(page: Page): Promise<string[]> {
    await page.goto("admin/");
    await expect(page.getByText("Powered by")).toBeVisible();
    const bundle = await (await page.request.get("admin/cms/sveltia-cms.js")).text();
    const all = extractCss(bundle);
    const css = all.filter((c) => SIZE_VARS.test(c)).join("\n");
    const html = STAND_INS.map((r) => {
      const hash = css.match(r.sel)?.[1];
      expect(hash, `no Sveltia rule matches ${r.name}`).toBeTruthy();
      return r.html(hash as string);
    });
    await page.evaluate(
      ({ css, html }) => {
        document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);
        document.body.insertAdjacentHTML("beforeend", html.join(""));
      },
      { css, html },
    );
    return all;
  }

  const sizes = (page: Page) =>
    page.evaluate(() =>
      [...document.body.children]
        .map((el) => (el.matches("div.wrapper") ? el.querySelector("textarea")! : el))
        .filter((el) => el.matches("input, textarea, [contenteditable]"))
        .map((el) => parseFloat(getComputedStyle(el).fontSize)),
    );

  test("every textbox rule sizes text through the two variables", async ({ page }) => {
    const all = await mountSveltiaTextboxes(page);
    const offenders: string[] = [];
    let checked = 0;
    for (const block of all) {
      for (const m of block.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
        const size = m[2].match(/(?:^|[;\s])font-size:([^;]*)/)?.[1];
        if (size === undefined) continue;
        const textbox = splitTop(m[1]).some((part) =>
          /^(input|textarea)\b|^\.lexical-root\b|\[contenteditable|:is\([^)]*\b(input|textarea)\b/.test(
            subject(part),
          ),
        );
        if (!textbox) continue;
        checked++;
        if (!SIZE_VARS.test(size)) offenders.push(`${m[1].trim()} { font-size:${size} }`);
      }
    }
    expect(checked).toBeGreaterThanOrEqual(STAND_INS.length - 1);
    expect(offenders, "textbox rules that bypass the size variables").toEqual([]);
  });

  test("desktop keeps Sveltia's textbox sizes", async ({ page }) => {
    await mountSveltiaTextboxes(page);
    expect(await sizes(page)).toEqual(STAND_INS.map((r) => r.desktop));
  });

  test.describe("touch textboxes", () => {
    test.use({ hasTouch: true, isMobile: true });

    test("are at least 16px so iOS does not zoom on focus", async ({ page }) => {
      await mountSveltiaTextboxes(page);
      const all = await sizes(page);
      expect(all.length).toBe(STAND_INS.length);
      for (const size of all) expect(size).toBeGreaterThanOrEqual(16);
    });

    test("inline code keeps its desktop size", async ({ page }) => {
      await mountSveltiaTextboxes(page);
      const { code, body } = await page.evaluate(() => {
        document.body.insertAdjacentHTML("beforeend", "<code>x</code>");
        const size = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
        return { code: size(document.body.lastElementChild!), body: size(document.body) };
      });
      expect(code).toBeCloseTo(body * 0.9, 5);
    });
  });
});
