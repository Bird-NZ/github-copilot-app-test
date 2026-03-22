variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "project" {
  description = "Project name used in resource naming"
  type        = string
  default     = "nz-tax-copilot"
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

variable "managed_identity_id" {
  description = "User-assigned managed identity resource ID from Stage 1"
  type        = string
}

variable "managed_identity_principal_id" {
  description = "Managed identity principal ID for RBAC assignments from Stage 1"
  type        = string
}

variable "subnet_ai_id" {
  description = "AI subnet ID from Stage 2"
  type        = string
}

variable "private_dns_zone_openai_id" {
  description = "Private DNS zone ID for Azure OpenAI from Stage 2"
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID from Stage 1"
  type        = string
}

variable "key_vault_id" {
  description = "Key Vault ID from Stage 3"
  type        = string
}

variable "gpt4o_capacity" {
  description = "GPT-4o deployment capacity (TPM in thousands)"
  type        = number
  default     = 10
}

variable "embeddings_capacity" {
  description = "Text embedding deployment capacity (TPM in thousands)"
  type        = number
  default     = 120
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}