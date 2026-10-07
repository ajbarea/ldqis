import { existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");

// The newest mtime under a path; skips public/admin/cms, which older previews rewrote.
function newest(path: string): number {
  if (!existsSync(path)) return 0;
  if (!statSync(path).isDirectory()) return statSync(path).mtimeMs;
  return readdirSync(path).reduce((m, f) => Math.max(m, newest(join(path, f))), 0);
}

if (!existsSync(INDEX))
  throw new Error("dist/ is missing: run `npm run build` before the e2e tests");
const builtAt = statSync(INDEX).mtimeMs;
const stale = ["src", "public", "scripts", "astro.config.mjs", "package.json"].filter(
  (p) => newest(join(ROOT, p)) > builtAt,
);
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
