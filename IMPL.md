# LDQIS site — implementation notes

Where things stand right now, known issues, and the immediate next steps. The
longer-term plan lives in [ROADMAP.md](./ROADMAP.md); git history has the full record.

## In progress

- **CMS publish pipeline.** A direct `/admin` save to protected `main` is rejected
  ("required status checks are expected"), so editing only worked for the repo owner,
  who bypasses protection. Fix: Sveltia commits to an unprotected `cms` branch;
  `cms-publish.yml` opens an App-authored PR to `main` (so `ci.yml` actually runs) and
  auto-merges once the required checks pass; `cms-sync.yml` then folds `main` back into
  `cms`. `main`'s protection is never bypassed. Activation needs a one-time GitHub App
  (`CMS_APP_ID` var + `CMS_APP_PRIVATE_KEY` secret), the `cms` branch, and flipping
  `backend.branch` to `cms` in the admin config; until then `/admin` saves still fail
  for non-owners.

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
