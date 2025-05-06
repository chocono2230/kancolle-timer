# 現状分析と Step Functions 設計

## 1. 現在のポーリング処理の詳細分析

### 現在の実装概要

現在のシステムは以下のような構成で動作しています：

1. **ポーリング間隔**:

   - EventBridge のルールが 1 分毎に Lambda 関数を実行（`cron(* * * * ? *)`）

2. **処理内容**:

   - すべてのタイマーを DynamoDB から取得
   - 終了時間が現在時刻を過ぎているタイマーを検出
   - タイマーが終了した場合:
     - 一時的タイマー(`isTemped=true`)の場合は削除
     - 永続的タイマーの場合は endTime を null に設定
   - 終了したタイマーについて Slack に通知を送信

3. **エラーハンドリング**:
   - 基本的な try-catch が存在しないため、エラー時のリトライや回復メカニズムは実装されていない
   - CloudWatch Logs にエラーが記録されると推測される

### タイマーのライフサイクルとステータス遷移

タイマーの状態遷移は以下のようになっています：

1. **作成時**:

   - 新しいタイマーが作成される（`createTimer`）
   - 開始するかどうかにより`endTime`が設定される
   - `order`はリスト内での位置

2. **稼働中**:

   - `endTime`が設定された状態（特定の時間まで稼働中）

3. **完了時**:

   - Lambda 関数がポーリングでタイマー終了を検出
   - 一時的タイマー: 削除される
   - 永続的タイマー: `endTime`が null に設定され、再利用可能な状態になる

4. **再スタート**:
   - ユーザーがフロントエンドから再度タイマーを開始（`updateTimer`）

## 2. Step Functions のワークフロー設計

### タイマー作成時のトリガー設計

```
タイマー作成フロー:
+-----------------+     +--------------------------+     +------------------------+
| DynamoDB Stream | --> | Lambda (イベントハンドラ) | --> | Step Functions 開始    |
+-----------------+     +--------------------------+     +------------------------+
```

**実装詳細**:

1. タイマーが作成または更新されると DynamoDB Streams がイベントを発行
2. Lambda 関数がそのイベントをハンドルし、`endTime`が設定されているタイマーに対して Step Functions 実行を開始
3. 実行 ID とタイマー ID をマッピングするためのテーブルを用意

### 待機状態と終了処理のフロー設計

```
Step Functions ワークフロー:
+------------+     +----------------+     +----------------+     +--------------------+
| 待機状態   | --> | タイマー状態確認 | --> | 通知処理      | --> | タイマー状態更新   |
+------------+     +----------------+     +----------------+     +--------------------+
```

**実装詳細**:

1. **待機状態**:

   - タイマーの endTime まで待機（`Wait`ステート）
   - 待機時間: `endTime` - 現在時刻

2. **タイマー状態確認**:

   - DynamoDB からタイマーの最新状態を取得
   - タイマーが削除/変更されていないかを確認
   - `endTime`が変更されている場合はステートマシンを終了

3. **通知処理**:

   - Slack に通知を送信（既存と同じ SQS 経由のロジック）

4. **タイマー状態更新**:
   - `isTemped=true`の場合：タイマーを削除
   - `isTemped=false`の場合：`endTime`を null に設定

### エラーハンドリング戦略

1. **リトライポリシー**:

   - DynamoDB へのアクセスエラー時は指数バックオフでリトライ
   - 最大リトライ回数: 5 回
   - リトライ間隔: 1 秒から開始

2. **エラー通知**:

   - 処理に失敗した場合は CloudWatch Alarms を通じて通知
   - ログに詳細なエラー情報を記録

3. **障害復旧**:
   - ステートマシン実行履歴の保持期間を長くし、問題調査を容易にする
   - 定期的なタイマー状態の整合性チェック（別プロセス）で、ステートマシンが失敗したタイマーを検出・修復

## 3. 既存データの移行計画

