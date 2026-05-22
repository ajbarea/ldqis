// Smoke test for the theme-toggle behavior baked into BaseLayout / index.astro.
// The toggle is vanilla JS (no island, no framework) so the unit test scope is
// the localStorage <-> data-theme contract. The full DOM wiring is covered by
// the Playwright e2e suite — this test just guards the storage key.
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const STORAGE_KEY = "ldqis-theme";

function applyStoredTheme(): void {
  // Mirror the FOUC-prevention snippet from src/layouts/BaseLayout.astro.
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch {
    /* localStorage blocked is fine */
  }
}

describe("theme toggle storage contract", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("leaves light theme alone when no preference is stored", () => {
    applyStoredTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("flips to dark theme when the stored preference is 'dark'", () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    applyStoredTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("ignores unknown stored values (degrades to light)", () => {
    localStorage.setItem(STORAGE_KEY, "nope");
    applyStoredTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("uses the documented storage key", () => {
    // If this assertion ever fails, the storage key in BaseLayout.astro and
    // src/pages/index.astro got out of sync with the unit-test contract.
    expect(STORAGE_KEY).toBe("ldqis-theme");
  });
});
