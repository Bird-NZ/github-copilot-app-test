variable "subscription_id" {
  description = "Azure subscription ID for deployment"
  type        = string
  sensitive   = true
}

variable "project" {
  description = "Project name for resource naming"
  type        = string
  default     = "helloworld"
}

variable "environment" {
  description = "Environment (dev/test/staging/prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "australiaeast"
}

variable "owner" {
  description = "Resource owner tag"
  type        = string
  default     = "mat"
}