1. **初期データロード**:

   - 既存のアクティブタイマー（`endTime`が設定されている）に対して Step Functions 実行を開始
   - 実行 ID とタイマー ID のマッピングテーブルを作成

2. **デプロイ戦略**:

   - まずポーリングと Step Functions を並行稼働（2 重実行防止のロジック導入）
   - 動作を検証後、ポーリングベースのシステムを完全に廃止

3. **データ整合性確認**:
   - 移行後の整合性チェックスクリプトを実行
   - アクティブタイマーごとに Step Functions 実行状態を確認

## 4. 概算コスト分析

1. **現行システム（月額）**:

   - Lambda 実行: 1 分 ×60 分 ×24 時間 ×30 日 = 43,200 回/月
   - DynamoDB: 読み取り・書き込み操作
   - EventBridge: 1 ルール

2. **Step Functions（月額）**:

   - 平均タイマー数：50（仮定）
   - 平均タイマー実行時間：2 時間（仮定）
   - 状態遷移：タイマー 1 つあたり 4 遷移
   - 合計：約 50 タイマー ×15 回/月 ×4 遷移 = 3,000 遷移/月
   - Lambda 実行：タイマー作成・終了時のみ（大幅減少）
   - DynamoDB: 読み取り・書き込み操作（ほぼ同等）

3. **コスト削減ポイント**:
   - Lambda 実行回数の大幅削減
   - より効率的なリソース使用
   - より正確なタイマー処理（1 分の誤差がなくなる）

## 5. Step Functions のステートマシン定義

Step Functions のステートマシン定義は以下のような形になります（Amazon States Language で記述）：

```json
{
  "Comment": "タイマー管理ステートマシン",
  "StartAt": "WaitForEndTime",
  "States": {
    "WaitForEndTime": {
      "Type": "Wait",
      "TimestampPath": "$.endTime",
      "Next": "GetTimerStatus"
    },
    "GetTimerStatus": {
      "Type": "Task",
      "Resource": "arn:aws:states:::dynamodb:getItem",
      "Parameters": {
        "TableName": "${TimerTableName}",
        "Key": {
          "id": { "S.$": "$.id" }
        }
      },
      "ResultPath": "$.currentTimer",
      "Next": "CheckTimerValid"
    },
    "CheckTimerValid": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.currentTimer.Item",
          "IsPresent": false,
          "Next": "EndExecution"
        },
        {
          "Variable": "$.currentTimer.Item.endTime.S",
          "StringEquals": "$.endTime",
          "Next": "NotifyTimerEnd"
        }
      ],
      "Default": "EndExecution"
    },
    "NotifyTimerEnd": {
      "Type": "Task",
      "Resource": "arn:aws:states:::sqs:sendMessage",
      "Parameters": {
        "QueueUrl": "${SQSUrl}",
        "MessageBody": {
          "text.$": "States.Format('{} のタイマーが終了しました。', $.currentTimer.Item.name.S || $.currentTimer.Item.time.S)",
          "url": "${SlackUrl}"
        }
      },
      "Next": "UpdateTimerState"
    },
    "UpdateTimerState": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.currentTimer.Item.isTemped.BOOL",
          "BooleanEquals": true,
          "Next": "DeleteTimerViaAppSync"
        }
      ],
      "Default": "ResetTimerViaAppSync"
    },
    "DeleteTimerViaAppSync": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "${AppSyncUpdateLambda}",
        "Payload": {
          "timerId.$": "$.id",
          "isTemped": true,
          "operation": "TIMER_END"
        }
      },
      "ResultSelector": {
        "result.$": "$.Payload.result"
      },
      "End": true
    },
    "ResetTimerViaAppSync": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "${AppSyncUpdateLambda}",
        "Payload": {
          "timerId.$": "$.id",
          "isTemped": false,
          "operation": "TIMER_END"
        }
      },
      "ResultSelector": {
        "result.$": "$.Payload.result"
      },
      "End": true
    },
    "EndExecution": {
      "Type": "Pass",
      "End": true
    }
  }
}
```

