import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const schema = read("supabase/migrations/20260904144500_create_bookmarks.sql");
const actions = read("features/bookmarks/actions.ts");
const page = read("app/(app)/bookmarks/page.tsx");
const serviceWorker = read("public/sw.js");

test("Todo sample is removed and Bookmarks feature is independent", () => {
  for (const path of [
    "app/(app)/bookmarks/page.tsx",
    "features/bookmarks/actions.ts",
    "supabase/migrations/20260904144500_create_bookmarks.sql",
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true, `${path} is missing`);
  }

  for (const path of [
    "app/(sample)/dashboard/page.tsx",
    "features/todos/actions.ts",
    "supabase/sample/todos.sql",
    "tests/sample.test.mjs",
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), false, `${path} should be removed`);
  }
});

test("bookmarks table is protected by ownership RLS", () => {
  assert.match(schema, /alter table public\.bookmarks enable row level security/i);
  assert.match(schema, /revoke all on table public\.bookmarks from anon/i);
  assert.match(schema, /grant select, insert, update, delete on table public\.bookmarks to authenticated/i);
  assert.match(schema, /for select[\s\S]*auth\.uid\(\)[\s\S]*user_id/i);
  assert.match(schema, /for insert[\s\S]*with check[\s\S]*auth\.uid\(\)[\s\S]*user_id/i);
  assert.match(schema, /for update[\s\S]*using[\s\S]*with check/i);
  assert.match(schema, /for delete[\s\S]*auth\.uid\(\)[\s\S]*user_id/i);
});

test("bookmark actions validate input and keep owner filtering", () => {
  assert.match(actions, /name\.length > 120/);
  assert.match(actions, /raw\.length > 2048/);
  assert.match(actions, /parsed\.protocol !== "https:"/);
  assert.match(actions, /parsed\.protocol !== "http:"/);
  assert.match(actions, /\.eq\("user_id", userId\)/);
  assert.match(actions, /revalidatePath\("\/bookmarks"\)/);
});

test("bookmarks page uses authenticated server-side Supabase access", () => {
  assert.match(page, /supabase\.auth\.getClaims\(\)/);
  assert.match(page, /redirect\("\/auth\/login"\)/);
  assert.match(page, /\.from\("bookmarks"\)/);
  assert.match(page, /addBookmark/);
  assert.match(page, /updateBookmark/);
  assert.match(page, /deleteBookmark/);
});

test("private bookmarks route is excluded from service worker caching", () => {
  assert.match(serviceWorker, /pathname\.startsWith\("\/bookmarks"\)/);
});
