# Step Functions デプロイ手順

## 前提条件

- AWS アカウントへのアクセス権限
- AWS CLI と Terraform のインストール
- プロジェクトリポジトリのクローン

## デプロイの流れ

Step Functions を使用したタイマー管理システムのデプロイは以下の手順で行います。

### 1. DynamoDB ストリームの有効化

最初に、Timer テーブルの DynamoDB ストリームを有効化する必要があります。

```bash
# DynamoDB ストリームを有効化（開発環境の例）
aws dynamodb update-table \
  --table-name Timer-dev \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_IMAGE \
  --region ap-northeast-1
```

### 2. DynamoDB ストリームの ARN を取得

```bash
# テーブルの詳細情報を取得し、その中からストリーム ARN を確認
aws dynamodb describe-table --table-name Timer-dev --region ap-northeast-1 | grep StreamArn
```

### 3. Terraform 変数ファイルの更新

取得した DynamoDB ストリーム ARN を Terraform の変数ファイルに設定します。

- 開発環境: `kancolle-timer-backend/Terraform/envs/dev/default.tfvars`
- テスト環境: `kancolle-timer-backend/Terraform/envs/tst/default.tfvars`

```terraform
# 例（実際の ARN 値に置き換え）
dynamodb_stream_arn = "arn:aws:dynamodb:ap-northeast-1:123456789012:table/Timer-dev/stream/2025-05-07T00:00:00.000"
```

### 4. Terraform の初期化とデプロイ

```bash
# 開発環境へのデプロイ例
cd kancolle-timer-backend/Terraform
terraform init -backend-config=envs/dev/backend.conf
terraform plan -var-file=envs/dev/default.tfvars
terraform apply -var-file=envs/dev/default.tfvars
```

### 5. 動作確認

- CloudWatch Logs で各 Lambda 関数のログを確認
- Step Functions コンソールでステートマシンの実行状況を確認
- タイマーが正常に終了し、Slack 通知が送信されることを確認

## 問題発生時の対処

### Step Functions の実行が失敗した場合

1. CloudWatch Logs でエラー詳細を確認
2. 必要に応じて IAM 権限を調整
3. 該当するタイマーの状態を確認・修正

### DynamoDB ストリームの処理に問題がある場合

1. `dynamodb_stream_handler` Lambda 関数のログを確認
2. イベントソースマッピングの状態を確認・修正

## 監視設定

- タイマー処理のための CloudWatch アラームを設定
- Step Functions の実行エラーをモニタリング
- Lambda 関数のエラー率と遅延をモニタリング

## 注意点

- 開発環境でのテストが十分に行われてからテスト環境、本番環境へとデプロイを進めてください
- デプロイ作業は計画的に行い、ユーザーへの影響を最小限にしてください
- バックアップ・ロールバック手順を整えておくことをお勧めします
