# skill-context — ldqis

Repo-specific facts for canonical techne skills. Injected into each skill at
invocation via `!cat .claude/skill-context.md`. Update on toolchain / path /
tooling changes.

## repo

- name: ldqis
- package_root: `src/` (Astro pages + layouts + components + styles + content), `public/` (static assets served as-is)
- language: TypeScript (Astro 5 + Tailwind 4) — no Python, no Rust
- cli_entrypoint: `npm run <script>` (see `package.json` `scripts`) wrapped by `make <target>` (see `Makefile`)
- runner_module: no Python runner; npm scripts drive the pipeline
- default_branch: `main` (deploy.yml triggers on push)
- has: Astro 5 (output: "static"), Tailwind 4 via `@tailwindcss/vite`, TypeScript strict, GitHub Pages deploy via Actions, content cherry-picked from a 2026-02 Claude Cowork session (single-file demo for LDQIS lab site)

## audit

Audit drives the wrapper `make` targets, in dependency order:

### Phase 1 — Setup

1. `make setup` — `npm ci` clean install from `package-lock.json`. **Required before every downstream step.**

### Phase 2 — Fix (one-way door)

No auto-fix yet. Lint + format land with M4 of `ROADMAP.md` (CI / a11y / smoke testing milestone).

### Phase 3 — Granular lint

2. `make check` — `astro check` (TypeScript + `.astro` template type-checking). The closest thing to a lint pass today; surfaces type errors and Astro template issues. ESLint + Prettier `format:check` / `lint:check` land with M4.

### Phase 4 — Granular test

Nothing yet. Vitest unit tests + Playwright e2e + axe-core a11y scan land with M4.

### Phase 5 — End-to-end gates

3. `make build` — `astro build`, the "is it deployable" probe. Generates static HTML/CSS/JS into `dist/`.

Fast audit (current state) = `make setup → make check → make build`. Three commands.

Stop-early phase: Phase 1 (`make setup`). If install fails, abort — every downstream step depends on it.

Do-not-run targets (long-running or interactive):

- `make dev` (interactive Astro dev server)
- `make preview` (interactive preview server)

Pending targets (file as findings until M4 lands them):

- `make lint` (ESLint + Prettier check)
- `make test` (Vitest unit)
- `make e2e` (Playwright + axe-core)

## ci_audit

Referenced configs a CI failure can trace to:

- `package.json` (scripts, deps, engines)
- `astro.config.mjs` (site, base, Vite plugins including `@tailwindcss/vite`)
- `tsconfig.json` (extends `astro/tsconfigs/strict`)
- `src/styles/global.css` (Tailwind 4 `@theme` token registry — design tokens live in CSS, not config)
- `.github/workflows/deploy.yml` (the only workflow)
- `.nvmrc` (Node version pin)

Tool error markers (extend the default grep set):

- `astro` (build / type-check errors)
- `vite` (dev / build pipeline errors)
- `@tailwindcss/vite` (Tailwind processing errors — note the Astro 5 vs Astro 6 rolldown incompat tracked in `astro.config.mjs` research comment)
- `rolldown` (Vite-side build errors when Astro 6 is in play; current pin is Astro 5.18.x to avoid)
- `pages` / `Pages` (deploy workflow errors)

Expected external PR checks: none. `deploy.yml` is the single workflow and is push-on-`main` only.

## slop_ground_truth

Source of truth for quantitative claims in README / docs:

- **Stack version pins:** `package.json` dependencies block — claims about Astro / Tailwind / TypeScript major versions must trace here.
- **Site identity strings:** `astro.config.mjs` (`site`, `base`) and `src/layouts/BaseLayout.astro` (`<title>`, `<meta>`) — claims about the deployed URL or site title trace here.
- **Theme tokens:** `src/styles/global.css` `@theme` block — claims about brand colors (PMS 1505c, F6BE00) or font choices (Instrument Serif, Inter) trace here.
- **Deploy artifacts:** `dist/` after `make build`; ephemeral. Persistent claims need to point at source files, not the build output.

Any quantitative claim not traceable to one of those is slop.

## fragile_docs

No fragile-claims CI script yet (would land alongside M4). When README / docs claims accumulate, mirror the `ajbarea.github.io` `scripts/check-readme-claims.mjs` pattern.

Today the README claims live in `README.md`'s "What's here" + status sections; they reference structural facts (file paths, IMPL/ROADMAP existence) that drift slowly.

## scan_scope

Skip paths:

- `.astro/`, `dist/`, `node_modules/`
- `package-lock.json`
- `public/` is fine to scan but most files there are assets, not source

Subagent scan-area split:

- Pages + layouts: `src/pages/**/*.astro`, `src/layouts/**/*.astro`
- Components: `src/components/**/*.astro` (none yet — homepage is monolithic until M2 content-collections work)
- Content collections: `src/content/**/*.md` (none yet — land with M2)
- Styles: `src/styles/*.css`
- Config / build: `astro.config.mjs`, `tsconfig.json`, `package.json`, `.github/workflows/**`, `Makefile`, `.nvmrc`
- Docs / repo: `README.md`, `IMPL.md`, `ROADMAP.md`

## docs_site

The site **is** itself a documentation site — Astro renders to `dist/` and ships via GitHub Pages.

- config: `astro.config.mjs` (Astro 5 SSG mode + Vite Tailwind plugin)
- workflow: `.github/workflows/deploy.yml` (Actions-driven Pages deploy)
- build_command: `make build` / `npm run build` / `astro build`
- output_dir: `dist/`
- preview_url: `https://ajbarea.github.io/ldqis/` (current; subject to base path = `/ldqis`)
- production_url: `https://dataqualitylabs.com` (planned; gates on M5 DNS handoff, then `astro.config.mjs` `CUSTOM_DOMAIN=true` env flip)
- action_pins (expected current, 2026-05): `actions/checkout@v5`, `actions/setup-node@v5`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`

## sister_graduation

Promoted to a sister 2026-05-21 ahead of original M6 schedule (AJ requested visibility). Status of the M6 DoD items:

- [x] Entry added to `~/.claude/techne.toml`
- [x] `Makefile` exists with sister-shape targets (current scope: `setup / dev / build / preview / check / clean`; `lint / test / e2e` are M4 follow-ons)
- [x] `.claude/skill-context.md` filled in with per-skill facts (this file)
- [ ] First successful `/techne:audit` run against this repo
- [ ] First successful `/techne:sisters` audit run that includes ldqis with no missing-primitive findings
- [ ] `~/ajsoftworks/MEMORY.md` index entry updated to note ldqis is now a sister (already done 2026-05-21; check this off when the entry is verified)

The audit will surface the `lint / test / e2e` gap and the unwritten `fragile_docs` script as findings until M4 lands them. That's expected — the gap was intentionally pulled forward.
