// AppSync GraphQL APIを通じてタイマー更新を行うLambda関数
resource "aws_lambda_function" "appsync_update" {
  function_name = "${local.identifier}-appsync-update"
  handler       = "script.appsync_update_handler"
  role          = aws_iam_role.appsync_update.arn
  runtime       = "python3.8"

  filename         = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256

  layers = [aws_lambda_layer_version.this.arn]

  environment {
    variables = {
      API_KEY        = var.api_key
      ENDPOINT       = var.endpoint
      GRAPHQL_API_ID = var.graphql_api_id
    }
  }
}

// AppSyncへの更新を行うLambda関数のIAMロール
resource "aws_iam_role" "appsync_update" {
  name = "${local.identifier}-appsync-update-role"

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
    aws_iam_policy.appsync_update_policy.arn
  ]
}

// AppSync更新用のポリシー
resource "aws_iam_policy" "appsync_update_policy" {
  name = "${local.identifier}-appsync-update-policy"

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "appsync:GraphQL"
        ],
        "Resource": [
          "arn:aws:appsync:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:apis/${var.graphql_api_id}/*"
        ]
      }
    ]
  }
  EOF
}

// AppSync更新Lambda用のCloudWatch Logsグループ
resource "aws_cloudwatch_log_group" "appsync_update_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.appsync_update.function_name}"
  retention_in_days = 365
}
