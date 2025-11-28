# SoloMemo デプロイメントガイド
## solo.pontium.org への本番環境デプロイ手順

---

## 📋 事前準備

### 必要な情報
- **ドメイン**: solo.pontium.org
- **サーバー**: ubuntu@mypetpaw.net
- **デプロイ先**: /home/ubuntu/SoloMemo
- **SSL**: Let's Encrypt（自動取得）

### DNS設定の確認
デプロイ前に、solo.pontium.org が mypetpaw.net サーバーを指していることを確認してください。

```bash
dig solo.pontium.org
# または
nslookup solo.pontium.org
```

---

## 🚀 デプロイ手順

### Step 1: ローカルでの準備

#### 1.1 コードをリポジトリにプッシュ

ローカル環境で最新のコードをGitリポジトリにプッシュします：

```bash
cd c:\Develop\SoloMemo
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: サーバーへSSH接続

```bash
ssh ubuntu@mypetpaw.net
```

### Step 3: デプロイスクリプトの実行

#### 3.1 初回デプロイ（推奨：手動実行）

サーバー上で以下のコマンドを実行します：

```bash
# ホームディレクトリへ移動
cd ~

# リポジトリをクローン
git clone <your-repository-url> SoloMemo
cd SoloMemo

# デプロイスクリプトを実行可能にする
chmod +x deploy.sh

# デプロイスクリプトを実行
./deploy.sh
```

スクリプトが以下の処理を自動的に行います：

1. ✅ システムパッケージの更新
2. ✅ Docker、Nginx、Certbot のインストール
3. ✅ 本番用環境変数の設定（.env）
4. ✅ バックエンド依存関係のインストール
5. ✅ Laravel アプリケーションキーの生成
6. ✅ フロントエンドのビルド
7. ✅ Docker コンテナの起動
8. ✅ データベースマイグレーション
9. ✅ Laravel の最適化（キャッシュ生成）
10. ✅ Nginx バーチャルホストの設定
11. ✅ SSL証明書の取得（Let's Encrypt）
12. ✅ バックアップスクリプトの作成（毎日2時に実行）

#### 3.2 デプロイスクリプトの対話的な入力

スクリプト実行中、以下の入力を求められます：

1. **Gitリポジトリ URL**（初回のみ）
2. **Let's Encrypt用メールアドレス**

### Step 4: デプロイ確認

#### 4.1 コンテナの状態確認

```bash
cd ~/SoloMemo
docker-compose -f docker-compose.prod.yml ps
```

以下のように3つのコンテナが `Up` 状態になっていることを確認：
- solomemo-nginx-1
- solomemo-app-1
- solomemo-db-1

#### 4.2 ログの確認

```bash
# すべてのログを表示
docker-compose -f docker-compose.prod.yml logs -f

# 特定のサービスのみ
docker-compose -f docker-compose.prod.yml logs -f app
```

#### 4.3 Nginx の状態確認

```bash
sudo systemctl status nginx
sudo nginx -t  # 設定ファイルのテスト
```

#### 4.4 SSL証明書の確認

```bash
sudo certbot certificates
```

#### 4.5 ブラウザでアクセス

https://solo.pontium.org にアクセスして動作確認

---

## 🔄 更新手順（2回目以降）

コードを更新した後、サーバーで以下のコマンドを実行：

```bash
cd ~/SoloMemo
chmod +x update.sh
./update.sh
```

更新スクリプトが以下を実行します：
1. 最新コードをプル
2. フロントエンドを再ビルド
3. バックエンド依存関係を更新
4. コンテナを再起動
5. マイグレーションを実行
6. キャッシュをクリア・再生成

---

## 🛠 メンテナンスコマンド

### コンテナ操作

```bash
cd ~/SoloMemo

# コンテナの起動
docker-compose -f docker-compose.prod.yml up -d

# コンテナの停止
docker-compose -f docker-compose.prod.yml down

# コンテナの再起動
docker-compose -f docker-compose.prod.yml restart

# 特定のサービスだけ再起動
docker-compose -f docker-compose.prod.yml restart app
```

### Laravel Artisan コマンド

```bash
cd ~/SoloMemo

# キャッシュクリア
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear
docker-compose -f docker-compose.prod.yml exec app php artisan route:clear
docker-compose -f docker-compose.prod.yml exec app php artisan view:clear

# マイグレーション
docker-compose -f docker-compose.prod.yml exec app php artisan migrate

# キャッシュ生成（パフォーマンス向上）
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
docker-compose -f docker-compose.prod.yml exec app php artisan view:cache
```

### データベース操作

```bash
cd ~/SoloMemo

# データベースに接続
docker-compose -f docker-compose.prod.yml exec db mysql -u solomemo_prod -p solomemo_prod

# データベースバックアップ（手動）
/usr/local/bin/solomemo-backup.sh

# バックアップファイルの確認
ls -lh ~/backups/solomemo/
```

### ログ確認

```bash
# アプリケーションログ
docker-compose -f docker-compose.prod.yml logs -f app

