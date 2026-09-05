import { randomUUID } from "node:crypto";
import { isBrowserE2EMode } from "./mode";

export type E2EBookmark = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
};

type E2EGlobal = typeof globalThis & {
  __browserE2EBookmarks?: E2EBookmark[];
};

function store() {
  if (!isBrowserE2EMode()) {
    throw new Error("Browser E2E fixture store is disabled outside E2E test mode.");
  }

  const globalStore = globalThis as E2EGlobal;
  globalStore.__browserE2EBookmarks ??= [];
  return globalStore.__browserE2EBookmarks;
}

export function listE2EBookmarks() {
  return [...store()];
}

export function addE2EBookmark(name: string, url: string) {
  const now = new Date().toISOString();
  store().unshift({
    id: randomUUID(),
    name,
    url,
    created_at: now,
    updated_at: now,
  });
}

export function updateE2EBookmark(id: string, name: string, url: string) {
  const bookmark = store().find((item) => item.id === id);
  if (!bookmark) return;

  bookmark.name = name;
  bookmark.url = url;
  bookmark.updated_at = new Date().toISOString();
}

export function deleteE2EBookmark(id: string) {
  const bookmarks = store();
  const index = bookmarks.findIndex((item) => item.id === id);
  if (index >= 0) bookmarks.splice(index, 1);
}

export function resetE2EBookmarks() {
  const bookmarks = store();
  bookmarks.splice(0, bookmarks.length);
}
