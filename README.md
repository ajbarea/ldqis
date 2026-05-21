# LDQIS — Lab Website

Source for the Laboratory of Data Quality and Intelligent Security website at RIT. Static site, Astro 5 + Tailwind 4, deploys to GitHub Pages. Replaces the legacy Flask + Bootstrap-4 site at `dataqualitylabs.com`.

[![Astro](https://img.shields.io/badge/Astro-5-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=flat-square&logo=github)](https://ajbarea.github.io/ldqis/)

## Quick start

```bash
make setup    # npm ci, clean install from lock
make dev      # hot-reload dev server at localhost:4321
make build    # production build into dist/
make check    # astro check (type-check + template validation)
```

`make help` lists every target.

## Project structure

```
src/
├── layouts/BaseLayout.astro    # head + theme + skip-link + slot
├── pages/index.astro           # homepage (single-page until M2)
└── styles/global.css           # Tailwind 4 @theme tokens (RIT palette)

public/                         # static assets
.github/workflows/deploy.yml    # Pages deploy on push to main
astro.config.mjs                # site URL + base path + Vite Tailwind plugin
```

`ROADMAP.md` has the long view (content collections, news, CI, custom domain handoff). `IMPL.md` has whatever is actively in flight.

## Status

Pre-release. v0 scaffold shipped 2026-05-21; preview at <https://ajbarea.github.io/ldqis/>. Custom domain handoff to `dataqualitylabs.com` is M5 work, gated on Dr. Reznik / DNS.