# Nginxログ
docker-compose -f docker-compose.prod.yml logs -f nginx
sudo tail -f /var/log/nginx/solo.pontium.org-access.log
sudo tail -f /var/log/nginx/solo.pontium.org-error.log

# データベースログ
docker-compose -f docker-compose.prod.yml logs -f db
```

---

## 🔧 トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker-compose -f docker-compose.prod.yml logs

# コンテナを削除して再作成
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d --build
```

### データベース接続エラー

```bash
# データベースコンテナの状態確認
docker-compose -f docker-compose.prod.yml ps db

# 環境変数の確認
docker-compose -f docker-compose.prod.yml exec app env | grep DB_

# データベースの再起動
docker-compose -f docker-compose.prod.yml restart db
```

### SSL証明書エラー

```bash
# 証明書の再取得
sudo certbot --nginx -d solo.pontium.org

# 証明書の自動更新テスト
sudo certbot renew --dry-run
```

### フロントエンドが表示されない

```bash
# ビルドファイルの確認
ls -la ~/SoloMemo/frontend/dist/

# 再ビルド
cd ~/SoloMemo/frontend
npm run build

# Nginx再起動
sudo systemctl restart nginx
```

### 502 Bad Gateway エラー

```bash
# バックエンドコンテナの確認
docker-compose -f docker-compose.prod.yml ps app
docker-compose -f docker-compose.prod.yml logs app

# アプリケーションコンテナの再起動
docker-compose -f docker-compose.prod.yml restart app

# Nginxプロキシ設定の確認
sudo nginx -t
```

---

## 📊 パフォーマンス監視

### リソース使用状況

```bash
# コンテナのリソース使用状況
docker stats

# ディスク使用量
df -h
du -sh ~/SoloMemo
```

### データベースパフォーマンス

```bash
# スロークエリログの確認
docker-compose -f docker-compose.prod.yml exec db tail -f /var/lib/mysql/slow-query.log

# データベース接続数
docker-compose -f docker-compose.prod.yml exec db mysql -u root -p -e "SHOW PROCESSLIST;"
```

---

## 🔐 セキュリティ

### ファイアウォール設定（推奨）

```bash
# UFWが有効な場合
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 定期的なセキュリティ更新

```bash
# システムアップデート
sudo apt update
sudo apt upgrade -y

# Dockerイメージの更新
cd ~/SoloMemo
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 💾 バックアップ

### 自動バックアップ

バックアップは毎日午前2時に自動実行されます（cron）。

```bash
# Cron設定の確認
crontab -l
```

### 手動バックアップ

```bash
/usr/local/bin/solomemo-backup.sh
```

### バックアップからの復元

```bash
cd ~/SoloMemo

# バックアップファイルのリスト表示
ls -lh ~/backups/solomemo/

# 復元（例）
gunzip ~/backups/solomemo/db_20251128_020000.sql.gz
docker-compose -f docker-compose.prod.yml exec -T db mysql -u solomemo_prod -p solomemo_prod < ~/backups/solomemo/db_20251128_020000.sql
```

---

## 📝 重要な設定ファイル

| ファイル | 場所 | 説明 |
|---------|------|------|
| Nginx バーチャルホスト | `/etc/nginx/sites-available/solo.pontium.org` | Nginxサイト設定 |
| 環境変数 | `~/SoloMemo/backend/.env` | Laravel環境設定 |
| Docker Compose | `~/SoloMemo/docker-compose.prod.yml` | コンテナ設定 |
| MySQL設定 | `~/SoloMemo/docker/mysql/production.cnf` | データベース最適化設定 |
| バックアップスクリプト | `/usr/local/bin/solomemo-backup.sh` | 自動バックアップ |
| SSL証明書 | `/etc/letsencrypt/live/solo.pontium.org/` | Let's Encrypt証明書 |

---

## 🎯 チェックリスト

### デプロイ前
- [ ] DNS設定が正しいか確認
- [ ] Gitリポジトリに最新コードをプッシュ
- [ ] 環境変数を確認（.env.production.example）

### デプロイ後
- [ ] すべてのコンテナが起動しているか確認
- [ ] HTTPSでアクセスできるか確認
- [ ] ユーザー登録・ログインが動作するか確認
- [ ] 投稿の作成・表示・削除が動作するか確認
- [ ] OGP取得が動作するか確認

### 定期メンテナンス
- [ ] バックアップが正常に実行されているか確認（月1回）
- [ ] ディスク容量を確認（月1回）
- [ ] ログファイルのサイズを確認（月1回）
- [ ] システムアップデートを実行（月1回）

---

## 📞 サポート

問題が発生した場合は、以下の情報を収集してください：

```bash
# システム情報
uname -a
docker --version
docker-compose --version

# コンテナ状態
docker-compose -f docker-compose.prod.yml ps

# 最近のログ
docker-compose -f docker-compose.prod.yml logs --tail=100

# Nginxエラーログ
sudo tail -100 /var/log/nginx/solo.pontium.org-error.log
```

---

**デプロイメントの成功をお祈りします！ 🚀**
