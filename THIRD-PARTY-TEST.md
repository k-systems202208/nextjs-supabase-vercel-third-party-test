# Next.js Third-party Template Test

このRepositoryは `nextjs-supabase-vercel-webapp-template` の第三者利用実地テスト用です。

## 実施シナリオ

1. GitHubの **Use this template** から新規Repositoryを作成
2. ChatGPT GitHub連携へ新Repositoryを追加
3. Repository Rulesetが引き継がれないことを確認
4. 日本語Issue #3を作成
5. `feat/3-third-party-bookmarks` Branchを作成
6. Todoサンプルを削除
7. 独自Bookmarks featureを追加
8. Supabase Migration / RLSを追加
9. `quality` CIを確認
10. `Protect main` Rulesetを適用
11. Squash Merge / main CIを確認
12. Supabase実ProjectでSchema / RLS / Advisorを確認
13. Vercelへ実Deploy
14. Production AuthのRedirectを固定 `/auth/confirm` へ調整

## 独自feature

```text
app/(app)/bookmarks/page.tsx
features/bookmarks/actions.ts
supabase/migrations/20260904144500_create_bookmarks.sql
supabase/migrations/20260904150000_tighten_bookmarks_grants.sql
supabase/migrations/20260904150500_add_bookmarks_user_id_index.sql
tests/bookmarks.test.mjs
```

## Supabase実地確認

テスト用Project `nextjs-bookmarks-third-party-test` を東京リージョンへ作成し、Repository内のMigrationを実際に適用した。

確認結果:

- `public.bookmarks` のRLS有効
- `user_id -> auth.users(id)` FK有効
- SELECT / INSERT / UPDATE / DELETEの所有者RLS Policyを確認
- `anon` にはtable権限なし
- `authenticated` はCRUD権限だけに限定
- User A / User BをTransaction内で一時作成し、他ユーザー行の参照・更新・削除ができないことを実動確認
- Security Advisorの指摘0件
- FK index不足をPerformance Advisorで検出し、`bookmarks_user_id_idx` を追加
- 作成直後のため、追加indexに対する `unused_index` INFOのみ残る。実データ未使用時は想定内

## GitHub / Vercel実地確認

- 新Repositoryへ `Protect main` Rulesetを実際に適用
- Required Checkは `quality`
- PR #4をSquash Merge
- merge後main CI Run #18成功
- 作業Branchの自動削除を確認
- Vercel Production URL: `https://nextjs-supabase-vercel-third-party.vercel.app`
- merge済みmain SHAに対するGitHubのVercel deployment statusが `success`

## Production Auth設定

Vercel Productionでは次を設定する。

```text
NEXT_PUBLIC_SITE_URL=https://nextjs-supabase-vercel-third-party.vercel.app
```

Supabase **Authentication → URL Configuration**:

```text
Site URL:
https://nextjs-supabase-vercel-third-party.vercel.app

Additional Redirect URL:
https://nextjs-supabase-vercel-third-party.vercel.app/auth/confirm
```

Productionの確認メール戻り先は `/auth/confirm` 固定とし、不必要に広いwildcardを使わない。

## 実地テストで見つかった改善点

- `Use this template` ではRepository Rulesetは引き継がれない。
- `setup-github.ps1` 適用前はmainへの直接変更が技術的に可能なので、カスタマイズ開始前に安全設定を適用するのが重要。
- ChatGPT GitHub連携をRepository限定にしている場合、新Repositoryを連携対象へ追加する必要がある。
- Supabase新規tableでは、必要なCRUDをgrantする前に `authenticated` に対しても `revoke all` しないと、既定権限の `REFERENCES / TRIGGER / TRUNCATE` が残る場合がある。
- ownership RLSで `user_id` を検索条件に使うtableでは、FKを作るだけでなくcovering indexも確認する。
- Production Authでは `NEXT_PUBLIC_SITE_URL` とSupabase Site URL / Redirect URLを本番URLへ明示する。
- private route `/bookmarks` はService Workerのキャッシュ対象外にする。
- 独自READMEへ変更しても、Operations / Extending / GitHub Setupなど共通資料への導線を残す。

## 最終確認

自動確認済み:

- Todo削除後の独自Bookmarks実装
- PR / mainの `quality` CI
- Supabase実DB / RLS / 最小権限 / index / Advisor
- GitHub Ruleset / Squash Merge
- Vercel Production Deploy success

Productionのブラウザ実操作では、次を最終確認する。

```text
/
/api/health
/auth/sign-up
/auth/login
/bookmarks
```

Sign up → 確認メール → Login → Bookmark追加 / 更新 / 削除まで通れば、第三者実地利用テスト完了とする。
