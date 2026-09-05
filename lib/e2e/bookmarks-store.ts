import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isBrowserE2EMode } from "./mode";

export type E2EBookmark = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
};

const fixtureDirectory = join(process.cwd(), ".next");
const fixturePath = join(fixtureDirectory, "browser-e2e-bookmarks.json");

function assertEnabled() {
  if (!isBrowserE2EMode()) {
    throw new Error("Browser E2E fixture store is disabled outside E2E test mode.");
  }
}

function readStore(): E2EBookmark[] {
  assertEnabled();

  try {
    return JSON.parse(readFileSync(fixturePath, "utf8")) as E2EBookmark[];
  } catch {
    return [];
  }
}

function writeStore(bookmarks: E2EBookmark[]) {
  assertEnabled();
  mkdirSync(fixtureDirectory, { recursive: true });
  writeFileSync(fixturePath, JSON.stringify(bookmarks), "utf8");
}

export function listE2EBookmarks() {
  return readStore();
}

export function addE2EBookmark(name: string, url: string) {
  const bookmarks = readStore();
  const now = new Date().toISOString();
  bookmarks.unshift({
    id: randomUUID(),
    name,
    url,
    created_at: now,
    updated_at: now,
  });
  writeStore(bookmarks);
}

export function updateE2EBookmark(id: string, name: string, url: string) {
  const bookmarks = readStore();
  const bookmark = bookmarks.find((item) => item.id === id);
  if (!bookmark) return;

  bookmark.name = name;
  bookmark.url = url;
  bookmark.updated_at = new Date().toISOString();
  writeStore(bookmarks);
}

export function deleteE2EBookmark(id: string) {
  const bookmarks = readStore().filter((item) => item.id !== id);
  writeStore(bookmarks);
}

export function resetE2EBookmarks() {
  writeStore([]);
}
