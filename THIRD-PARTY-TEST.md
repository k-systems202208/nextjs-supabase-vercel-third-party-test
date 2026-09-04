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
13. Vercelへ実Deployして動作確認

## 独自feature

```text
app/(app)/bookmarks/page.tsx
features/bookmarks/actions.ts
supabase/migrations/20260904144500_create_bookmarks.sql
tests/bookmarks.test.mjs
```

## 確認済みの注意点

- `Use this template` ではRepository Rulesetは引き継がれない。
- `setup-github.ps1` 適用前はmainへの直接変更が技術的に可能なので、カスタマイズ開始前に安全設定を適用するのが重要。
- ChatGPT GitHub連携をRepository限定にしている場合、新Repositoryを連携対象へ追加する必要がある。
- private route `/bookmarks` はService Workerのキャッシュ対象外にする。
- 独自READMEへ変更しても、Operations / Extending / GitHub Setupなど共通資料への導線を残す。

## 最終結果

Supabase / Vercel / main CIまで完了後に追記します。
