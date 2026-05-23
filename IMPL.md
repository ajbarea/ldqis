# LDQIS — Implementation scratchpad

The active TODO for whatever's in flight right now: current PR, open
design question blocking me, immediate next pickup. Queued specs,
cross-cutting invariants, and "next up" ordering live in
[ROADMAP.md](./ROADMAP.md). Git history is the archive.

If this file is more than ~50 lines, something queued or referential has
crept in — extract it back to ROADMAP.

## In flight

### 2026-05-23 — CI codecov upload

**Why.** Vitest already emits lcov by default (configured in `vitest.config.ts`)
but the `unit` job ran `vitest run` without `--coverage` and there was no
upload step, so coverage was never visible in PRs. Sisters parity:
vFL/kourai upload coverage already; ldqis was the outlier.

**Decisions.**

- Update the `unit` job CI step to run with `--coverage` and emit a junit
  XML alongside the default reporter (Vitest 4 multi-reporter dot-notation).
- Add two `codecov/codecov-action@v6.0.1` steps mirroring the vFL pattern:
  coverage upload (`flags: unit`) and test-results upload
  (`report_type: test_results`).
- `disable_search: true` + `fail_ci_if_error: false` per the sister convention.
- research(2026-05): v8 provider stays; the .vue-specific NaN BRDA bug
  (vitest #9725) doesn't affect .astro/.ts sources, and 4.1.7 > the 4.0.18
  reproducer.

**Definition of done.**

- Local: `npx vitest run --coverage --reporter=junit ...` emits
  `coverage/lcov.info` + `test-results/junit.xml`. ✓
- CI: codecov check appears on the PR with `unit` flag.
- README claims gate still passes (no new fragile claims introduced).

## Known unpatched-upstream notation

**Astro 5.18.1 pin (not Astro 6).** `@tailwindcss/vite` (official Tailwind 4 path) has an open upstream incompat with Astro 6's rolldown pipeline ([withastro/astro#16542](https://github.com/withastro/astro/issues/16542)). The two CVEs flagged on Astro 5.x — `define:vars` XSS and server-island encrypted-param replay — don't affect this site (zero `define:vars`, no `output: "server"`). Migrate when #16542 closes.

**`@lhci/cli` transitive deps** (tmp, uuid, inquirer). Dev-only, informational. Fix path is a major-version downgrade that would break the lighthouse pipeline. Accepted.

## Next pickups

Per ROADMAP, in order:

1. **M2-followup — cross-linking detail pages.** Project pages → contributing people, people pages → project contributions, publications → author people pages. Needs schema extensions: `contributors: string[]` on projects, `projects_contributed: string[]` on people, `author_ids: string[]` on publications.
2. **M5 — custom domain handoff to dataqualitylabs.com** (gated on Dr. Reznik / DNS).

M3 (news / blog surface with RSS) shipped 2026-05-22. M6 (sister
graduation) shipped 2026-05-22 — `scripts/dev-runner.sh` + the first
`/techne:audit` and `/techne:sisters` runs closed it out. Fragile-
claims CI gate (`scripts/check-readme-claims.mjs`) shipped 2026-05-23
covering Makefile target list + GitHub Pages preview URL.

When picking one up, replace the "In flight" block above with a full session plan (Why / Decisions / Scope / Out of scope / Definition of done).
