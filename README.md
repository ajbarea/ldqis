# LDQIS — Lab Website

> Laboratory of Data Quality and Intelligent Security at the Rochester Institute of Technology.
> The new home of the lab on the web, replacing the legacy Flask/Bootstrap-4 site at `dataqualitylabs.com`.

This repo is the source for the lab's public website. It's a static site
built with Astro 5 + Tailwind 4, content authored as Markdown frontmatter,
deployed via GitHub Pages. No backend, no authentication, no attack
surface — the legacy site's `/login`, `/register`, and `/dataView` routes
are gone, and with them the entire class of authentication-related
vulnerabilities that made the old site insecure.

## Quick start

```bash
npm install
npm run dev      # local dev server with hot reload
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## What's here

| Path | What |
| --- | --- |
| `src/pages/` | Astro route files |
| `src/content/` | Markdown content collections (people, projects, publications, news, research areas) |
| `src/components/` | Reusable Astro / Vue components |
| `src/layouts/` | Page layouts |
| `src/styles/` | Tailwind config + custom CSS |
| `public/` | Static assets served as-is |
| `docs/legacy/` | Snapshot of the original `dql.html` demo for design reference |
| `IMPL.md` | What's actively in flight this session |
| `ROADMAP.md` | Long-horizon plan + content model + milestones |

## Why Astro

Searched 2026 best practice before committing — Astro is the default for
content-driven academic / lab sites this year. Zero JavaScript by default,
islands architecture for selective interactivity, native Markdown, top
Lighthouse scores out of the box. The lab template ecosystem
([greenelab/lab-website-template](https://github.com/greenelab/lab-website-template)
has a Zenodo DOI) confirms it's well-established for this niche. Nuxt was
the runner-up since AJ has Vue expertise on `ajbarea.github.io`, but Nuxt's
strength is full-stack and DQL is content-heavy, so Astro wins on the
performance + SEO axis that matters for academic discoverability.

## Status

Pre-release. First commit, scaffolding in progress. See `IMPL.md` for the
active session plan and `ROADMAP.md` for the long view.
