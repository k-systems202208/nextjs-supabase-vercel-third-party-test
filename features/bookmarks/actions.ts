"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function bookmarksError(message: string) {
  return `/bookmarks?error=${encodeURIComponent(message)}`;
}

function normalizeName(value: FormDataEntryValue | null) {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name || name.length > 120) {
    redirect(bookmarksError("名前は1〜120文字で入力してください。"));
  }
  return name;
}

function normalizeUrl(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || raw.length > 2048) {
    redirect(bookmarksError("URLは1〜2048文字で入力してください。"));
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      redirect(bookmarksError("http または https のURLを入力してください。"));
    }
    return parsed.toString();
  } catch {
    redirect(bookmarksError("正しいURLを入力してください。"));
  }
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") {
    redirect("/auth/login");
  }

  return { supabase, userId };
}

export async function addBookmark(formData: FormData) {
  const name = normalizeName(formData.get("name"));
  const url = normalizeUrl(formData.get("url"));
  const { supabase, userId } = await authenticatedClient();

  const { error } = await supabase.from("bookmarks").insert({
    name,
    url,
    user_id: userId,
  });

  if (error) {
    redirect(bookmarksError("Bookmarkを追加できませんでした。Supabase Migration / RLSを確認してください。"));
  }

  revalidatePath("/bookmarks");
}

export async function updateBookmark(formData: FormData) {
  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue : "";
  if (!uuidPattern.test(id)) {
    redirect(bookmarksError("不正なBookmark IDです。"));
  }

  const name = normalizeName(formData.get("name"));
  const url = normalizeUrl(formData.get("url"));
  const { supabase, userId } = await authenticatedClient();

  const { error } = await supabase
    .from("bookmarks")
    .update({ name, url, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    redirect(bookmarksError("Bookmarkを更新できませんでした。"));
  }

  revalidatePath("/bookmarks");
}

export async function deleteBookmark(formData: FormData) {
  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue : "";
  if (!uuidPattern.test(id)) {
    redirect(bookmarksError("不正なBookmark IDです。"));
  }

  const { supabase, userId } = await authenticatedClient();
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    redirect(bookmarksError("Bookmarkを削除できませんでした。"));
  }

  revalidatePath("/bookmarks");
}
