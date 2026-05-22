---
title: "Welcome to the rebuilt LDQIS website"
description: "The lab's public website moved off the legacy Flask/Bootstrap stack to an Astro 5 + Tailwind 4 static build. Same identity, different posture: content as code, no backend, no auth, no database."
summary: "The lab's public website moved to Astro 5 + Tailwind 4. Content as code, no backend, no auth, no database."
pubDate: 2026-05-22
tags: ["site", "open-source"]
author: "LDQIS"
---

The lab's public site has been rebuilt from the ground up.

The previous site — a Flask + Bootstrap deployment with `/login`, `/register`, and `/dataView` routes wired to a Postgres backend — accumulated the attack surface that comes with any auth-and-database web app. We retired it.

What's here now is deliberately simpler: an [Astro 5](https://astro.build/) project that compiles to static HTML, hosted on GitHub Pages, with the source tree as the editorial surface. Adding a project, publication, team member, or news post means committing one Markdown file. No CMS, no database, no surface for the kind of incident the legacy site was bait for.

## What's already live

- **Research areas, projects, publications, and people** rendered from content collections. Click through any of the four homepage sections for the detail layer — every project, paper, and researcher (current + past cohort) has a stable per-page URL you can cite from a CV or LinkedIn.
- **WCAG 2.2 AA accessibility** across the site, gated on every PR by axe-core + Playwright. The brand-orange identity element (PMS 1505c at 2.98:1) is a documented exception escalated to Dr. Reznik; non-brand text hits AA cleanly.
- **Theme toggle** with `localStorage` persistence. Skip link, semantic heading hierarchy, and `prefers-reduced-motion` work because they're tested.
- **This RSS feed** at [/news/rss.xml](rss.xml) — readers can subscribe and you'll see new posts here as the lab ships them.

## What's next

[M5](https://github.com/ajbarea/ldqis/blob/main/ROADMAP.md) is the custom-domain handoff to `dataqualitylabs.com`, gated on DNS coordination with Dr. Reznik. [M6](https://github.com/ajbarea/ldqis/blob/main/ROADMAP.md) graduates the repo into the sister-shape audit pipeline alongside `phalanx-fl`, `vFL`, `kourai-khryseai`, `techne`, and `ajbarea.github.io`.

The repo is public: [github.com/ajbarea/ldqis](https://github.com/ajbarea/ldqis). PRs welcome on the lab's own work, and the design itself is shared under the MIT license if any of the patterns are useful elsewhere.
