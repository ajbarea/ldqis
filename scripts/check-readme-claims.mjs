#!/usr/bin/env node
/**
 * Assert the README's "fragile" marketing claims still match the source files.
 *
 * Mirrors the ajbarea.github.io scripts/check-readme-claims.mjs pattern —
 * each assertion is narrow on purpose so a failure points at the exact
 * line of drift rather than a vague "README looks stale" hand-wave.
 *
 * Extend the registry below when a new fragile claim lands in README.
 *
 * Run locally: node scripts/check-readme-claims.mjs
 * Exit codes: 0 = all assertions pass, 1 = at least one mismatch.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import process from "node:process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const readme = readFileSync(resolve(root, "README.md"), "utf-8");
const makefile = readFileSync(resolve(root, "Makefile"), "utf-8");
const astroConfig = readFileSync(resolve(root, "astro.config.mjs"), "utf-8");

const failures = [];

// ─── Makefile target claims ────────────────────────────────────────────────
// Quick-start block lists `make <target>` invocations. Every one of those
// targets must resolve to a real recipe in the Makefile so a reader who
// copy-pastes the snippet doesn't hit "No rule to make target …".
const quickStartBlock = readme.match(/```bash\n([\s\S]*?)```/);
if (!quickStartBlock) {
  failures.push('README: Quick start "```bash" block not found');
} else {
  const claimedTargets = [...quickStartBlock[1].matchAll(/^\s*make\s+([\w-]+)/gm)].map((m) => m[1]);
  // Also include the inline mention `\`make help\` lists every target.`
  for (const m of readme.matchAll(/`make\s+([\w-]+)`/g)) {
    claimedTargets.push(m[1]);
  }
  const actualTargets = new Set([...makefile.matchAll(/^([a-z][\w-]*):/gm)].map((m) => m[1]));
  for (const target of new Set(claimedTargets)) {
    if (!actualTargets.has(target)) {
      failures.push(
        `README quick-start: claims \`make ${target}\` but Makefile has no \`${target}:\` target`,
      );
    }
  }
}

// ─── GitHub Pages preview URL claim ────────────────────────────────────────
// Status section claims `https://ajbarea.github.io/ldqis/`. The site URL
// is composed from astro.config's `site` + `base`; until M5 DNS handoff
// lands the apex domain, the preview path must remain in sync.
const claimedPreviewUrl = readme.match(/https:\/\/([\w.-]+)\.github\.io\/([\w-]+)\//);
if (!claimedPreviewUrl) {
  failures.push(
    "README status: GitHub Pages preview URL not found (expected `https://<owner>.github.io/<repo>/`)",
  );
} else {
  const [, owner, repo] = claimedPreviewUrl;
  const expectedSite = `https://${owner}.github.io`;
  const expectedBase = `/${repo}`;
  // `site:` and `base:` may be ternaries (e.g. `isCustomDomain ? "/" : "/ldqis"`),
  // so verify the expected string literal appears somewhere in the config
  // rather than parsing the assignment value. The CUSTOM_DOMAIN branch keeps
  // the other (apex-domain) literals; both must stay present until M5 ships.
  if (!astroConfig.includes(`"${expectedSite}"`)) {
    failures.push(
      `README preview URL: claims \`${expectedSite}\` but astro.config.mjs has no matching site literal`,
    );
  }
  if (!astroConfig.includes(`"${expectedBase}"`)) {
    failures.push(
      `README preview URL: claims base \`${expectedBase}\` but astro.config.mjs has no matching base literal`,
    );
  }
}

// ─── Report ────────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error("README claim drift detected:\n");
  for (const f of failures) console.error("  - " + f);
  console.error(
    "\nFix: update README.md or the source file so they agree. See scripts/check-readme-claims.mjs for the fragile-claim registry.",
  );
  process.exit(1);
}

console.log("README claim checks: all passed");
