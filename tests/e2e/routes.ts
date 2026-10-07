import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = join(process.cwd(), "dist");

// Every built page, as a path relative to baseURL. /admin is the third-party CMS
// bundle, not site content, so it is left out.
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });
}

export const ROUTES: string[] = walk(DIST)
  .map((p) => relative(DIST, p).split("\\").join("/"))
  .map((p) => (p === "index.html" ? "" : p.endsWith("/index.html") ? p.slice(0, -10) : p))
  .filter((p) => !p.startsWith("admin/"))
  .sort();

export const THEMES = ["light", "dark"] as const;
