import { describe, expect, it } from "vitest";

import { byRecency } from "../../src/lib/publications";

const pub = (year: string, title: string) => ({ data: { year, title } });

describe("byRecency", () => {
  it("orders newest year first, oldest last", () => {
    const got = [pub("2003", "A"), pub("2026", "B"), pub("2022", "C")].sort(byRecency);
    expect(got.map((p) => p.data.year)).toEqual(["2026", "2022", "2003"]);
  });

  it("breaks same-year ties by title", () => {
    const got = [pub("2024", "Trust-based"), pub("2024", "Federated")].sort(byRecency);
    expect(got.map((p) => p.data.title)).toEqual(["Federated", "Trust-based"]);
  });
});
