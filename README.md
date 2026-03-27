# quickQuestion

匿名性を重視した、NDTJ 向けのご意見箱アプリです。

- 投稿画面: `/`
- 完了画面: `/thanks`
- 認証: なし（アクセス制限は Azure 側で実施）

## 技術スタック

- Frontend: React + Vite + TypeScript
- Backend: Hono + TypeScript + Pino
- DB: PostgreSQL
- ORM: Drizzle ORM
- Runtime: Docker Compose（`backend` + `postgres`）

## 動作仕様（重要）

- アプリケーションは送信元 IP アドレスを参照したアクセス制御を行いません。
- 会社IP以外を拒否する要件は、Azure 側（WAF / NSG / App Service Access Restrictions など）で実施してください。
- 投稿 API は 1 リクエストあたり 10KB まで受け付けます（本文は別途 5000 文字上限）。

## セットアップ

### 1. 環境変数

`.env.example` をコピーして `.env` を作成してください。

```bash
cp .env.example .env
```

### 2. Docker で起動

```bash
docker compose up -d --build
```

アクセス先:

- フォーム: <http://localhost:8080/>
- 完了: <http://localhost:8080/thanks>
- Health: <http://localhost:8080/health>

停止:

```bash
docker compose down
```

データボリュームも削除:

```bash
docker compose down -v
```

### 3. ローカル開発（Docker なし）

```bash
bun run dev
# または
pnpm run dev
# または
npm run dev
```

## 環境変数

- `POSTGRES_DB`: PostgreSQL DB 名（Compose 用）
- `POSTGRES_USER`: PostgreSQL ユーザー名（Compose 用）
- `POSTGRES_PASSWORD`: PostgreSQL パスワード（Compose 用）
- `DATABASE_URL`: PostgreSQL 接続文字列
- `PORT`: バックエンド待受ポート（既定: `8787`）
- `LOG_LEVEL`: Pino ログレベル（既定: `info`）

## API

- `POST /api/feedbacks`

## データモデル

`feedbacks` テーブル:

- `id` (serial, PK)
- `target_text` (TEXT, nullable)
- `message_text` (TEXT, not null)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## 匿名性・個人情報レビュー

最終レビュー日: 2026-03-27

### アプリが保存しないもの（アプリ実装上）

- IP アドレス（DB 非保存）
- User-Agent（DB 非保存）
- Cookie / セッション情報（未実装）

### アプリが保存するもの

- 投稿本文 `message_text`
- 任意入力の宛先 `target_text`
- 作成/更新時刻

### レビュー結果

- DB スキーマ上、送信者識別子（IP/User-Agent）カラムは存在しません。
- アプリはリクエスト単位のアクセスログ（`method`, `path`, `status`, `durationMs` 等）を出力しません。
- バリデーションエラー時に本文をログへ出していた箇所を修正し、入力本文をログ保存しないようにしました。
- アプリはIPアドレスをアクセス判定にも利用しません。
- DB エラーログは全文出力を避け、最小限のエラーメッセージのみ記録します。

### 重要な注意点（運用上の残リスク）

- 投稿本文は自由入力のため、投稿者が自発的に個人情報を書いた場合、その内容は DB に保存されます。
- クラウド/リバースプロキシ/LB のアクセスログ設定によっては、インフラ層で IP が記録される可能性があります（本アプリ外）。

## 開発コマンド

```bash
# ルート
npm run dev
npm run build
npm run start

# サブプロジェクト
cd backend && npm run dev
cd backend && npm run build
cd frontend && npm run dev
cd frontend && npm run build
```
