---
title: "Welcome to the rebuilt LDQIS website"
description: "The lab's website moved off the legacy Flask/Bootstrap stack to an Astro 5 + Tailwind 4 static build. Content as code, so the whole lab can keep it current."
summary: "The lab's website moved to Astro 5 + Tailwind 4. Content as code, so anyone in the lab can add their work."
pubDate: 2026-05-22
tags: ["site", "open-source"]
author: "LDQIS"
---

The lab's website has a new home, and it is built so the whole lab can keep it current.

The old site ran on Flask and Bootstrap with login, registration, and a Postgres backend behind it. That was more moving parts than a lab site needs, so we replaced it with something simpler and sturdier.

What is here now is an [Astro 5](https://astro.build/) project that compiles to static HTML and is hosted on GitHub Pages. The source tree _is_ the site: adding a project, publication, team member, or news post means committing one Markdown file. No CMS to log into, no database to maintain.

## What's already live

- **Research areas, projects, publications, and people**, rendered from the content files. Click through any of the four homepage sections for the detail layer. Every project, paper, and researcher (current and past) has a stable per-page URL you can cite from a CV or LinkedIn.
- **WCAG 2.2 AA accessibility** across the site, gated on every PR by axe-core + Playwright.
- **Theme toggle** with `localStorage` persistence. Skip link, semantic heading hierarchy, and `prefers-reduced-motion` work because they are tested.
- **RSS feed** for the news section, so you can subscribe in any reader and get new posts automatically as the lab publishes them.

## Adding your work

This is the lab's site, and it is meant to be easy to contribute to — you don't need to be a web developer, and for your profile you don't need to touch a single file.

- **Your profile.** Open the [**Add or update your profile** form](https://github.com/ajbarea/ldqis/issues/new/choose), fill it in (you can drag in a photo), and submit. You get a pull request to review — no Markdown, no git. Tip: set your GitHub username and your GitHub photo is used automatically.
- **Projects and publications.** Same idea — the [**Add a project**](https://github.com/ajbarea/ldqis/issues/new/choose) and [**Add a publication**](https://github.com/ajbarea/ldqis/issues/new/choose) forms turn a submission into a pull request for review.
- **News posts.** Still a quick Markdown file under `src/content/news/` — add one and open a pull request, or send it my way and I'll wire it in.

## What's next

A move to a custom domain at `dataqualitylabs.com` is coming. The repo is public at [github.com/ajbarea/ldqis](https://github.com/ajbarea/ldqis), and contributions from the lab are welcome.
