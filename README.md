# LDQIS Lab Website

Source for the website of RIT's **Laboratory of Data Quality and Intelligent Security (LDQIS)**. A static [Astro 5](https://astro.build/) site with Tailwind 4, deployed to GitHub Pages. It replaces the lab's older Flask + Bootstrap-4 site at `dataqualitylabs.com`.

[![Astro](https://img.shields.io/badge/Astro-5-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=flat-square&logo=github)](https://ajbarea.github.io/ldqis/)

This is the lab's website: our people, research, projects, publications, and news. It is content as code, which is mostly a way of saying it stays easy to keep current. Adding your project, paper, profile, or a news post is one Markdown file and a pull request. No CMS, no database, no logins to manage.

## Quick start

```bash
make setup    # npm ci, clean install from lock
make dev      # hot-reload dev server at localhost:4321
make build    # production build into dist/
make check    # astro check (type-check + template validation)
```

`make help` lists every target.

## Adding content

Each kind of content is a folder under `src/content/`, and adding an entry is one new file. Schemas live in `src/content.config.ts`, so a typo in a cross-reference fails the build instead of shipping a broken page.

- **`people/`**: current team and alumni. Optional fields add a profile photo (an upload, or auto-pulled from a `github:` handle), social and academic links (website, GitHub, LinkedIn, YouTube, ORCID, Scholar, IEEE), and years in the lab. Lab members can fill all of this from the [profile form](https://github.com/ajbarea/ldqis/issues/new/choose) — no file editing.
- **`projects/`**: the lab's open-source frameworks (InteFL, Phalanx-FL, Velocity-FL, Kourai Khryseai), each credited to its contributors.
- **`publications/`**: papers, with year, venue, and authors linked to their people entries.
- **`news/`**: dated posts, surfaced at `/news/` with an RSS feed at `/news/rss.xml`.

Every person, project, and paper renders to a stable per-page URL you can cite from a CV or profile. Cross-links (a paper's authors, a project's contributors) are computed at build time, so there is no bidirectional state to keep in sync.

## Project structure

```
src/
├── content/            # the editorial surface: people, projects, publications, news
├── content.config.ts   # collection schemas
├── layouts/            # base layout: head, theme, skip-link
├── pages/              # routes, per-entry detail pages, and the news RSS endpoint
└── styles/global.css   # Tailwind 4 @theme tokens (RIT palette)

.github/workflows/      # CI gates + Pages deploy on push to main
astro.config.mjs        # site URL, base path, Tailwind plugin
```

## Accessibility

The site targets WCAG 2.2 AA, enforced on every PR by axe-core + Playwright, with Lighthouse running in CI as well. Theme toggle, skip link, semantic heading hierarchy, and `prefers-reduced-motion` are covered because they are tested, not assumed.

## Contributing

If you are in the lab, the easiest way onto the site is the [**Add or update your profile** form](https://github.com/ajbarea/ldqis/issues/new/choose) — fill it in and you get a pull request to review, no files to touch. For projects, papers, and news, open a pull request or just ask. The setup is deliberately low-friction, so nobody needs to be a web developer to get their work on the site.

## Status

Live at <https://ajbarea.github.io/ldqis/>; a move to `dataqualitylabs.com` is planned. MIT licensed.
