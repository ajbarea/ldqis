# LDQIS Lab Website — Roadmap

The plan for the lab's public website: what's shipped, what's planned, and the principles
behind it. Day-to-day status lives in [IMPL.md](./IMPL.md); git history has the full record.

The site is built with [Astro](https://astro.build) and deploys automatically to GitHub
Pages on every push to `main`. It's intentionally static — no backend, no database, no login.

## Principles

These hold across redesigns; changing any is a deliberate decision, not drift.

- **No backend, no auth, no database.** The previous site's login / register / data-view
  surface was its main source of risk. Design any new feature as a build-time artifact
  (Markdown + frontmatter in git) first; only escalate to server state if a static answer
  truly can't do the job.
- **Content as code.** Adding a person, project, publication, or news post is one Markdown
  commit. If editorial volume outgrows git, layer a git-based editor (Sveltia / Decap) onto
  the existing content collections — never a database.
- **Fast and light.** Astro ships zero JavaScript by default; interactivity is added only
  where it's needed (theme toggle, search). The bar is a perfect Lighthouse score across all
  four categories.
- **Accessibility is a check, not a vibe.** WCAG 2.2 AA on every page, enforced on every
  pull request by Playwright and axe-core. No manual-only a11y claims.
- **Stable identity.** The LDQIS name and RIT branding (PMS 1505c orange, F6BE00 yellow,
  Instrument Serif + Inter type) stay constant across redesigns.
- **Research before architecture.** Framework, library, and pattern choices are checked
  against current best practice and recorded in a `research(YYYY-MM):` note in the code —
  the same provenance habit as the lab's published work.
- **Don't build around gaps that are about to close.** Before hand-rolling a shim (image
  optimization, RSS, a content loader), check whether the framework already ships it or is
  about to; when a major version lands, revisit the workarounds it makes unnecessary.

## Planned

### Custom domain — `dataqualitylabs.com`

The lab owns the domain; moving the site onto it (gated on DNS access):

1. Verify the domain through
   [GitHub's domain-verification flow](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)
   (prevents subdomain takeover).
2. Add a `CNAME` file with `dataqualitylabs.com`.
3. Point DNS (`dataqualitylabs.com` and `www`) at GitHub Pages.
4. Let the HTTPS certificate auto-provision, then enable "Enforce HTTPS".
5. Confirm the old site is fully offline (old URLs return 404, not stale data).

A single build flag (`CUSTOM_DOMAIN`) already switches between the GitHub Pages path and the
apex domain, so the flip is one change once DNS resolves.

### Backlog (unprioritized)

- **Admin (Sveltia CMS) UX** — the no-code `/admin` editor is live; streamline its editing
  experience (clearer fields, smoother flows) as more lab members start using it.
- **Sponsors / funding** — a section crediting the organizations that support the lab, once
  there's a confirmed list to show.
- **Search** — Pagefind or Astro's built-in, once the publication list grows enough to
  warrant it.
- **Per-project demo embeds** — interactive project demos as embedded islands, if and when
  the demos have hosted surfaces.
- **Multi-author news bylines** — when a post has more than one author.
- **Internationalization** — only if a lab member needs it.

## Shipped

Highlights below; full history in git.

- **Astro 6.** Upgraded from the 5.x line. `@tailwindcss/vite`'s wide peer range is pinned
  out with `overrides.vite: ^7` (npm would otherwise hoist Vite 8 and break the build); this
  also cleared the two Astro 5.x advisories.
- **Slim content-PR gate.** A profile / project / publication PR (a Markdown edit under
  `src/content/**`) gates to merge on a fast `Build` (`astro build` schema validation) +
  `pin-check`. The app suite (lint, type-check, unit, E2E + a11y, Lighthouse) is conditioned
  on a `dorny/paths-filter` job and skips — reporting success — when nothing outside
  `src/content/**` changed. research(2026-05): GitHub required checks are repo-wide, so a
  job-level `if:` skip is the endorsed way to drop heavy checks on content PRs without
  leaving a required check stuck Pending. (Lab members are deliberately not repo
  collaborators — AJ approves first-time-contributor workflow runs manually rather than
  granting write access.)
- **Project / publication intake + email copy chip.** Issue forms for profiles, projects,
  and publications open auto-generated, reviewed PRs; they take comma-separated tags/stack
  and derive the entry's name/title from the issue title, so nothing is typed twice. Each
  intake workflow runs `astro build` to validate the generated entry before opening the PR.
  On profile and detail pages the email is a single chip: clicking opens mail, and an inline
  icon copies the address with a "Copied!" confirmation.
- **Profile cards: photos, links, and a submission form.** Team cards show a photo (uploaded,
  auto-pulled from a GitHub handle, or initials), social and academic links (website, GitHub,
  LinkedIn, YouTube, ORCID, Scholar, IEEE), and years in the lab. An issue form lets members
  submit a card — photo and all — without touching git.
- **Academic discovery metadata.** Publication pages emit Highwire `citation_*` tags (what
  Google Scholar reads), complemented by schema.org JSON-LD and a sitemap.
- **News + RSS.** A `news` collection with an index, per-post pages, and a valid RSS 2.0
  feed; drafts and future-dated posts are excluded at build time.
- **Content collections + detail pages.** Projects, publications, and people are Astro
  content collections; each gets a prerendered detail page, and projects/publications
  cross-link to the people who authored or built them.
- **Supply-chain hardening + CI.** GitHub Actions pinned to commit SHAs with a Dependabot
  cooldown; accessibility, Lighthouse, lint, type-check, and unit tests run on every pull
  request.
