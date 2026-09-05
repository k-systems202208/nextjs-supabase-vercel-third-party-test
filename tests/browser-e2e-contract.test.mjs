import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const packageJson = JSON.parse(read("package.json"));
const ci = read(".github/workflows/ci.yml");
const e2eMode = read("lib/e2e/mode.ts");
const proxy = read("proxy.ts");
const supabaseEnv = read("lib/supabase/env.ts");
const browserSpec = read("e2e/browser.spec.ts");

test("browser keyboard E2E is part of the CI contract", () => {
  assert.equal(packageJson.scripts["test:e2e"], "playwright test");
  assert.match(ci, /@playwright\/test@1\.62\.1/);
  assert.match(ci, /playwright install --with-deps chromium/);
  assert.match(ci, /Browser keyboard E2E/);
  assert.match(ci, /npm run test:e2e/);
  assert.equal(existsSync(new URL("../playwright.config.ts", import.meta.url)), true);
});

test("E2E fixture mode cannot activate in production", () => {
  assert.match(e2eMode, /E2E_TEST_MODE === "1"/);
  assert.match(e2eMode, /NODE_ENV !== "production"/);
  assert.match(proxy, /isBrowserE2EMode\(\)/);
  assert.doesNotMatch(proxy, /source:\s*"auth-proxy"/);
});

test("browser E2E types through auth and Bookmarks CRUD", () => {
  assert.match(browserSpec, /pressSequentially\("browser-e2e@example\.com"\)/);
  assert.match(browserSpec, /pressSequentially\("OpenAI"\)/);
  assert.match(browserSpec, /pressSequentially\("OpenAI Official"\)/);
  assert.match(browserSpec, /name: "追加"/);
  assert.match(browserSpec, /name: "更新"/);
  assert.match(browserSpec, /name: "削除"/);
});

test("Supabase configuration validates URL syntax instead of presence only", () => {
  assert.match(supabaseEnv, /new URL\(value\)/);
  assert.match(supabaseEnv, /parsed\.protocol === "http:"/);
  assert.match(supabaseEnv, /parsed\.protocol === "https:"/);
});
