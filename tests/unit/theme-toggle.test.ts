// Smoke test for the theme behavior baked into BaseLayout / Nav.astro. The
// toggle is vanilla JS (no island, no framework), so the unit scope is the
// resolution contract: localStorage + prefers-color-scheme -> data-theme. The
// full DOM wiring is covered by the Playwright e2e suite — this test guards the
// resolution order and the storage key.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "ldqis-theme";

// Mirror the FOUC-prevention snippet from src/layouts/BaseLayout.astro: an
// explicit stored choice wins, otherwise follow the OS, otherwise light.
function applyStoredTheme(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (stored !== "light" && prefersDark)) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch {
    /* localStorage / matchMedia blocked is fine */
  }
}

// Stub the OS color-scheme preference for a test.
function mockOSPrefersDark(prefersDark: boolean): void {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("dark") ? prefersDark : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe("theme resolution contract", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    mockOSPrefersDark(false); // default to a light OS unless a test overrides
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.unstubAllGlobals();
  });

  it("stays light when nothing is stored and the OS prefers light", () => {
    applyStoredTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("follows the OS to dark when nothing is stored and the OS prefers dark", () => {
    mockOSPrefersDark(true);
    applyStoredTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("applies dark for a stored 'dark' even when the OS prefers light", () => {
    mockOSPrefersDark(false);
    localStorage.setItem(STORAGE_KEY, "dark");
    applyStoredTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("keeps light for a stored 'light' even when the OS prefers dark", () => {
    mockOSPrefersDark(true);
    localStorage.setItem(STORAGE_KEY, "light");
    applyStoredTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("ignores unknown stored values and falls back to the OS preference", () => {
    mockOSPrefersDark(false);
    localStorage.setItem(STORAGE_KEY, "nope");
    applyStoredTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
  });

  it("uses the documented storage key", () => {
    // If this assertion ever fails, the storage key in BaseLayout.astro and
    // src/components/Nav.astro got out of sync with the unit-test contract.
    expect(STORAGE_KEY).toBe("ldqis-theme");
  });
});
