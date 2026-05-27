# LDQIS Lab Website — Roadmap

The plan for the lab's public website: what's shipped, what's planned, and the
principles behind it. Day-to-day status lives in [IMPL.md](./IMPL.md); git history has
the full record.

The site is built with [Astro](https://astro.build) and deploys automatically to GitHub
Pages on every push to `main`. It's intentionally static — no backend, no database, no
login.

## Why it's built this way

- **Static over dynamic.** No backend, no auth, no database. The previous site's login /
  register / data-view surface was its main source of risk. A feature tempted to add
  server state should first be designed as a build-time artifact (Markdown + frontmatter
  committed to git), and only escalate if a static answer truly can't work.
- **Content as code.** Adding a publication, team member, project, or news post means
  committing one Markdown file — no CMS to run. If editorial volume ever outgrows git, a
  git-based editor (Decap or Sveltia CMS) can layer onto the existing content collections
  without introducing a database.
- **Fast and light.** Astro ships zero JavaScript by default; interactivity is added only
  where it's needed (theme toggle, search). The bar is a perfect Lighthouse score across
  all four categories.
- **Accessibility is a check, not a vibe.** WCAG 2.2 AA on every page, enforced by
  Playwright + axe-core in CI on every pull request: skip link, semantic headings,
  reduced-motion and color-scheme support.
- **Stable identity.** The LDQIS name and RIT branding (PMS 1505c orange, F6BE00 yellow,
  Instrument Serif + Inter type) stay constant across redesigns. Changing any of them is
  a deliberate decision, not incidental drift.
- **Research before architecture.** Framework, library, and pattern choices are checked
  against current best practice first, and the tradeoff is recorded in a
  `research(YYYY-MM):` note in the code — the same provenance habit as the lab's published
  work.

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

A single build flag already switches between the GitHub Pages path and the apex domain,
so the flip is one change once DNS resolves.

### Backlog (unprioritized)

- **Astro 6 upgrade** — blocked on the upstream Tailwind-vite fix
  ([withastro/astro#16542](https://github.com/withastro/astro/issues/16542)); see IMPL.md.
- **Editorial UI** — Decap or Sveltia CMS for non-technical editors, only once there's a
  real second editor. (The profile intake form already covers self-service profile edits.)
- **Search** — Pagefind or Astro's built-in, once the publication list grows enough to
  warrant it.
- **Per-project demo embeds** — interactive project demos as embedded islands, if and when
  the demos have hosted surfaces.
- **Multi-author news bylines** — when a post has more than one author.
- **Internationalization** — only if a lab member needs it.

## Invariants

These hold across redesigns:

- **Stable identity** — LDQIS name, RIT branding, the Instrument Serif / Inter type pair.
- **No backend, no auth** — re-introducing server state re-introduces the old site's class
  of vulnerability; justify why a build-time artifact can't do the job first.
- **Content as code** — new content is a Markdown commit.
- **Accessibility verified in CI** — axe-core must pass; no manual-only a11y claims.
- **Research-backed architecture** — architectural calls cite current best practice in a
  `research(YYYY-MM):` note.
- **Don't build around gaps that are about to close** — before hand-rolling a shim (image
  optimization, RSS, a content loader), check whether the framework already ships it or is
  about to; when a major version lands, revisit the workarounds it makes unnecessary.

## Shipped

Highlights below; full history in git.

- **Profile cards: photos, links, and a submission form.** Team cards show a photo
  (uploaded, auto-pulled from a GitHub handle, or initials), social and academic links
  (website, GitHub, LinkedIn, YouTube, ORCID, Scholar, IEEE), and years in the lab. An
  "Add or update your profile" issue form lets members submit a card — photo and all —
  without touching git; it opens a reviewed pull request.
- **Academic discovery metadata.** Publication pages emit Highwire `citation_*` tags (what
  Google Scholar actually reads), complemented by schema.org JSON-LD and a sitemap.
- **News + RSS.** A `news` collection with an index, per-post pages, and a valid RSS 2.0
  feed; drafts and future-dated posts are excluded at build time.
- **Content collections + detail pages.** Projects, publications, and people are Astro
  content collections; each gets a prerendered detail page, and projects/publications
  cross-link to the people who authored or built them.
- **Supply-chain hardening + CI.** GitHub Actions are pinned to commit SHAs with a
  Dependabot cooldown; accessibility, Lighthouse, lint, type-check, and unit tests run on
  every pull request.
