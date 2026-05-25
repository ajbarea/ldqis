# LDQIS — Implementation scratchpad

The active TODO for whatever's in flight right now: current PR, open
design question blocking me, immediate next pickup. Queued specs,
cross-cutting invariants, and "next up" ordering live in
[ROADMAP.md](./ROADMAP.md). Git history is the archive.

If this file is more than ~50 lines, something queued or referential has
crept in — extract it back to ROADMAP.

## In flight

_Nothing currently open. M2-followup cross-linking shipped 2026-05-23 —
projects ↔ people ↔ publications cross-references via Astro
`reference()` with one-direction storage + build-time computation. See
ROADMAP._

## Known unpatched-upstream notation

**Astro 5.18.1 pin (not Astro 6).** `@tailwindcss/vite` (official Tailwind 4 path) has an open upstream incompat with Astro 6's rolldown pipeline ([withastro/astro#16542](https://github.com/withastro/astro/issues/16542)). The two CVEs flagged on Astro 5.x — `define:vars` XSS and server-island encrypted-param replay — don't affect this site (zero `define:vars`, no `output: "server"`). Migrate when #16542 closes.

**`@lhci/cli` transitive deps** (tmp, uuid, inquirer). Dev-only, informational. Fix path is a major-version downgrade that would break the lighthouse pipeline. Accepted.

## Next pickups

Per ROADMAP, in order:

1. **Backfill the remaining team cross-links.** M2-followup landed the schema + 1 project (InteFL) + 3 publications. Phalanx-FL / VelocityFL / Kourai Khryseai now carry AJ as sole `contributor` (self-attribution, 2026-05-24); canonical lab-team attribution beyond AJ still needs Reznik input. Add the rest as the data becomes clear.
2. **M5 — custom domain handoff to dataqualitylabs.com** (gated on Dr. Reznik / DNS).

M3 (news / blog surface with RSS) shipped 2026-05-22. M6 (sister
graduation) shipped 2026-05-22 — `scripts/dev-runner.sh` + the first
`/techne:audit` and `/techne:sisters` runs closed it out. Fragile-
claims CI gate (`scripts/check-readme-claims.mjs`) shipped 2026-05-23
covering Makefile target list + GitHub Pages preview URL.

When picking one up, replace the "In flight" block above with a full session plan (Why / Decisions / Scope / Out of scope / Definition of done).
