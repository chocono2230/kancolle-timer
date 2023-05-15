data "aws_sns_topic" "this" {
  name = var.sns_topic_name
}

resource "aws_cloudwatch_metric_alarm" "this" {
  alarm_name          = "${local.identifier}-appsync-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "4XXError"
  namespace           = "AWS/AppSync"
  period              = 60
  statistic           = "SampleCount"
  threshold           = 100
  alarm_actions = [
    data.aws_sns_topic.this.arn,
  ]
  alarm_description   = <<-EOT
        アクセスカウントのアラート
        1分間に100アクセスあった場合に発行
        異常アクセスを検知
    EOT
  datapoints_to_alarm = 1
  dimensions = {
    "GraphQLAPIId" = var.graphql_api_id
  }
}
