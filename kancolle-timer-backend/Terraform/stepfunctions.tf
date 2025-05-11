// Step Functionsのステートマシン定義とIAMロール設定

// Step Functionsのためのサービスロール
resource "aws_iam_role" "step_functions" {
  name = "${local.identifier}-step-functions-role"

  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "states.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
}

// Step FunctionsがDynamoDBにアクセスするためのポリシー
resource "aws_iam_policy" "step_functions_dynamodb" {
  name = "${local.identifier}-step-functions-dynamodb-policy"

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:GetItem"
        ],
        "Resource": [
          "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/Timer-${var.env}*"
        ]
      }
    ]
  }
  EOF
}

// Step FunctionsがSQSにメッセージを送信するためのポリシー
resource "aws_iam_policy" "step_functions_sqs" {
  name = "${local.identifier}-step-functions-sqs-policy"

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "sqs:SendMessage"
        ],
        "Resource": [
          "${data.aws_sqs_queue.this.arn}"
        ]
      }
    ]
  }
  EOF
}

// Step FunctionsがLambdaを呼び出すためのポリシー
resource "aws_iam_policy" "step_functions_lambda" {
  name = "${local.identifier}-step-functions-lambda-policy"

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "lambda:InvokeFunction"
        ],
        "Resource": [
          "${aws_lambda_function.appsync_update.arn}"
        ]
      }
    ]
  }
  EOF
}

// ポリシーをロールにアタッチ
resource "aws_iam_role_policy_attachment" "step_functions_dynamodb" {
  role       = aws_iam_role.step_functions.name
  policy_arn = aws_iam_policy.step_functions_dynamodb.arn
}

resource "aws_iam_role_policy_attachment" "step_functions_sqs" {
  role       = aws_iam_role.step_functions.name
  policy_arn = aws_iam_policy.step_functions_sqs.arn
}

resource "aws_iam_role_policy_attachment" "step_functions_lambda" {
  role       = aws_iam_role.step_functions.name
  policy_arn = aws_iam_policy.step_functions_lambda.arn
}

// Step Functionsのステートマシン定義
resource "aws_sfn_state_machine" "timer_state_machine" {
  name     = "${local.identifier}-timer-state-machine"
  role_arn = aws_iam_role.step_functions.arn

  definition = <<-EOF
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
          "TableName": "Timer-${var.env}",
          "Key": {
            "id": { "S.$": "$.id" }
          }
        },
        "ResultPath": "$.currentTimer",
        "Next": "CheckTimerValid",
        "Retry": [
          {
            "ErrorEquals": ["States.ALL"],
            "IntervalSeconds": 1,
            "MaxAttempts": 5,
            "BackoffRate": 2
          }
        ]
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
            "And": [
              {
                "Variable": "$.currentTimer.Item.endTime.S",
                "IsPresent": true
              },
              {
                "Variable": "$.currentTimer.Item.endTime.S",
                "StringEquals.$": "$.endTime"
              }
            ],
            "Next": "NotifyTimerEnd"
          }
        ],
        "Default": "EndExecution"
      },
      "NotifyTimerEnd": {
        "Type": "Task",
        "Resource": "arn:aws:states:::sqs:sendMessage",
        "Parameters": {
          "QueueUrl": "${data.aws_sqs_queue.this.url}",
          "MessageBody": {
            "text.$": "States.Format('{} のタイマーが終了しました。', $.currentTimer.Item.name.S || $.currentTimer.Item.time.S)",
            "url": "${var.slack_url}"
          }
        },
        "Next": "UpdateTimerState",
        "Retry": [
          {
            "ErrorEquals": ["States.ALL"],
            "IntervalSeconds": 1,
            "MaxAttempts": 5,
            "BackoffRate": 2
          }
        ]
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
          "FunctionName": "${aws_lambda_function.appsync_update.function_name}",
          "Payload": {
            "timerId.$": "$.id",
            "isTemped": true,
            "operation": "TIMER_END"
          }
        },
        "ResultSelector": {
          "result.$": "$.Payload.result"
        },
        "End": true,
        "Retry": [
          {
            "ErrorEquals": ["States.ALL"],
            "IntervalSeconds": 1,
            "MaxAttempts": 5,
            "BackoffRate": 2
          }
        ]
      },
      "ResetTimerViaAppSync": {
        "Type": "Task",
        "Resource": "arn:aws:states:::lambda:invoke",
        "Parameters": {
          "FunctionName": "${aws_lambda_function.appsync_update.function_name}",
          "Payload": {
            "timerId.$": "$.id",
            "isTemped": false,
            "operation": "TIMER_END"
          }
        },
        "ResultSelector": {
          "result.$": "$.Payload.result"
        },
        "End": true,
        "Retry": [
          {
            "ErrorEquals": ["States.ALL"],
            "IntervalSeconds": 1,
            "MaxAttempts": 5,
            "BackoffRate": 2
          }
        ]
      },
      "EndExecution": {
        "Type": "Pass",
        "End": true
      }
    }
  }
  EOF

  depends_on = [
    aws_iam_role_policy_attachment.step_functions_dynamodb,
    aws_iam_role_policy_attachment.step_functions_sqs,
    aws_iam_role_policy_attachment.step_functions_lambda
  ]
  logging_configuration {
    log_destination        = "${aws_cloudwatch_log_group.step_functions_log_group.arn}:*"
    include_execution_data = true
    level                  = "ALL"
  }
}

// Step Functions用のCloudWatch Logsグループ
resource "aws_cloudwatch_log_group" "step_functions_log_group" {
  name              = "/aws/states/${local.identifier}-timer-state-machine"
  retention_in_days = 30
}

// 現在のAWSリージョン情報を取得
data "aws_region" "current" {}

// 現在のAWSアカウントID情報を取得
data "aws_caller_identity" "current" {}
