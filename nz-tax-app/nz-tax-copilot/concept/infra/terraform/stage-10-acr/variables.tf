variable "project" {
  description = "Project name used in resource naming"
  type        = string
  default     = "tax"
}

variable "environment" {
  description = "Environment name (dev, test, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "australiaeast"
}

variable "region_short" {
  description = "Short region code for naming"
  type        = string
  default     = "aue"
}