このステートマシン定義では、DynamoDB からの読み取りは直接行いますが、更新処理は AppSync を介して行います。これにより、フロントエンドでリアルタイムにタイマーの状態変化を検知できるようになります。

主な特徴は以下の通りです：

1. **タイマーの待機処理**: `WaitForEndTime`ステートで、タイマーの終了時刻まで待機します。

2. **タイマー状態の確認**: `GetTimerStatus`と`CheckTimerValid`で、タイマーが削除されていないか、更新されていないかをチェックします。

3. **通知処理**: `NotifyTimerEnd`ステートで SQS にメッセージを送信し、Slack 通知を行います。

4. **AppSync 経由のタイマー更新**:

   - 一時的タイマー (`isTemped=true`): `DeleteTimerViaAppSync`ステートで専用の Lambda 関数を呼び出し、AppSync API を通じてタイマーを削除
   - 永続的タイマー (`isTemped=false`): `ResetTimerViaAppSync`ステートで Lambda 関数を呼び出し、AppSync API を通じてタイマーの`endTime`を null に設定

5. **実行終了処理**: タイマーが既に削除されていたり、更新されていた場合は`EndExecution`ステートで処理を終了します。

## 6. 全体アーキテクチャ図

新しいアーキテクチャは次のようになります：

```
[フロントエンド] ⟷ [AppSync API] → [DynamoDB] → [DynamoDB Streams]
      ↑                 ↑                               ↓
      |                 |                 [イベントハンドラLambda]
      |                 |                               ↓
      |                 ← --------- [Step Functions] ----
      |                                     ↓
[WebSocketによる      [Lambda (AppSync呼び出し)] → [SQS] → [Slack通知]
 リアルタイム通知]
```

このアーキテクチャでは、Step Functions が DynamoDB を直接更新するのではなく、Lambda 関数を介して AppSync API を呼び出します。これにより、以下のメリットがあります：

1. **リアルタイム性の向上**: フロントエンドは AppSync のサブスクリプションを通じてタイマーの状態変化をリアルタイムに検知できます
2. **一貫性の確保**: すべてのデータ更新が AppSync を経由するため、データの一貫性が確保されます
3. **監視の容易さ**: AppSync のログを通じて、すべての操作が追跡可能になります

Step Functions ワークフローにより、ポーリングベースの非効率なシステムからイベント駆動型の効率的なシステムに移行できます。タイマーの精度が上がり、コストも削減できる見込みです。また、処理の可視化も容易になり、運用管理の効率も向上します.

### 実装上の注意点

1. **認証**: AppSync API の認証方式に合わせて適切な認証情報を設定する必要があります（API Key, IAM, Cognito など）。

2. **環境変数の管理**: Lambda 関数を使用する場合は、API キーやエンドポイントなどの環境変数を適切に管理します。

3. **エラーハンドリング**: AppSync API の呼び出しが失敗した場合のリトライ処理やエラーハンドリングを実装する必要があります。

4. **セキュリティ**: API キーなどの認証情報を安全に管理する必要があります。

5. **並行実行の制御**: 複数のタイマーが同時に終了した場合の処理の整合性を確保するため、適切な並行実行制御を導入します.

## 8. 無限ループの対策

前述のアーキテクチャでは、以下のような無限ループが発生する可能性があります：

```
DynamoDB更新 → DB Streams検知 → Lambda実行 → StepFunctions開始 →
AppSync経由でDynamoDB更新 → DB Streams検知 → ... (無限ループ)
```

この問題を解決するための対策をいくつか検討します。

### 対策 1: 更新操作にフラグを追加

タイマーのデータモデルに「StepFunctions による更新かどうか」を示すメタデータフラグを追加し、StepFunctions からの更新時には特別なフラグを立てます。これにより、DynamoDB Streams のイベントハンドラでそのフラグを確認し、StepFunctions からの更新の場合は新たな StepFunctions を起動しないようにします。

