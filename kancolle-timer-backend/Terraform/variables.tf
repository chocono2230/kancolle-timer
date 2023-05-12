variable "env" {
  type = string
}
variable "project" {
  type = string
}
variable "api_key" {
  type      = string
  sensitive = true
}
variable "endpoint" {
  type      = string
  sensitive = true
}
variable "slack_url" {
  type      = string
  sensitive = true
}
variable "sqs_url" {
  type      = string
  sensitive = true
}
variable "sqs_name" {
  type = string
}

