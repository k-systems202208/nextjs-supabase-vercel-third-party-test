import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { addBookmark, deleteBookmark, updateBookmark } from "@/features/bookmarks/actions";
import { listE2EBookmarks } from "@/lib/e2e/bookmarks-store";
import { isBrowserE2EMode } from "@/lib/e2e/mode";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type Bookmark = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
};

type SearchParams = Promise<{ error?: string | string[] }>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookmarksPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const actionError = first(params.error);
  let bookmarks: Bookmark[] = [];
  let loadError = false;

  if (isBrowserE2EMode()) {
    bookmarks = listE2EBookmarks();
  } else {
    if (!isSupabaseConfigured()) {
      return (
        <main className="shell">
          <section className="card">
            <h1>Bookmarks</h1>
            <p>Supabase が未設定です。.env.local を設定してから再度開いてください。</p>
            <p>
              DBは <code>supabase/migrations/20260904144500_create_bookmarks.sql</code> を適用します。
            </p>
            <Link href="/">トップへ戻る</Link>
          </section>
        </main>
      );
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getClaims();
    const userId = authData?.claims?.sub;

    if (authError || typeof userId !== "string") {
      redirect("/auth/login");
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .select("id,name,url,created_at,updated_at")
      .order("created_at", { ascending: false });

    bookmarks = (data ?? []) as Bookmark[];
    loadError = Boolean(error);
  }

  return (
    <main className="shell dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">PRIVATE BOOKMARKS</p>
          <h1>Bookmarks</h1>
          <p className="muted">自分だけのリンクをSupabase RLSで分離して保存します。</p>
        </div>
        <form action={signOut}>
          <button className="button secondary" type="submit">ログアウト</button>
        </form>
      </header>

      {actionError ? <p className="notice error">{actionError}</p> : null}

      {loadError ? (
        <section className="card">
          <h2>Database setup required</h2>
          <p>bookmarks テーブルを取得できませんでした。</p>
          <p><code>supabase/migrations/20260904144500_create_bookmarks.sql</code> を適用してください。</p>
        </section>
      ) : (
        <>
          <section className="card">
            <h2>Bookmarkを追加</h2>
            <form action={addBookmark} className="bookmark-add-form">
              <input name="name" maxLength={120} placeholder="例: OpenAI" aria-label="Bookmark名" required />
              <input name="url" type="url" maxLength={2048} placeholder="https://example.com" aria-label="Bookmark URL" required />
              <button type="submit" className="button primary">追加</button>
            </form>
          </section>

          <section className="card">
            <h2>自分のBookmarks</h2>
            {bookmarks.length === 0 ? <p className="muted">まだBookmarkはありません。</p> : null}
            <ul className="bookmark-list">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.id} className="bookmark-row" data-bookmark-id={bookmark.id}>
                  <div className="bookmark-main">
                    <a href={bookmark.url} target="_blank" rel="noreferrer noopener" className="bookmark-link">
                      {bookmark.name}
                    </a>
                    <span className="muted bookmark-url">{bookmark.url}</span>
                  </div>

                  <details className="bookmark-edit">
                    <summary>編集</summary>
                    <form action={updateBookmark} className="bookmark-edit-form">
                      <input type="hidden" name="id" value={bookmark.id} />
                      <input name="name" defaultValue={bookmark.name} maxLength={120} aria-label="編集 Bookmark名" required />
                      <input name="url" type="url" defaultValue={bookmark.url} maxLength={2048} aria-label="編集 Bookmark URL" required />
                      <button type="submit" className="button secondary">更新</button>
                    </form>
                  </details>

                  <form action={deleteBookmark}>
                    <input type="hidden" name="id" value={bookmark.id} />
                    <button type="submit" className="button danger">削除</button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="footer-link"><Link href="/">トップへ戻る</Link></p>
    </main>
  );
}
