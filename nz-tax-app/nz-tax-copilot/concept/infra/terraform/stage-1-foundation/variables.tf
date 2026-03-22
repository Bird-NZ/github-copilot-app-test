variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "australiaeast"
}

variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
  default     = "nz-tax-copilot"
}

variable "environment" {
  description = "Environment name (dev, test, staging, prod)"
  type        = string
  default     = "dev"
}

variable "organization" {
  description = "Organization name for naming conventions"
  type        = string
  default     = "nz-tax-copilot"
}

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
  default     = null
}