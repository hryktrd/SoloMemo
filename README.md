# SoloMemo

完全プライベートなつぶやき・日記アプリ（PWA対応）

## 📋 目次

- [要件定義](#要件定義)
- [技術スタック](#技術スタック)
- [データベース設計](#データベース設計)
- [セットアップ](#セットアップ)
- [本番環境へのデプロイ](#本番環境へのデプロイ)
- [機能一覧](#機能一覧)

---

## 要件定義

### 概要
完全に自分専用（公開設定なし）のつぶやき・日記アプリ。日々の愚痴や思考、気になった記事URLをOGP付きで記録できる。

### 基本機能

#### 1. アカウント管理
- ユーザー登録（メール認証）
- ログイン・ログアウト
- パスワード認証（Laravel Sanctum）
- 完全プライベート設定（本人のみ閲覧可能）
- プロフィール編集（名前、メールアドレス）
- パスワード変更
- アカウント削除（確認メッセージ付き）

#### 2. つぶやき投稿
- テキスト入力による投稿（最大280文字）
- URLを貼るとOGP情報（タイトル・画像・概要）を自動取得・表示
- 投稿の編集・削除（確認メッセージ付き）

#### 3. 投稿一覧
- 投稿の時系列リスト表示（最新順、ページネーション対応）
- OGPプレビュー付きURLのサムネイル表示
- 投稿日時の相対表示（「3分前」など）

#### 4. ユーザーインターフェース
- シンプルで軽快なデザイン（モバイル優先、レスポンシブ対応）
- ダークモード対応
- PWA対応（オフライン動作、ホーム画面追加）
- 多言語対応（日本語・英語）

#### 5. セキュリティ
- HTTPS対応（全通信の暗号化）
- データベースのアクセス制限
- CORS設定
- トークンベース認証（Laravel Sanctum）

---

## 技術スタック

### バックエンド
- **フレームワーク**: Laravel 11.x
- **言語**: PHP 8.2+
- **認証**: Laravel Sanctum
- **OGP取得**: shweshi/opengraph
- **データベース**: MySQL 8.0

### フロントエンド
- **フレームワーク**: React 19.x
- **言語**: TypeScript 5.x
- **ビルドツール**: Vite 7.x
- **スタイリング**: Tailwind CSS 3.x
- **ルーティング**: React Router DOM
- **国際化**: i18next, react-i18next
- **PWA**: vite-plugin-pwa, Workbox
- **HTTP通信**: Axios
- **日付処理**: date-fns

### インフラ
- **コンテナ**: Docker, Docker Compose
- **Webサーバー**: Nginx (Alpine)
- **アプリケーションサーバー**: PHP-FPM
- **データベース**: MySQL 8.0
- **開発サーバー**: Vite (Node.js 20)

---

## データベース設計

### ER図

```
┌─────────────┐       ┌─────────────┐
│    users    │       │    posts    │
├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │
│ name        │   └──<│ user_id     │
│ email       │       │ content     │
│ password    │       │ created_at  │
│ created_at  │       │ updated_at  │
│ updated_at  │       └─────────────┘
└─────────────┘
                      ┌──────────────┐
                      │ ogp_caches   │
                      ├──────────────┤
                      │ id           │
                      │ url          │
                      │ title        │
                      │ description  │
                      │ image        │
                      │ site_name    │
                      │ created_at   │
                      │ updated_at   │
                      └──────────────┘
```

### テーブル定義

#### users テーブル
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | ユーザーID |
| name | VARCHAR(255) | NOT NULL | ユーザー名 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | メールアドレス |
| password | VARCHAR(255) | NOT NULL | パスワード（ハッシュ化） |
| email_verified_at | TIMESTAMP | NULL | メール確認日時 |
| remember_token | VARCHAR(100) | NULL | Rememberトークン |
| created_at | TIMESTAMP | NULL | 作成日時 |
| updated_at | TIMESTAMP | NULL | 更新日時 |

**インデックス**:
- PRIMARY KEY (`id`)
- UNIQUE KEY (`email`)

---

#### posts テーブル
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 投稿ID |
| user_id | BIGINT UNSIGNED | NOT NULL, FOREIGN KEY | ユーザーID |
| content | TEXT | NOT NULL | 投稿内容（最大280文字） |
| created_at | TIMESTAMP | NULL | 作成日時 |
| updated_at | TIMESTAMP | NULL | 更新日時 |

**インデックス**:
- PRIMARY KEY (`id`)
- FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
- INDEX (`user_id`, `created_at`)

---

#### ogp_caches テーブル
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | OGPキャッシュID |
| url | VARCHAR(255) | NOT NULL, UNIQUE | URL |
| title | VARCHAR(255) | NULL | ページタイトル |
| description | TEXT | NULL | ページ説明 |
| image | VARCHAR(255) | NULL | OGP画像URL |
| site_name | VARCHAR(255) | NULL | サイト名 |
| created_at | TIMESTAMP | NULL | 作成日時 |
| updated_at | TIMESTAMP | NULL | 更新日時 |

**インデックス**:
- PRIMARY KEY (`id`)
- UNIQUE KEY (`url`)

---

#### personal_access_tokens テーブル (Laravel Sanctum)
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | トークンID |
| tokenable_type | VARCHAR(255) | NOT NULL | トークン所有者の型 |
| tokenable_id | BIGINT UNSIGNED | NOT NULL | トークン所有者のID |
| name | VARCHAR(255) | NOT NULL | トークン名 |
| token | VARCHAR(64) | NOT NULL, UNIQUE | トークン値 |
| abilities | TEXT | NULL | アビリティ |
| last_used_at | TIMESTAMP | NULL | 最終使用日時 |
| expires_at | TIMESTAMP | NULL | 有効期限 |
| created_at | TIMESTAMP | NULL | 作成日時 |
| updated_at | TIMESTAMP | NULL | 更新日時 |

**インデックス**:
- PRIMARY KEY (`id`)
- UNIQUE KEY (`token`)
- INDEX (`tokenable_type`, `tokenable_id`)

---

## セットアップ

### 前提条件
- Docker Desktop
- Git

### ローカル環境構築

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd SoloMemo
```

2. **環境変数の設定**
```bash
# バックエンドの.envファイルは既に作成済み
# 必要に応じて編集してください
```

3. **Dockerコンテナの起動**
```bash
docker compose up -d --build
```

4. **データベースマイグレーション**
```bash
docker compose exec app php artisan migrate
```

5. **アプリケーションキーの生成**
```bash
docker compose exec app php artisan key:generate
```

6. **アクセス**
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8085

---

## 本番環境へのデプロイ

### アーキテクチャ

```
インターネット
    ↓
ホストサーバー (Nginx)
    ↓ (バーチャルホスト: solomemo.example.com)
    ↓ (Proxy Pass: http://localhost:8085)
    ↓
Dockerコンテナ (solomemo-nginx)
    ↓
PHP-FPM (Laravel API)
```

### 1. 本番用環境変数の設定

**backend/.env.production**
```bash
APP_NAME=SoloMemo
APP_ENV=production
APP_KEY=                              # php artisan key:generate で生成
APP_DEBUG=false
APP_URL=https://solomemo.example.com

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=solomemo_prod
DB_USERNAME=solomemo_prod
DB_PASSWORD=<strong-password>         # 強力なパスワードに変更

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_STORE=database
```

### 2. docker-compose.prod.yml の作成

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "8085:80"
    volumes:
      - ./backend:/var/www/html
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - solomemo
    restart: unless-stopped

  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    volumes:
      - ./backend:/var/www/html
    environment:
      - DB_CONNECTION=mysql
      - DB_HOST=db
      - DB_PORT=3306
      - DB_DATABASE=solomemo_prod
      - DB_USERNAME=solomemo_prod
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - db
    networks:
      - solomemo
    restart: unless-stopped

  db:
    image: mysql:8.0
    ports:
      - "3308:3306"
    environment:
      MYSQL_DATABASE: solomemo_prod
      MYSQL_USER: solomemo_prod
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - solomemo
    restart: unless-stopped

networks:
  solomemo:
    driver: bridge

volumes:
  db-data:
```

### 3. ホストのNginx設定

**/etc/nginx/sites-available/solomemo.conf**
```nginx
# HTTPからHTTPSへリダイレクト
server {
    listen 80;
    server_name solomemo.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS設定
server {
    listen 443 ssl http2;
    server_name solomemo.example.com;

    # SSL証明書の設定 (Let's Encrypt推奨)
    ssl_certificate /etc/letsencrypt/live/solomemo.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/solomemo.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # フロントエンド（静的ファイル）
    root /var/www/solomemo/frontend/dist;
    index index.html;

    # クライアントアップロードサイズ制限
    client_max_body_size 10M;

    # フロントエンドのルーティング
    location / {
        try_files $uri $uri/ /index.html;
    }

    # APIリクエストをDockerコンテナへプロキシ
    location /api {
        proxy_pass http://localhost:8085;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # セキュリティヘッダー
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 4. デプロイ手順

#### 4.1 サーバーへのデプロイ

```bash
# 本番サーバーにSSH接続
ssh user@your-server.com

# 作業ディレクトリへ移動
cd /var/www/solomemo

# GitリポジトリをPull
git pull origin main

# フロントエンドのビルド
cd frontend
npm install
npm run build

# バックエンドの依存関係インストール
cd ../backend
composer install --no-dev --optimize-autoloader

# 環境設定ファイルをコピー
cp .env.production .env

# アプリケーションキーの生成
php artisan key:generate

# 設定キャッシュのクリア
php artisan config:clear
php artisan cache:clear

# 本番用の最適化
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Dockerコンテナの起動
cd ..
docker compose -f docker-compose.prod.yml up -d --build

# データベースマイグレーション
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

#### 4.2 Nginxの有効化

```bash
# シンボリックリンクの作成
sudo ln -s /etc/nginx/sites-available/solomemo.conf /etc/nginx/sites-enabled/

# Nginx設定テスト
sudo nginx -t

# Nginxリロード
sudo systemctl reload nginx
```

#### 4.3 SSL証明書の取得（Let's Encrypt）

```bash
# Certbotのインストール
sudo apt install certbot python3-certbot-nginx

# SSL証明書の取得
sudo certbot --nginx -d solomemo.example.com

# 自動更新設定の確認
sudo certbot renew --dry-run
```

### 5. 環境変数の設定

**.env** ファイルに以下を設定:
```bash
DB_PASSWORD=<strong-password>
DB_ROOT_PASSWORD=<strong-root-password>
```

### 6. フロントエンドのAPI URL設定

**frontend/src/lib/axios.ts** を本番用に更新:
```typescript
const api = axios.create({
    baseURL: '/api',  // 相対パスに変更（Nginxプロキシ経由）
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});
```

### 7. バックアップ

```bash
# データベースバックアップスクリプト
#!/bin/bash
BACKUP_DIR="/var/backups/solomemo"
DATE=$(date +%Y%m%d_%H%M%S)

docker compose -f docker-compose.prod.yml exec -T db mysqldump \
  -u root -p${DB_ROOT_PASSWORD} solomemo_prod \
  > ${BACKUP_DIR}/solomemo_${DATE}.sql

# 古いバックアップを削除（30日以上）
find ${BACKUP_DIR} -name "*.sql" -mtime +30 -delete
```

### 8. 監視とログ

```bash
# アプリケーションログ
docker compose -f docker-compose.prod.yml logs -f app

# Nginxログ
docker compose -f docker-compose.prod.yml logs -f nginx

# データベースログ
docker compose -f docker-compose.prod.yml logs -f db
```

---

## 機能一覧

### 実装済み機能

- ✅ ユーザー登録・ログイン・ログアウト
- ✅ 投稿の作成・表示・削除
- ✅ OGP自動取得・プレビュー表示
- ✅ プロフィール編集（名前、メールアドレス）
- ✅ パスワード変更
- ✅ アカウント削除
- ✅ 確認ダイアログ（投稿削除、アカウント削除）
- ✅ マイページ
- ✅ レスポンシブデザイン
- ✅ ダークモード対応
- ✅ 多言語対応（日本語・英語）
- ✅ PWA対応（オフライン動作、ホーム画面追加）
- ✅ インストールプロンプト表示

### 将来的な追加機能候補

- 🔲 検索機能（テキスト検索、日付範囲指定）
- 🔲 タグ付け機能
- 🔲 AIによる感情分析・要約
- 🔲 投稿のエクスポート機能（JSON、CSV、PDF）
- 🔲 テーマカラー変更
- 🔲 プッシュ通知
- 🔲 画像アップロード機能

---

## ライセンス

MIT License

## 作成者

SoloMemo Development Team

---

## トラブルシューティング

### Dockerコンテナが起動しない場合

```bash
# ログを確認
docker compose logs

# 既存のコンテナを削除して再作成
docker compose down -v
docker compose up -d --build
```

### データベース接続エラー

```bash
# データベースコンテナの状態確認
docker compose ps db

# 環境変数の確認
docker compose exec app env | grep DB_
```

### フロントエンドがビルドできない場合

```bash
# node_modulesを削除して再インストール
rm -rf frontend/node_modules
cd frontend
npm install
npm run build
```
