resource "aws_cloudwatch_event_rule" "this" {
  name                = "${local.identifier}-rule"
  schedule_expression = "cron(* * * * ? *)"
  is_enabled          = (var.env == "dev" ? true : false)
}

resource "aws_cloudwatch_event_target" "this" {
  rule = aws_cloudwatch_event_rule.this.name
  arn  = aws_lambda_function.this.arn
}

resource "aws_lambda_permission" "this" {
  statement_id  = "${local.identifier}-permission"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.this.arn
}
