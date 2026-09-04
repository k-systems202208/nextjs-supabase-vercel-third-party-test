import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const included = [
  "Next.js 16 App Router / TypeScript",
  "Supabase SSR Cookie Auth",
  "利用者ごとのBookmarks CRUD",
  "Row Level Securityによる所有者分離",
  "Installable PWA / Offline fallback",
  "GitHub Actions CI / Vercel deployment",
];

export default function Home() {
  const configured = isSupabaseConfigured();

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">THIRD-PARTY TEMPLATE TEST</p>
        <h1>Bookmarks Web App</h1>
        <p className="lead">
          Next.js + Supabase + Vercelテンプレートから、Todoサンプルを削除して作成した独自アプリです。
        </p>

        <div className={`status ${configured ? "ok" : "warn"}`}>
          <strong>Supabase:</strong>{" "}
          {configured
            ? "環境変数が設定されています。ログインしてBookmarksを利用できます。"
            : ".env.local を設定すると認証とBookmarksを利用できます。"}
        </div>

        <div className="hero-actions">
          <Link className="button primary" href={configured ? "/auth/login" : "/bookmarks"}>
            {configured ? "ログイン" : "セットアップ状態を確認"}
          </Link>
          <Link className="button secondary" href="/bookmarks">Bookmarksを開く</Link>
        </div>
      </section>

      <section className="card">
        <h2>Included</h2>
        <ul>
          {included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>初回セットアップ</h2>
        <ol>
          <li><code>.env.example</code> を <code>.env.local</code> にコピー</li>
          <li>Supabase Project URL / Publishable Key を設定</li>
          <li><code>supabase/migrations/20260904144500_create_bookmarks.sql</code> を適用</li>
          <li>Supabase Auth の Site URL / Redirect URLs を設定</li>
          <li><code>npm run check</code> で一括検証</li>
        </ol>
      </section>
    </main>
  );
}
