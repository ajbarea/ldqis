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

// ─── Live site URL claim ───────────────────────────────────────────────────
// Status section claims `https://dataqualitylabs.com/`. The site URL is
// astro.config's `site`, so the README origin must appear there as a literal.
const claimedSiteUrl = readme.match(/https:\/\/dataqualitylabs\.com\//);
if (!claimedSiteUrl) {
  failures.push("README status: live site URL not found (expected `https://dataqualitylabs.com/`)");
} else {
  const expectedSite = claimedSiteUrl[0].replace(/\/$/, "");
  if (!astroConfig.includes(`"${expectedSite}"`)) {
    failures.push(
      `README site URL: claims \`${expectedSite}\` but astro.config.mjs has no matching site literal`,
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
