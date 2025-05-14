locals {
  src_dir  = "${path.root}/../src"
  dist_dir = "${path.root}/dist"
}

data "archive_file" "this" {
  type        = "zip"
  source_dir  = local.src_dir
  output_path = "${local.dist_dir}/lambda_function.zip"
}

data "aws_sqs_queue" "this" {
  name = var.sqs_name
}

# 元のポーリング方式のLambda関数（移行期間中は保持）
resource "aws_lambda_function" "this" {
  function_name = "${local.identifier}-lambda"
  handler       = "script.lambda_handler"
  role          = aws_iam_role.lambda.arn
  runtime       = "python3.8"

  filename         = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256

  layers = [aws_lambda_layer_version.this.arn]

  environment {
    variables = {
      API_KEY   = var.api_key
      ENDPOINT  = var.endpoint
      SLACK_URL = var.slack_url
      SQS_URL   = var.sqs_url
      # Step Functions移行フラグを追加（scriptコードでこの値を参照して処理を分岐）
      STEP_FUNCTIONS_MIGRATION = "true"
      # ステートマシンARNを追加
      STATE_MACHINE_ARN = aws_sfn_state_machine.timer_state_machine.arn
    }
  }
}

resource "aws_lambda_layer_version" "this" {
  depends_on = [terraform_data.lambda_layer]

  layer_name               = "${local.identifier}-lambda-layer"
  filename                 = "${local.dist_dir}/lambda_layer.zip"
  compatible_architectures = ["x86_64"]
  compatible_runtimes      = ["python3.8"]
}

resource "aws_iam_role" "lambda" {
  name = "${local.identifier}-lambda-role"

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
    aws_iam_policy.lambda2sqs.arn,
    # Step Functions起動のためのポリシーを追加
    aws_iam_policy.lambda2stepfunctions.arn
  ]
}

# Step Functions実行のためのポリシーを追加
resource "aws_iam_policy" "lambda2stepfunctions" {
  name = "${local.identifier}-lambda-stepfunctions-policy"

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
          "Effect": "Allow",
          "Action": [
            "states:StartExecution",
            "states:DescribeExecution"
          ],
          "Resource": [
            "${aws_sfn_state_machine.timer_state_machine.arn}",
            "arn:aws:states:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:execution:${local.identifier}-timer-state-machine:*"
          ]
      }
    ]
  }
  EOF
}

resource "aws_iam_policy" "lambda2sqs" {
  name = "${local.identifier}-lambda-sqs-policy"

  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
          "Sid": "ReadWriteTable",
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

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.this.function_name}"
  retention_in_days = 30
}

resource "terraform_data" "lambda_layer" {
  triggers_replace = {
    "code_diff" = filebase64("${local.src_dir}/requirements.txt")
  }

  provisioner "local-exec" {
    command = "pip3 install -r ${local.src_dir}/requirements.txt --target=\"${local.dist_dir}/python\""
  }

  provisioner "local-exec" {
    command     = "zip -r ./lambda_layer.zip ./python"
    working_dir = local.dist_dir
  }

  provisioner "local-exec" {
    command     = "rm -rf ./python"
    working_dir = local.dist_dir
  }
}
