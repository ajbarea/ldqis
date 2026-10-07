import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");

// The newest mtime under a path.
function newest(path: string): number {
  if (!existsSync(path)) return 0;
  if (!statSync(path).isDirectory()) return statSync(path).mtimeMs;
  return readdirSync(path).reduce((m, f) => Math.max(m, newest(join(path, f))), 0);
}

if (!existsSync(INDEX))
  throw new Error("dist/ is missing: run `npm run build` before the e2e tests");
const builtAt = statSync(INDEX).mtimeMs;
// Inputs `astro build` reads. The lockfile is compared by content (the hash the build
// recorded), since a no-op `npm install` bumps its mtime.
const stale = ["src", "public", "astro.config.mjs", "package.json"].filter(
  (p) => newest(join(ROOT, p)) > builtAt,
);
const lockHash = createHash("sha256")
  .update(readFileSync(join(ROOT, "package-lock.json")))
  .digest("hex");
const builtHash = existsSync(join(DIST, ".lock-hash"))
  ? readFileSync(join(DIST, ".lock-hash"), "utf8")
  : "";
if (lockHash !== builtHash) stale.push("package-lock.json");
if (stale.length)
  throw new Error(
    `dist/ is older than ${stale.join(", ")}: run \`npm run build\` so every route is covered`,
  );

// Every built page, as a path relative to baseURL, /admin included.
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });
}

export const ROUTES: string[] = walk(DIST)
  .map((p) => relative(DIST, p).split("\\").join("/"))
  .map((p) => (p === "index.html" ? "" : p.endsWith("/index.html") ? p.slice(0, -10) : p))
  .sort();

export const THEMES = ["light", "dark"] as const;
