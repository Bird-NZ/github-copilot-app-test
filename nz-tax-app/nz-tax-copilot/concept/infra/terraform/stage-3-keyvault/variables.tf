variable "project" {
  description = "Project name (e.g., nz-tax-copilot)"
  type        = string
  default     = "tax"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "zone_id" {
  description = "Azure Landing Zone zone identifier (zd = Development Zone)"
  type        = string
  default     = "zd"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "australiaeast"
}

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
  default     = null
}