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

**M1 — v0 scaffold** (2026-05-21). New repo at `ajbarea/ldqis`, Astro
5.18.1 + Tailwind 4 + GitHub Pages, homepage cherry-picked from the
2026-05-21 Claude Cowork dql.html demo and ported into Astro
components with the official RIT branding intact (PMS 1505c orange,
F6BE00 yellow, Instrument Serif + Inter pair, dark mode with
localStorage persistence, skip-link, prefers-reduced-motion, OG
metadata). Live preview: <https://ajbarea.github.io/ldqis/>.

Two stacked bugs caught on the first deploy + fixed before AJ's first
inspection landed: (1) base path missing for project-page deploy (CSS
404'd on `/ldqis/`), (2) Tailwind 4 doesn't generate the
arbitrary-bracket `[var(--color-foo)]` utility syntax in this setup —
rewrote 13 class patterns to use the auto-generated named utilities
from `@theme` tokens (`bg-bg`, `text-text-dim`, `border-line`, etc.).
Both fixed in `66f78ed`.

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

## Next pickups

Per ROADMAP, in order:

1. **M2 — content collections + per-detail pages.** One Markdown file
   per project / publication / person, replacing the inline arrays in
   `src/pages/index.astro`. Routes: `/projects/[slug]`,
   `/publications/[slug]`, `/people/[slug]`. Adding a new pub or
   person becomes a Markdown commit, not a 200-line file edit.
2. **M3 — news / blog surface** with an RSS feed.
3. **M4 — CI: lint + typecheck + Playwright smoke + axe-core a11y +
   Lighthouse CI.**
4. **M5 — custom domain handoff to dataqualitylabs.com** (gated on
   Dr. Reznik / DNS).
5. **M6 — sister graduation** (`Makefile` + `.claude/skill-context.md`
   + add to `~/.claude/techne.toml`).

When picking one up, replace the "In flight" block above with a full
session plan (Why / Decisions / Scope / Out of scope / Definition of
done).
