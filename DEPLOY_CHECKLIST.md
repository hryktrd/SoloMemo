# 🚀 SoloMemo デプロイ準備完了チェックリスト

## ✅ 作成されたファイル

### 本番環境設定ファイル
- [x] `docker-compose.prod.yml` - 本番用Docker Compose設定
- [x] `docker/nginx/production.conf` - 本番用Nginxコンテナ設定
- [x] `docker/mysql/production.cnf` - MySQL パフォーマンス最適化設定
- [x] `.env.production.example` - 本番環境変数のテンプレート

### Nginx バーチャルホスト設定
- [x] `nginx-vhost.conf` - ホストNginx用バーチャルホスト設定（solo.pontium.org）

### デプロイメントスクリプト
- [x] `deploy.sh` - 初回デプロイ自動化スクリプト
- [x] `update.sh` - 更新デプロイスクリプト
- [x] `QUICKREF.sh` - クイックリファレンスコマンド集

### フロントエンド環境設定
- [x] `frontend/.env.development` - 開発環境変数
- [x] `frontend/.env.production` - 本番環境変数
- [x] `frontend/src/lib/axios.ts` - 環境別API URL設定（更新済み）

### バックエンド設定
- [x] `backend/config/cors.php` - CORS設定（環境変数対応に更新）

### ドキュメント
- [x] `DEPLOYMENT.md` - 詳細なデプロイメント手順書

---

## 📋 デプロイ前の最終確認

### 1. DNS設定
```bash
# solo.pontium.org が mypetpaw.net を指しているか確認
nslookup solo.pontium.org
```

### 2. Gitリポジトリにコミット

```bash
cd c:\Develop\SoloMemo

# すべての変更をステージング
git add .

# コミット
git commit -m "Add production deployment configuration for solo.pontium.org"

# プッシュ
git push origin main
```

### 3. サーバーへSSH接続確認
```bash
ssh ubuntu@mypetpaw.net
```

---

## 🎯 デプロイ実行手順（サーバー上で実行）

### オプション1: 自動デプロイスクリプト（推奨）

```bash
# サーバーにSSH接続
ssh ubuntu@mypetpaw.net

# ホームディレクトリへ
cd ~

# リポジトリをクローン
git clone <your-repository-url> SoloMemo

# デプロイスクリプトを実行
cd SoloMemo
chmod +x deploy.sh
./deploy.sh
```

デプロイスクリプトが以下を自動実行します：
- ✅ 必要なパッケージのインストール（Docker, Nginx, Certbot, Node.js）
- ✅ 環境設定ファイルの作成と強力なパスワード生成
- ✅ バックエンド・フロントエンドのビルド
- ✅ Dockerコンテナの起動
- ✅ データベースマイグレーション
- ✅ Nginxバーチャルホストの設定
- ✅ SSL証明書の自動取得（Let's Encrypt）
- ✅ 自動バックアップスクリプトの設定（毎日2時）

### オプション2: 手動デプロイ

詳細な手順は `DEPLOYMENT.md` を参照してください。

---

## 🔧 デプロイ後の確認

### 1. コンテナの状態確認
```bash
cd ~/SoloMemo
docker-compose -f docker-compose.prod.yml ps
```

すべてのコンテナが `Up` 状態であることを確認。

### 2. ログ確認
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

エラーがないことを確認。

### 3. ブラウザでアクセス
```
https://solo.pontium.org
```

### 4. 動作確認
- [ ] HTTPSでアクセスできる（SSL証明書が有効）
- [ ] ユーザー登録ができる
- [ ] ログインできる
- [ ] 投稿を作成できる
- [ ] OGPプレビューが表示される
- [ ] 投稿の削除ができる
- [ ] プロフィール編集ができる
- [ ] パスワード変更ができる

---

## 🔄 コード更新時の手順

ローカルで変更を加えた後：

```bash
# ローカル
cd c:\Develop\SoloMemo
git add .
git commit -m "Update description"
git push origin main

# サーバー
ssh ubuntu@mypetpaw.net
cd ~/SoloMemo
./update.sh
```

---

## 📊 主要な設定内容

### アーキテクチャ
```
Internet
  ↓ HTTPS (443)
ホストNginx (solo.pontium.org)
  ↓ Proxy Pass
  ├─ /api → localhost:8085 (Docker Nginx → PHP-FPM)
  └─ / → /home/ubuntu/SoloMemo/frontend/dist (静的ファイル)
```

### ポート設定
- `80`: HTTP → HTTPS リダイレクト
- `443`: HTTPS（ホストNginx）
- `8085`: Dockerコンテナ内Nginx（バックエンドAPI）
- `3308`: MySQL（ホストからのアクセス用、外部非公開）

### データベース
- **データベース名**: `solomemo_prod`
- **ユーザー名**: `solomemo_prod`
- **パスワード**: デプロイ時に自動生成
- **設定**: InnoDB buffer pool 1GB、スロークエリログ有効

### セキュリティ
- ✅ HTTPS強制（Let's Encrypt SSL証明書）
- ✅ セキュリティヘッダー設定
- ✅ CORS制限（solo.pontium.orgのみ）
- ✅ セッションクッキー（Secure、HttpOnly）
- ✅ データベースパスワードの自動生成

### バックアップ
- **頻度**: 毎日午前2時（自動）
- **保存先**: `/home/ubuntu/backups/solomemo/`
- **保持期間**: 30日
- **手動実行**: `/usr/local/bin/solomemo-backup.sh`

---

## 📚 参考ドキュメント

- **詳細なデプロイ手順**: `DEPLOYMENT.md`
- **クイックリファレンス**: `QUICKREF.sh`
- **プロジェクト概要**: `README.md`

---

## 🆘 トラブルシューティング

### SSL証明書が取得できない
```bash
# DNSを確認
dig solo.pontium.org

# 手動で証明書を取得
sudo certbot --nginx -d solo.pontium.org
```

### 502 Bad Gateway
```bash
# バックエンドコンテナを確認
docker-compose -f docker-compose.prod.yml ps app
docker-compose -f docker-compose.prod.yml logs app

# 再起動
docker-compose -f docker-compose.prod.yml restart app
```

### データベース接続エラー
```bash
# データベースコンテナを確認
docker-compose -f docker-compose.prod.yml logs db

# 環境変数を確認
cat ~/SoloMemo/backend/.env | grep DB_
```

---

## ✨ デプロイの成功を祈ります！

質問や問題がある場合は、`DEPLOYMENT.md` の詳細なトラブルシューティングセクションを参照してください。

**Happy deploying! 🎉**
