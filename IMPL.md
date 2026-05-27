# LDQIS site — implementation notes

Where things stand right now, known issues, and the immediate next steps. The
longer-term plan lives in [ROADMAP.md](./ROADMAP.md); git history has the full record.

## In progress

_Nothing open right now._

## Known issues

- **Astro is pinned to 5.18.1 (not 6).** `@tailwindcss/vite` — the official Tailwind 4
  setup — has an open incompatibility with Astro 6's build pipeline
  ([withastro/astro#16542](https://github.com/withastro/astro/issues/16542)). The two CVEs
  flagged on the Astro 5.x line don't affect this site: it's a fully static build that
  exercises neither code path. Dependabot ignores the Astro 6 major until the upstream
  issue closes (`.github/dependabot.yml`); bump then.
- **`@lhci/cli` transitive dev dependencies** (tmp, uuid, inquirer) — dev-only and
  informational. The fix is a major downgrade that would break the Lighthouse pipeline,
  so it's accepted as-is.

## Next up

1. **Backfill team cross-links.** Projects and publications link to their lab-member
   authors and contributors through the `people` collection. The schema and the first
   entries are in place; add the remaining lists as authorship is confirmed.
2. **Custom domain.** Move the site to `dataqualitylabs.com` once DNS is ready (steps in
   ROADMAP).
