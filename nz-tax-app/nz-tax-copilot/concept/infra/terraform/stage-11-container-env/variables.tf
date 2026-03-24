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
  default     = "zd-rg-tax-dev-aue"
}

variable "subnet_apps_id" {
  description = "Apps subnet ID from Stage 2 (for VNET integration)"
  type        = string
  default     = "/subscriptions/f8ebbbc3-d969-4acf-8510-e39847770f03/resourceGroups/zd-rg-tax-dev-aue/providers/Microsoft.Network/virtualNetworks/pc-vnet-tax-dev-aue/subnets/snet-apps"
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID from Stage 1"
  type        = string
  default     = "/subscriptions/f8ebbbc3-d969-4acf-8510-e39847770f03/resourceGroups/zd-rg-tax-dev-aue/providers/Microsoft.OperationalInsights/workspaces/pm-log-tax-dev-aue"
}

variable "log_analytics_workspace_name" {
  description = "Log Analytics workspace name from Stage 1"
  type        = string
  default     = "pm-log-tax-dev-aue"
}

variable "managed_identity_id" {
  description = "User-assigned managed identity ID from Stage 1"
  type        = string
  default     = "/subscriptions/f8ebbbc3-d969-4acf-8510-e39847770f03/resourceGroups/zd-rg-tax-dev-aue/providers/Microsoft.ManagedIdentity/userAssignedIdentities/zd-id-tax-dev-aue"
}

variable "managed_identity_principal_id" {
  description = "User-assigned managed identity principal ID from Stage 1"
  type        = string
  default     = "9dd4ef82-3c36-495d-a9a7-9d1d6a9b7dfe"
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

variable "subscription_id" {
  description = "Optional subscription id passed by deploy orchestration"
  type        = string
  default     = ""
}
