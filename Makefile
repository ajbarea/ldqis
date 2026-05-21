##
## ldqis — LDQIS lab website
## Astro 5 + Tailwind 4 + GitHub Pages
##
## Usage:
##   make help     Show all available commands
##   make setup    Install dependencies (clean install from package-lock.json)
##   make dev      Start the Astro dev server (interactive, hot reload)
##   make build    Production build into dist/
##   make preview  Serve the production build locally for verification
##   make check    Astro type-check (the closest thing to a lint pass today)
##   make clean    Remove dist/ + .astro/ caches
##

.PHONY: help setup dev build preview check clean
.DEFAULT_GOAL := help

# ════════════════════════════════════════════════════════════════════════════
# Help
# ════════════════════════════════════════════════════════════════════════════

help:                       ## Show this help
	@echo ""
	@echo "ldqis — LDQIS lab website"
	@echo ""
	@echo " Available make commands"
	@echo " ────────────────────────"
	@echo ""
	@echo "  setup    Install dependencies (npm ci, clean install from lock)"
	@echo "  dev      Astro dev server with hot reload (interactive)"
	@echo "  build    Production build into dist/"
	@echo "  preview  Serve the production build locally"
	@echo "  check    Astro type-check"
	@echo "  clean    Remove dist/ and .astro/ caches"
	@echo ""
	@echo " Pending (land with M4 of ROADMAP)"
	@echo " ─────────────────────────────────"
	@echo "  lint     ESLint + Prettier check (no config yet)"
	@echo "  test     Vitest unit tests (no tests yet)"
	@echo "  e2e      Playwright + axe-core a11y scan (no tests yet)"
	@echo ""

# ════════════════════════════════════════════════════════════════════════════
# Setup
# ════════════════════════════════════════════════════════════════════════════

setup:                      ## Install dependencies (npm ci)
	@npm ci

# ════════════════════════════════════════════════════════════════════════════
# Development
# ════════════════════════════════════════════════════════════════════════════

dev:                        ## Astro dev server with hot reload
	@npm run dev

# ════════════════════════════════════════════════════════════════════════════
# Build / verify
# ════════════════════════════════════════════════════════════════════════════

build:                      ## Production build into dist/
	@npm run build

preview:                    ## Serve the production build locally
	@npm run preview

check:                      ## Astro type-check
	@npm run check

# ════════════════════════════════════════════════════════════════════════════
# Clean
# ════════════════════════════════════════════════════════════════════════════

clean:                      ## Remove dist/ and .astro/ caches
	@rm -rf dist .astro
	@echo "Cleaned dist/ and .astro/"
