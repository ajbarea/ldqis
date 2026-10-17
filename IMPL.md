# LDQIS site — implementation notes

Where things stand right now, known issues, and the immediate next steps. The
longer-term plan lives in [ROADMAP.md](./ROADMAP.md); git history has the full record.

## In progress

The org move and the `dataqualitylabs.com` cutover are done (2026-10-16). The site builds
only for the custom domain at the root. Setup reference: [MAINTAINING.md](./MAINTAINING.md).

## Known issues

- `npm audit --omit=dev` is clean. The dev-only findings are the `@lhci/cli` chain (0.15.1 is
  its latest release and no longer updated) and `@tailwindcss/typography` through
  `postcss-selector-parser`; `npm audit fix --force` would downgrade `@lhci/cli` and
  `@tailwindcss/typography`, so leave them. `@puppeteer/browsers`, `tmp`, and `uuid` are pinned
  forward in `package.json` `overrides`.
- `ldqis-cms-auth` has no Dependabot and pins an old wrangler; its `pnpm audit` findings are
  all in build and lint tooling, not the deployed Worker.

## Next up

1. **Codecov for the org,** then update the README badge token.
2. **Install GitGuardian on the org.**
3. **Backfill team cross-links.** Projects and publications link to their lab-member
   authors and contributors through the `people` collection; add the remaining lists as
   authorship is confirmed.
