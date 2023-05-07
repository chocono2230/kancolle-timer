data "archive_file" "this" {
  type        = "zip"
  source_dir  = "${path.root}/../src"
  output_path = "${path.root}/dist/lambda_function.zip"
}

resource "aws_lambda_function" "this" {
  function_name = "${local.identifier}-lambda"
  handler       = "script.handler"
  role          = aws_iam_role.lambda.arn
  runtime       = "python3.10"

  filename         = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256

  environment {
    variables = {
      BASE_MESSAGE = "Hello"
    }
  }
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
  ]
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name = "/aws/lambda/${aws_lambda_function.this.function_name}"
}
