import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { mkdir } from "node:fs/promises";

const OUT = "/tmp/vfl-prefab-preview";
await mkdir(OUT, { recursive: true });

const USER = "demo-prefab-preview";

// Pull two complete run_ids fresh from the vFL DB so we don't hard-code stale ones.
const runIds = JSON.parse(
  execSync(
    `cd /home/ajbar/ajsoftworks/vFL && uv run --quiet python -c "
import json
from velocity import db
rows = db.recent_runs('${USER}', 20)
print(json.dumps({
    'a': next(r['run_id'] for r in rows if r['strategy']=='FedAvg' and r['status']=='complete'),
    'b': next(r['run_id'] for r in rows if r['strategy']=='Krum'   and r['status']=='complete'),
}))
"`,
    { encoding: "utf8" },
  ),
);
console.log("runs:", runIds);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log(`[pageerror]`, e.message));

async function ready() {
  await page.goto("http://localhost:8902", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#app-frame");
  await page.waitForTimeout(2500);
  return page.frames().find((f) => f.url().includes("/picker-app"));
}

async function runTool(tool, args, screenshotName) {
  const app = await ready();
  await app.locator('[role="combobox"]').first().click();
  await app.waitForTimeout(400);
  await app.locator(`[role="option"]`, { hasText: tool }).first().click();
  await app.waitForTimeout(800);
  const visibleForm = app.locator("form:visible").first();
  for (const [name, value] of Object.entries(args)) {
    const label = name.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    const field = visibleForm
      .locator(`label:has-text("${label}")`)
      .locator("..")
      .locator("input,textarea")
      .first();
    await field.fill(String(value));
  }
  await visibleForm.locator('button:has-text("Launch")').click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}/${screenshotName}.png`, fullPage: true });
  console.log(`saved ${screenshotName}.png`);
}

await page.goto("http://localhost:8902", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/01-picker-landing.png`, fullPage: true });
console.log("saved 01-picker-landing.png");

await runTool("list_runs", { user_id: USER, limit: 5 }, "02-list_runs");
await runTool("memory_ledger", { user_id: USER, limit: 50 }, "03-memory_ledger");
await runTool("run_rounds_history", { run_id: runIds.a }, "04-run_rounds_history");
await runTool("compare_runs", { run_id_a: runIds.a, run_id_b: runIds.b }, "05-compare_runs");

await browser.close();
