import { existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const DIST = join(ROOT, "dist");

// The newest mtime under a directory.
function newest(dir: string): number {
  return readdirSync(dir).reduce((m, f) => {
    const p = join(dir, f);
    return Math.max(m, statSync(p).isDirectory() ? newest(p) : statSync(p).mtimeMs);
  }, 0);
}

if (!existsSync(DIST))
  throw new Error("dist/ is missing: run `npm run build` before the e2e tests");
if (newest(join(ROOT, "src")) > statSync(join(DIST, "index.html")).mtimeMs)
  throw new Error("dist/ is older than src/: run `npm run build` so every route is covered");

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
