# 艦これ遠征管理用タイマー

## 概要

「艦これ遠征管理用タイマー」は艦隊これくしょん（艦これ）の遠征任務の管理をサポートするためのウェブアプリケーションです。遠征の完了時間を設定し、時間になると通知を受け取ることができます。

## 機能

- 遠征完了時に通知するタイマー機能
  - Slack経由での通知に対応
  - タイマーの作成、編集、取り消しが可能
- よく使う遠征時間の保存機能
  - 頻繁に使う遠征時間はワンクリックでタイマー開始が可能
- 複数の遠征を同時に管理可能

## 技術スタック

### フロントエンド

- **フレームワーク**: React + TypeScript
- **UI ライブラリ**: Material-UI (MUI)
- **フォーム管理**: React-Hook-Form
- **状態管理**: React Hooks

### バックエンド

- **API**: AWS AppSync (GraphQL)
- **データベース**: Amazon DynamoDB
- **サーバーレス関数**: AWS Lambda
- **通知処理**: EventBridge + Lambda
- **インフラストラクチャ**: Terraform による IaC (Infrastructure as Code)

## プロジェクト構成

- `kancolle-timer-frontend/`: Reactベースのフロントエンドアプリケーション
- `kancolle-timer-backend/`: AWS Lambda用のPythonスクリプトとその他のバックエンド関連コード
- `script/`: 開発およびデプロイに関連する補助スクリプト

## 開発環境のセットアップ

### 前提条件

- Node.js (バージョン14以上)
- Yarn または npm
- Python 3.8以上
- AWS CLI (設定済み)
- Terraform (バックエンドのインフラをデプロイする場合)

### フロントエンド開発環境のセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd kancolle-timer

# フロントエンドの依存関係をインストール
cd kancolle-timer-frontend
yarn install

# 開発サーバーの起動
yarn start
```

### バックエンド開発環境のセットアップ

```bash
# バックエンドの依存関係をインストール
cd kancolle-timer-backend/src
pip install -r requirements.txt

# AWSリソースのデプロイ（Terraformを使用）
cd ../Terraform
terraform init
terraform apply
```

## 使用方法

1. ウェブアプリケーションにアクセス
2. 「新規タイマー」ボタンをクリック
3. 遠征完了予定時間を設定
4. 必要に応じて遠征名やメモを入力
5. 「タイマー開始」をクリック

よく使う遠征時間は保存しておくことで、次回からワンクリックでタイマーを開始できます。
