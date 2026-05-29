# LDQIS site — implementation notes

Where things stand right now, known issues, and the immediate next steps. The
longer-term plan lives in [ROADMAP.md](./ROADMAP.md); git history has the full record.

## In progress

_Nothing open right now._

## Known issues

Only dev/CI-only npm advisories remain (`npm audit`: 10 total, none reach the deployed
static site). Both are accepted because the only fix npm offers is a breaking downgrade of
the tool itself:

- **`@lhci/cli` → tmp (High), uuid, inquirer** — Lighthouse-CI tooling; the fix downgrades
  `@lhci/cli` to `0.1.0` and breaks the pipeline.
- **`@astrojs/check` → yaml-language-server → `yaml`** (moderate) — the type-checker's
  dependency chain; the fix is a breaking `@astrojs/check` downgrade.

## Next up

1. **Backfill team cross-links.** Projects and publications link to their lab-member
   authors and contributors through the `people` collection. The schema and the first
   entries are in place; add the remaining lists as authorship is confirmed.
2. **Custom domain.** Move the site to `dataqualitylabs.com` once DNS is ready (steps in
   ROADMAP).
