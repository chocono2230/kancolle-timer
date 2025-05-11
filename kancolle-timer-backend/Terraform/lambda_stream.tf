// DynamoDBストリームからStep Functionsを起動するLambda関数
resource "aws_lambda_function" "dynamodb_stream_handler" {
  function_name = "${local.identifier}-dynamodb-stream-handler"
  handler       = "script.dynamodb_stream_handler"
  role          = aws_iam_role.dynamodb_stream_handler.arn
  runtime       = "python3.8"

  filename         = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256

  layers = [aws_lambda_layer_version.this.arn]

  environment {
    variables = {
      STATE_MACHINE_ARN = aws_sfn_state_machine.timer_state_machine.arn
    }
  }
}

// DynamoDBストリームからの通知を処理するLambda関数のIAMロール
resource "aws_iam_role" "dynamodb_stream_handler" {
  name = "${local.identifier}-dynamodb-stream-handler-role"

  assume_role_policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    aws_iam_policy.dynamodb_stream_handler_policy.arn
  ]
}

// DynamoDBストリームハンドラー用のポリシー
resource "aws_iam_policy" "dynamodb_stream_handler_policy" {
  name = "${local.identifier}-dynamodb-stream-handler-policy"

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams"
        ],
        "Resource": "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/Timer-${var.env}*/stream/*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "states:StartExecution"
        ],
        "Resource": [
          "${aws_sfn_state_machine.timer_state_machine.arn}"
        ]
      }
    ]
  }
  EOF
}

// DynamoDBストリームハンドラーのCloudWatch Logsグループ
resource "aws_cloudwatch_log_group" "dynamodb_stream_handler_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.dynamodb_stream_handler.function_name}"
  retention_in_days = 30
}

// EventSourceMappingでDynamoDBストリームとLambda関数を接続
// 注意: 実際のDynamoDBストリームARNが必要です。
//      必要に応じて、ARNを変数として設定してください。
resource "aws_lambda_event_source_mapping" "dynamodb_stream" {
  event_source_arn  = var.dynamodb_stream_arn
  function_name     = aws_lambda_function.dynamodb_stream_handler.arn
  starting_position = "LATEST"
  batch_size        = 10
  enabled           = true
}
