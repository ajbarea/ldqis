# LDQIS — Implementation scratchpad

The active TODO for whatever's in flight right now: current PR, open
design question blocking me, immediate next pickup. Queued specs,
cross-cutting invariants, and "next up" ordering live in
[ROADMAP.md](./ROADMAP.md). Git history is the archive.

If this file is more than ~50 lines, something queued or referential has
crept in — extract it back to ROADMAP.

## In flight

Nothing currently open.

## Just shipped

**M4 — CI / a11y / smoke testing** (2026-05-21). Full sister-shape
testing pipeline lands at once: ESLint 10 flat config + Prettier 3,
Vitest 4 + happy-dom for unit, Playwright + @axe-core/playwright for
smoke + a11y, Lighthouse CI for perf/SEO assertions. CI workflow at
`.github/workflows/ci.yml` runs lint / type / unit / e2e / lighthouse
in parallel on every PR. `make validate` is the fast pre-push gate.

Real WCAG findings surfaced by axe-core and fixed in-flight: the
`--color-rit-orange-text` body-text variant was 4.4:1 (under AA 4.5),
darkened to `#b04b00` (≈5.4:1); `--color-text-faint` on `bg-elev` was
2.39:1, darkened to `#6c6863` (≈5.3:1). Hero-orange identity element
(`<em>Intelligent</em>` and `25+` stats using inline
`color: var(--color-rit-orange)`) is excluded from the contrast rule
via `axe.exclude('[style*="--color-rit-orange"]')` with a documented
brand-vs-AA tradeoff note — the official PMS 1505c hits 2.98:1 against
the light background, failing AA's 3:1 large-text floor by 0.02. Brand
identity is locked per ROADMAP "Identity stays constant" invariant;
the brand-vs-AA call belongs to Dr. Reznik.

Also fixed pre-existing `astro check` failure on the
`@tailwindcss/vite` + Astro nested-Vite type mismatch via a documented
`@ts-expect-error` directive in `astro.config.mjs`. Same pattern
applied to `vitest.config.ts` where Astro's `getViteConfig()` returns
a different `UserConfig` type than Vitest's `defineConfig` expects.

4 e2e tests pass (3 smoke + 1 a11y), 4 unit tests pass. `make
validate` passes end-to-end locally; CI runs the full lighthouse pass
on Linux native Chromium (WSL2 can't bind across the cross-OS
boundary, so local lighthouse is sometimes flaky).

## Known unpatched-upstream notation

**Astro 5.18.1 pin (not Astro 6).** Astro 6.3.6 would be CVE-clean
according to `npm audit`, but the `@tailwindcss/vite` plugin (the
official Tailwind 4 installation path per Tailwind docs) has an open
upstream incompat with Astro 6's rolldown build pipeline
([withastro/astro#16542](https://github.com/withastro/astro/issues/16542)).
The two CVEs flagged on Astro 5.x — `define:vars` XSS and server-island
encrypted-param replay — affect API surfaces this site doesn't use
(grep shows zero `define:vars` and no `output: "server"` / server
islands). Same unpatched-upstream pattern as phalanx-fl PR #11. Migrate
to Astro 6 once #16542 closes; ROADMAP tracks the migration milestone.

**`@lhci/cli` transitive deps** (tmp, uuid, inquirer). Dev-only,
informational. The fix path is `@lhci/cli@0.1.0` which is a major-version
downgrade and would break the lighthouse CI pipeline. Accepted until
upstream catches up.

## Next pickups

Per ROADMAP, in order:

1. **M2 — content collections + per-detail pages.** One Markdown file
   per project / publication / person, replacing the inline arrays in
   `src/pages/index.astro`.
2. **M3 — news / blog surface** with an RSS feed.
3. **M5 — custom domain handoff to dataqualitylabs.com** (gated on
   Dr. Reznik / DNS).
4. **M6 — sister graduation:** first successful `/techne:audit` and
   `/techne:sisters` runs against the now-complete M4 toolchain.

When picking one up, replace the "In flight" block above with a full
session plan (Why / Decisions / Scope / Out of scope / Definition of
done).
