# LDQIS Lab Website — Roadmap

Long-horizon plan for the lab's new public website. Session-by-session
execution lives in [IMPL.md](./IMPL.md). When a milestone ships, it
collapses to a one-liner under [Shipped](#shipped).

Last reviewed: 2026-05-21. Pre-release: no production deploy yet.
Cherry-picking from `docs/legacy/dql-demo.html` (the single-file Claude
Cowork output that survived the 2026-05-21 audit-of-audit as
paper-grade) into a real Astro project on AJ's personal GitHub. Will
graduate to a sister in `~/.claude/techne.toml` once Makefile +
`.claude/skill-context.md` + CI workflows are in place.

---

## Why this file exists

If you've cloned the repo and want to know "what are they building next,
and why," this is the answer. The lab website is public-facing
infrastructure for a research lab; the roadmap is the inverse of the
legacy site's opaque admin-driven shape. Anything queued or referential
lives here so IMPL.md stays terse.

---

## Guiding principles

- **Static over dynamic.** No backend, no auth, no database. The
  legacy site's `/login` + `/register` + `/dataView` attack surface
  was exactly the thing that made it insecure. Whenever a feature is
  tempted to add backend state, design it as a build-time artifact
  first (Markdown + frontmatter + git commit) and only escalate if
  there's a real reason a static answer can't work.
- **Content as code.** Adding a publication, a team member, a
  project, or a news post means committing one Markdown file. No
  CMS in v1. If a non-technical lab member needs editorial access
  later, layer Decap CMS or Sveltia CMS on top of the existing
  content collections (both are git-based and zero-backend) instead
  of introducing a database.
- **Zero JS by default.** Astro islands let us add interactivity
  only where it's needed (theme toggle, search, future demos).
  Lighthouse 100 / 100 / 100 / 100 is the bar.
- **A11y is non-negotiable.** WCAG 2.2 AA across every route.
  Playwright + axe-core in CI on every PR. Skip-link, semantic
  heading hierarchy, `prefers-reduced-motion`, color-scheme support
  are already in the demo design; preserve them through the port.
- **Identity stability.** The lab's identity is the LDQIS acronym
  and the RIT branding. Both stay constant across redesigns. The
  Instrument Serif headlines + Inter body pair survived audit; keep
  them.
- **Search before architectural decisions.** Web-search 2026 best
  practice before any architectural call (framework choice,
  deployment pattern, CMS pattern, accessibility convention).
  Tradeoffs land in a `# research(YYYY-MM):` comment in code or
  inline in the roadmap entry, matching the lab's published
  research provenance convention.

---

## M1 — v0 scaffold (in flight)

> Status: in flight 2026-05-21

Stand up the Astro 5 project with the homepage ported from the demo.
Single-page experience preserved; content collections wired even if
some pages are empty. First push lands on `ajbarea/ldqis` (or whatever
the chosen name is — see IMPL.md open questions). GH Pages deploy
runs but custom domain is not connected yet.

Definition of done:

- [ ] `npm install && npm run build` runs clean
- [ ] `npm run dev` serves a working homepage at `localhost:4321`
- [ ] All sections from the demo render: hero, stats, research areas,
  projects, publications, people (current + past), get-involved,
  footer
- [ ] Theme toggle works with `localStorage` persistence
- [ ] Skip-link, prefers-reduced-motion, semantic heading hierarchy
  preserved
- [ ] First commit lands on `main` in a brand-new repo
- [ ] GH Pages deploy is wired and green
- [ ] Old `dql.html` archived as `docs/legacy/dql-demo.html` for
  reference

---

## M2 — Content collections + per-detail pages

> Status: planned

Each project / publication / team member becomes its own Markdown
file with frontmatter. Routes:

- `/projects/[slug]` — per-project detail (InteFL, Phalanx-FL, vFL,
  Kourai Khryseai, future). Pulls the same fields the demo renders
  inline (tag list, tech stack, description, GitHub + docs links,
  paper DOIs) into a richer detail layout. Lists the project's
  contributors by linking back to their `/people/[slug]` pages.
- `/publications/[slug]` — per-publication detail (the IEEE IS 2026,
  IEEE AIIoT 2024, ASIA '24 papers, future). Abstract, authors with
  affiliations, links to PDF + DOI + bibtex.
- `/people/[slug]` — per-person detail. Optional, only for current
  cohort; past-cohort entries stay as one-liners on the `/people`
  index. Bio, areas, links to the projects they contribute to.

Definition of done:

- [ ] All four existing projects seeded as Markdown
- [ ] All three existing publications seeded as Markdown
- [ ] Current cohort (Reznik / Chuprov / Korobeinikov / Zatsarenko /
  Barea / Black / Soravilla) seeded as Markdown
- [ ] Each `[slug]` route renders without errors
- [ ] Cross-links work: project pages link to people, people pages
  link to projects, publications link to authors

---

## M3 — News / blog surface

> Status: planned

Replaces the legacy site's "see my key address to NetWare 2014" style
of news-as-stale-paragraph with proper dated posts. Each post is one
Markdown file in `src/content/news/`, with frontmatter for date /
authors / tags. Index at `/news/` shows newest first, with `[slug]`
detail pages.

First post: "Welcome to the rebuilt LDQIS website" — explains the
move from Flask/Bootstrap to Astro, summarizes what's new, links to
the GitHub repo so curious readers can see the source.

Definition of done:

- [ ] `/news/` index renders newest-first
- [ ] `/news/[slug]` per-post pages work
- [ ] First welcome post written and dated 2026-05
- [ ] RSS feed auto-generated at `/news/rss.xml` (Astro has built-in
  support)

---

## M4 — CI / a11y / smoke testing

> Status: planned

Per-PR: lint, type-check, build, Playwright smoke (homepage loads,
nav works, theme toggle works), axe-core scan against every page.
Sister-shape CI even though we're not in techne.toml yet.

Definition of done:

- [ ] `.github/workflows/ci.yml` runs on every PR
- [ ] Lighthouse CI run that asserts 100/100/100/100 on the homepage
  (perf / a11y / best practices / SEO)
- [ ] axe-core scan via Playwright on `/`, `/people`, `/projects`,
  `/publications`, `/news`
- [ ] Branch protection on `main`: 4 required checks (lint, type,
  build, e2e) matching the sister pattern
- [ ] Codecov optional but nice if we add unit tests for any future
  TS utilities

---

## M5 — Custom domain handoff

> Status: planned, gated on Dr. Reznik

The lab owns `dataqualitylabs.com`. Migration steps:

1. Verify the domain through GitHub's domain verification flow
   ([GitHub docs: about-custom-domains-and-github-pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages))
   to prevent subdomain takeover.
2. Add `CNAME` file to the repo with `dataqualitylabs.com`.
3. Coordinate with Dr. Reznik to update DNS at the current registrar
   to point `dataqualitylabs.com` (and `www.dataqualitylabs.com`)
   at GitHub Pages.
4. Wait for Let's Encrypt cert to auto-provision.
5. Enable "Enforce HTTPS" in Pages settings.
6. Verify the legacy Flask backend is taken offline cleanly so the
   old `/login` and `/dataView` URLs return 404 (not legacy data).

Definition of done:

- [ ] DNS resolution check passes
- [ ] HTTPS enforced
- [ ] Old site is offline or returning 404
- [ ] `dataqualitylabs.com` redirects www → apex (or vice versa,
  consistent choice)

---

## M6 — Sister graduation

> Status: planned, after M1-M5 ship

Once the repo has a Makefile, `.claude/skill-context.md`, working
`techne:audit` / `techne:ci-audit` invocation patterns, and a green
CI pipeline, add to `~/.claude/techne.toml` as the sixth active
sister. At that point `/techne:sisters` will include LDQIS in the
weekly cross-repo drift audit.

Definition of done:

- [ ] `Makefile` with `setup`, `lint`, `test`, `build`, `e2e`
  targets matching sister convention
- [ ] `.claude/skill-context.md` filled in with per-skill facts
- [ ] First successful `/techne:audit` run against this repo
- [ ] Entry added to `~/.claude/techne.toml`
- [ ] `~/ajsoftworks/MEMORY.md` updated to note the new sister

---

## Cross-cutting invariants

- **Identity stays constant.** LDQIS acronym, RIT branding (PMS
  1505c orange, F6BE00 yellow), Instrument Serif + Inter font pair
  survive every redesign. If a future redesign wants to change any
  of these, it's a separate explicit decision, not a drift.
- **No backend / no auth.** If a feature is tempted to need a
  backend, the design has to first explain why a build-time
  artifact (Markdown + frontmatter, JSON, generated TS data) can't
  satisfy the requirement. Re-introducing auth re-introduces the
  legacy site's class of vulnerability.
- **Web-search before architectural calls.** Per AJ's
  `feedback_web_search_when_in_doubt` standing instruction, any
  framework / library / pattern call lands with a `# research(2026-MM):`
  comment naming the tradeoff and source. Especially valuable for
  negative-space decisions ("we did NOT use X because…").
- **Content as code.** Adding a publication / person / project /
  news post is a Markdown commit. If editorial volume grows past
  what's tractable via git, layer Decap or Sveltia CMS on top of
  the same content collections rather than introducing a database.
- **Accessibility is a check, not a vibe.** Playwright + axe-core
  in CI; no "passes my screen reader" assertions land without the
  automated check passing too.

---

## Future / unprioritized backlog

- **Astro 6 migration (gated on upstream Tailwind-vite fix)** — pinned
  to Astro 5.18.1 because Astro 6 + `@tailwindcss/vite` breaks the build
  with a rolldown-vite incompatibility (open upstream:
  [withastro/astro#16542](https://github.com/withastro/astro/issues/16542)).
  Two CVEs apply to the 5.x line (XSS in `define:vars`, server-island
  encrypted-param replay) but our static build doesn't exercise either
  code path — we use zero `define:vars` and no server islands. When the
  upstream issue closes, bump to Astro 6.x and remove the
  unpatched-upstream notation from astro.config.mjs + IMPL.md. This
  mirrors AJ's `phalanx-fl` PR #11 "unpatched-upstream ignore list"
  pattern.
- **Decap or Sveltia CMS** — git-based editorial UI for non-technical
  lab members. Only file when there's a real second editor.
- **Lab-internal wiki or knowledge base** — public-vs-internal split.
  Probably a separate repo with auth (if needed); don't bolt onto the
  public site.
- **Demo embeds** — interactive Phalanx-FL strategy explorer or
  Kourai-Khryseai live chat as iframes / islands on per-project pages.
  Probably only worth doing if the demos themselves have hosted
  surfaces to embed.
- **Multi-author bylines on news posts** — when more than one lab
  member contributes to a post.
- **Search** — Pagefind or Astro's built-in. Only when content
  volume warrants it (probably after M3 ships and the publication
  list grows past ~15 entries).
- **Sitemap + structured data (JSON-LD) for academic discovery** —
  Google Scholar + Semantic Scholar friendlier metadata. Astro has
  built-in sitemap; add JSON-LD `ScholarlyArticle` schema per
  publication.
- **Internationalization** — only if a lab member specifically needs
  it. Cross-reference AJ's portfolio Language Selector IMPL.md if
  the time comes; same Nuxt-i18n pattern doesn't directly translate
  to Astro but the content model lessons do.

---

## Shipped

One-line per item, newest first. Detail moves to git history when
work lands.

- _(nothing yet)_