#### データモデル拡張

```graphql
type Timer {
  id: ID!
  name: String
  time: String!
  endTime: AWSDateTime
  isTemped: Boolean
  order: Int
  updatedByStepFunctions: Boolean # この属性を追加
}
```

#### StepFunctions 経由の Lambda 実装例

```python
# app_sync_update.py

def update_timer(timer_id, end_time=None):
    """タイマーを更新する（StepFunctionsフラグ付き）"""
    client = create_client()
    query = gql(
        """
    mutation UpdateTimer($id: ID!, $endTime: AWSDateTime) {
        updateTimer(input: {
            id: $id,
            endTime: $endTime,
            updatedByStepFunctions: true  # フラグをセット
        }) {
            id
            endTime
            name
            isTemped
            order
            time
            updatedByStepFunctions
        }
    }
    """
    )
    result = client.execute(
        query, variable_values={"id": timer_id, "endTime": end_time}
    )
    return result
```

#### DynamoDB Streams ハンドラーの実装

```python
# dynamodb_stream_handler.py

def lambda_handler(event, context):
    """DynamoDB Streamsのイベントを処理する"""
    for record in event['Records']:
        # 更新または挿入イベントのみを処理
        if record['eventName'] not in ['MODIFY', 'INSERT']:
            continue

        # 新しいイメージを取得
        if 'NewImage' not in record['dynamodb']:
            continue

        new_image = record['dynamodb']['NewImage']

        # ステップファンクションによる更新かどうかをチェック
        if 'updatedByStepFunctions' in new_image and new_image['updatedByStepFunctions'].get('BOOL', False):
            print(f"StepFunctionsによる更新のため、タイマーID: {new_image.get('id', {}).get('S', 'unknown')} の処理をスキップします")
            continue

        # endTimeが設定されているかチェック
        if 'endTime' not in new_image or new_image['endTime'].get('NULL', False):
            # endTimeがnullまたは存在しないタイマーは処理しない
            continue

        # この時点で、通常の更新でendTimeが設定されているタイマーのみが処理対象
        timer_id = new_image['id']['S']
        end_time = new_image['endTime']['S']

        # Step Functionsを起動
        start_step_functions(timer_id, end_time)

def start_step_functions(timer_id, end_time):
    """Step Functionsを起動する"""
    client = boto3.client('stepfunctions')

    # Step Functionsの起動パラメータ
    execution_input = {
        "id": timer_id,
        "endTime": end_time
    }

    # Step Functions実行を開始
    response = client.start_execution(
        stateMachineArn=os.environ['STATE_MACHINE_ARN'],
        name=f'timer-{timer_id}-{int(time.time())}',  # 一意の実行名を生成
        input=json.dumps(execution_input)
    )

    print(f"Step Functions実行開始: {response['executionArn']}")
    return response
```

#### 実装上の注意点

1. **FrontEnd 側の実装に注意**: フロントエンドからのタイマー更新時には `updatedByStepFunctions` フラグを `false` に設定するか、フラグを設定しないようにする必要があります。

2. **フラグのリセット**: 通常の操作で `updatedByStepFunctions` フラグが誤って `true` に設定された場合、新しいタイマーイベントが処理されない可能性があるため、定期的にこのフラグをチェック・リセットするバッチ処理の導入も検討します。

3. **途中での割り込み処理**: ユーザーがタイマー実行中にタイマーを更新した場合、StepFunctions の実行は継続したまま新しい StepFunctions も起動される可能性があります。これを防ぐために、タイマー ID ごとに実行中の StepFunctions を管理する仕組みも必要かもしれません。

このアプローチの利点は実装が比較的簡単であり、既存のデータモデルに小さな変更を加えるだけで実装できることです。欠点としては、すべての更新操作でフラグの管理を適切に行う必要があることと、複雑なシナリオでは追加の管理が必要になる可能性があることです.
