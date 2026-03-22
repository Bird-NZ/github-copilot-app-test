variable "project" {
  description = "Project name for resource naming"
  type        = string
  default     = "tax"
}

variable "environment" {
  description = "Environment name (dev, test, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "australiaeast"
}

variable "resource_group_name" {
  description = "Resource group name from Stage 1"
  type        = string
}

variable "subnet_apps_id" {
  description = "Apps subnet ID from Stage 2 (for VNET integration)"
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID from Stage 1"
  type        = string
}

variable "log_analytics_workspace_name" {
  description = "Log Analytics workspace name from Stage 1"
  type        = string
}

variable "managed_identity_id" {
  description = "User-assigned managed identity ID from Stage 1"
  type        = string
}

variable "managed_identity_principal_id" {
  description = "User-assigned managed identity principal ID from Stage 1"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Purpose     = "prototype"
    Project     = "nz-tax-copilot"
    Zone        = "zd"
    Stage       = "container-env"
    ManagedBy   = "terraform"
  }
}