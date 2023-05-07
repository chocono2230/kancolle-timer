terraform {
  required_version = "1.4.6"

  backend "s3" {
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>4.66.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~>2.3.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
  default_tags {
    tags = {
      from    = "terraform"
      project = var.project
      env     = var.env
    }
  }
}

locals {
  identifier = "${var.env}-${var.project}"
}
