# 本番デプロイ手順（Vercel + Neon PostgreSQL）

NOBLE DRIVE を本番公開するための手順です。**接続文字列やシークレットの取得・入力はあなた自身の環境で行ってください**（このドキュメントは操作の案内のみで、実際のキーは含みません）。

構成:
- ホスティング: **Vercel**（Next.js 公式ホスティング）
- データベース: **Neon**（サーバーレス PostgreSQL）
- 決済: **Stripe**（任意。未設定ならモック決済で動作）

---

## 1. Neon で PostgreSQL を用意する

1. https://neon.tech でアカウント作成し、プロジェクトを新規作成する。
2. 作成後に表示される **接続文字列（Connection string）** を控える。Neon には 2 種類あります:
   - **Pooled connection**（ホスト名に `-pooler` を含む）… アプリのランタイム用 → `DATABASE_URL`
   - **Direct connection**（`-pooler` を含まない）… migrate / seed 用 → `DIRECT_URL`
   - どちらも末尾に `?sslmode=require` を付けてください。
3. ダッシュボードの "Connection Details" で pooled / direct を切り替えて両方コピーできます。

## 2. ローカルで migrate & seed（初回のみ）

ローカルの `.env`（`.env.example` を参照）に、Neon の `DATABASE_URL` と `DIRECT_URL` を設定してから:

```bash
cd carshare

# スキーマから Prisma Client を生成
npx prisma generate

# Neon にテーブルを作成（初回のマイグレーションを作成 & 適用）
npx prisma migrate dev --name init

# サンプルデータ（車両2台・テストユーザー2名）を投入
npm run db:seed
```

> `prisma migrate dev` は `prisma.config.ts` の設定により `DIRECT_URL`（あれば）を使います。pooler 経由での migrate 失敗を避けるためです。

投入されるテストアカウント:
- 管理者: `admin@example.com` / `admin1234`
- 一般: `user@example.com` / `user1234`

> 本番公開前に、これらのテストアカウントは削除するか、パスワードを変更してください。

## 3. Vercel にデプロイする

### 3-1. リポジトリを用意
このプロジェクトを Git リポジトリにして GitHub 等へ push します（`.env` はコミットされません）。

### 3-2. Vercel でプロジェクトを作成
1. https://vercel.com でアカウント作成 → "Add New… → Project" でリポジトリをインポート。
2. **Root Directory を `carshare` に設定**（このリポジトリはサブディレクトリ構成のため）。
3. Framework Preset は Next.js が自動検出されます。

### 3-3. 環境変数を設定
Vercel のプロジェクト設定 → "Environment Variables" に以下を追加（Production / Preview 両方）:

| 変数名 | 値 |
| --- | --- |
| `DATABASE_URL` | Neon の **pooled** 接続文字列（`?sslmode=require` 付き） |
| `DIRECT_URL` | Neon の **direct** 接続文字列（`?sslmode=require` 付き） |
| `SESSION_SECRET` | ランダムな長い文字列（`openssl rand -hex 32` で生成） |
| `NEXT_PUBLIC_BASE_URL` | デプロイ先の公開 URL（例: `https://your-app.vercel.app`） |
| `STRIPE_SECRET_KEY` | （任意）Stripe のシークレットキー |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | （任意）Stripe の公開キー |

> `postinstall` で `prisma generate` が走るため、Vercel のビルド時に Prisma Client は自動生成されます（`src/generated/prisma` はコミット不要）。

### 3-4. デプロイ
"Deploy" を実行。ビルドが通れば公開されます。

> 初回デプロイ後、独自ドメインを設定した場合は `NEXT_PUBLIC_BASE_URL` をそのドメインに更新して再デプロイしてください（Stripe のリダイレクト URL に使われます）。

## 4. 本番の DB マイグレーション運用

スキーマを変更したとき:

```bash
# ローカルでマイグレーションファイルを作成
npx prisma migrate dev --name <変更内容>
# 生成された prisma/migrations/ をコミット & push
```

本番（Neon）への適用は、次のいずれか:
- ローカルから本番の接続文字列で `npm run db:migrate`（= `prisma migrate deploy`）を実行、または
- Vercel のビルドコマンドに `prisma migrate deploy && next build` を設定して自動適用。

## 5. Stripe を本番決済にする（任意）

- 現状 `STRIPE_SECRET_KEY` 未設定ならモック決済（即時成功）で動作します。
- 本番決済を有効にするには Stripe のキーを環境変数に設定してください。決済成功後は `NEXT_PUBLIC_BASE_URL` のリダイレクト先へ戻ります。
- より確実な決済確定のために、将来的には Stripe Webhook での支払い確定処理の追加を推奨します（MVP では success リダイレクトで確定）。

---

## チェックリスト

- [ ] Neon プロジェクト作成、pooled / direct の接続文字列を取得
- [ ] ローカル `.env` に `DATABASE_URL` / `DIRECT_URL` / `SESSION_SECRET` を設定
- [ ] `npx prisma migrate dev --name init` で本番 DB にテーブル作成
- [ ] `npm run db:seed` でサンプルデータ投入
- [ ] GitHub へ push
- [ ] Vercel でインポート（Root Directory = `carshare`）
- [ ] Vercel に環境変数を設定
- [ ] デプロイ成功、公開 URL で動作確認
- [ ] テストアカウントの削除 / パスワード変更
