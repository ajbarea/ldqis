# LDQIS — Implementation scratchpad

The active TODO for whatever's in flight right now: current PR, open
design question blocking me, immediate next pickup. Queued specs,
cross-cutting invariants, and "next up" ordering live in
[ROADMAP.md](./ROADMAP.md). Git history is the archive.

If this file is more than ~50 lines, something queued or referential has
crept in — extract it back to ROADMAP.

## In flight

**v0 scaffold** (2026-05-21).

Cherry-picking the design from `docs/legacy/dql-demo.html` (the
single-file Claude Cowork output that survived the 2026-05-21
audit-of-audit as paper-grade work) into a proper Astro 5 project.

Active scope:

1. Scaffold Astro 5 + Tailwind 4 + TypeScript, content collections,
   page surface (`/`, `/people`, `/projects`, `/projects/[slug]`,
   `/publications`, `/news`, `/news/[slug]`, `/contact`).
2. Port the homepage layout (hero / stats / research areas / projects
   / publications / people / get-involved / footer) one section at a
   time, preserving the official RIT branding (PMS 1505c orange, RIT
   yellow F6BE00 accent, Instrument Serif + Inter font pair) and the
   accessibility primitives already baked into the demo (skip-link,
   prefers-reduced-motion, color-scheme dark/light, semantic
   heading hierarchy).
3. Wire content collections so adding a publication or person means
   committing one Markdown file, not editing a 1247-line HTML.
4. Set up GitHub Actions Pages deploy targeting a verified custom
   domain (`dataqualitylabs.com` when DNS handoff happens with Dr.
   Reznik).

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

## Open questions for AJ before first push

- **Repo name on GitHub**: defaulting to `ajbarea/ldqis` (matches the
  lab acronym used in the demo wordmark). Alternatives:
  `ajbarea/dataqualitylabs` (matches domain) or `ajbarea/dql` (matches
  the original folder name). Repo name is cheap to change before push;
  flag if you want a different one.
- **Sign-in with Google button**: the demo has one in the nav
  (`/login` anchor). The legacy site uses it for the authenticated
  `/dataView` table. New site has no auth surface, so this button has
  nothing to do. Default plan: drop it entirely. If RIT-account sign-in
  is wanted for a future authenticated surface, file as a separate
  milestone in ROADMAP.
- **Demo banner**: the dql.html demo includes a "REDESIGN PREVIEW —
  feedback welcome" banner. Drop on first real ship; keep during
  preview deploys.

## Just shipped

Nothing yet — first commit pending.

## Next pickups (after v0 scaffold)

1. Per-project detail pages content (one `.md` per InteFL / Phalanx-FL /
   VelocityFL / Kourai Khryseai).
2. Per-publication detail pages (one `.md` per existing publication).
3. News section seed content (one welcome post explaining the
   rebuild).
4. Playwright smoke test + axe-core a11y check in CI.
5. Domain handoff coordination with Dr. Reznik.
