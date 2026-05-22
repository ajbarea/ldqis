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

**M2 — Content collections + per-detail pages** (2026-05-22). The
monolithic `src/pages/index.astro` (5 inline `const X = [...]`
arrays totaling ~200 lines of structured data) split into Astro 5
content collections: 4 projects + 3 publications + 24 people (7
current + 17 past cohort) each in their own Markdown file with
typed frontmatter validated by Zod schemas in `src/content.config.ts`.
Three dynamic-route templates — `src/pages/projects/[id].astro`,
`src/pages/publications/[id].astro`, `src/pages/people/[id].astro`
— prerender 31 detail pages. Build produces 32 pages total.

Research basis (2026-05): Astro 5's content layer dropped the Astro
4 `slug` reserved field — `glob({ pattern, base })` derives
`entry.id` from filenames, and dynamic routes key off that.
Verified against docs.astro.build/en/guides/content-collections
and docs.astro.build/en/reference/content-loader-reference.

Homepage cards now link into the detail layer:

- Project name → `/projects/[id]/`
- Publication title → `/publications/[id]/` (the IEEE / DOI link
  on the side stays external)
- Person name → `/people/[id]/`

A11y spec `ROUTES_TO_SCAN` extended from 1 to 6 routes covering one
representative detail per collection plus both lead/no-lead person
variants and one past-cohort entry (no-email path). 9 e2e tests
pass (was 4).

Out-of-scope cross-linking (project pages → contributing people,
people pages → project contributions, publications → author people
pages) filed as M2-followup. The data dependency goes the wrong way
(no co-author field on publications, no `projects_contributed` on
people) and adding that scaffolding mid-migration would have
ballooned the diff. The detail pages today are minimal but provide
stable URLs alumni / authors can cite from CVs.

`make validate` end-to-end clean: lint, astro check (0 errors / 0
warnings / 0 hints over 14 Astro files), 4 unit tests, 9 e2e tests,
build (32 pages).

## Previously shipped

**M4 — CI / a11y / smoke testing** (2026-05-21). Full sister-shape
testing pipeline lands at once: ESLint 10 flat config + Prettier 3,
Vitest 4 + happy-dom for unit, Playwright + @axe-core/playwright for
smoke + a11y, Lighthouse CI for perf/SEO assertions. CI workflow at
`.github/workflows/ci.yml` runs lint / type / unit / e2e / lighthouse
in parallel on every PR. `make validate` is the fast pre-push gate.
Real WCAG findings fixed in-flight; brand-vs-AA exception filed.
See M4 in ROADMAP.md for the full landed-vs-deferred DoD checklist.

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

1. **M3 — news / blog surface** with an RSS feed.
2. **M2-followup — cross-linking detail pages.** Project pages →
   contributing people, people pages → project contributions,
   publications → author people pages. Needs schema extensions:
   `contributors: string[]` on projects, `projects_contributed:
string[]` on people, `author_ids: string[]` on publications.
3. **M5 — custom domain handoff to dataqualitylabs.com** (gated on
   Dr. Reznik / DNS).
4. **M6 — sister graduation:** first successful `/techne:audit` and
   `/techne:sisters` runs against the now-complete M4 toolchain.

When picking one up, replace the "In flight" block above with a full
session plan (Why / Decisions / Scope / Out of scope / Definition of
done).
