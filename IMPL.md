# LDQIS site — implementation notes

Where things stand right now, known issues, and the immediate next steps. The
longer-term plan lives in [ROADMAP.md](./ROADMAP.md); git history has the full record.

## In progress

**Moving into the `ldqis` organization.** The org exists, with Dr. Reznik (`leonr07`) invited
as an owner and a `lab-members` team. The CMS Worker already allows `ldqis.github.io` and
`dataqualitylabs.com`, and Dependabot auto-merge no longer depends on the repo's owner. The
draft PR that points the site and CMS at `ldqis/ldqis` merges right after the repo transfer.
Steps: [MAINTAINING.md](./MAINTAINING.md).

## Known issues

- `npm audit` is clean. `@lhci/cli` 0.15.1 is its latest release and no longer updated, so
  its vulnerable transitive dependencies are pinned forward in `package.json` `overrides`
  (`@puppeteer/browsers`, `tmp`, `uuid`). Re-check them when Lighthouse CI changes.
- `ldqis-cms-auth` has no Dependabot and pins an old wrangler; its `pnpm audit` findings are
  all in build and lint tooling, not the deployed Worker.

## Next up

1. **Finish the organization move** (transfer, apps, Cloudflare reconnect; MAINTAINING.md).
2. **Custom domain,** once the GoDaddy login and RIT's web@rit.edu exception are settled.
3. **Backfill team cross-links.** Projects and publications link to their lab-member
   authors and contributors through the `people` collection; add the remaining lists as
   authorship is confirmed.
