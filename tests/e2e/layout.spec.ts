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

  // The signed-out screen has no textboxes, so the elements below stand in for the
  // ones Sveltia renders once signed in, including its asset text-edit textarea.
  test.describe("touch textboxes", () => {
    test.use({ hasTouch: true, isMobile: true });

    test("are at least 16px so iOS does not zoom on focus", async ({ page }) => {
      await page.goto("admin/");
      await expect(page.getByText("Powered by")).toBeVisible();
      const sizes = await page.evaluate(() => {
        document.body.insertAdjacentHTML(
          "beforeend",
          `<div class="wrapper svelte-1olui47"><textarea></textarea></div>
           <input type="text" /><textarea></textarea><select></select>
           <div contenteditable="true"></div>`,
        );
        return [...document.querySelectorAll("input, textarea, select, [contenteditable]")].map(
          (el) => parseFloat(getComputedStyle(el).fontSize),
        );
      });
      expect(sizes.length).toBe(5);
      for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16);
    });
  });
});
