# Variables for Stage 16: IRD Guidance Data Ingestion
# These variables reference outputs from prior stages.

variable "resource_group_name" {
  description = "Resource group name from Stage 1"
  type        = string
}

variable "location" {
  description = "Azure region (australiaeast)"
  type        = string
  default     = "australiaeast"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "nz-tax-copilot"
}

variable "environment" {
  description = "Environment (dev, test, prod)"
  type        = string
  default     = "dev"
}

variable "managed_identity_id" {
  description = "User-assigned managed identity ID from Stage 1"
  type        = string
}

variable "managed_identity_principal_id" {
  description = "Principal ID of managed identity from Stage 1"
  type        = string
}

variable "openai_endpoint" {
  description = "Azure OpenAI endpoint from Stage 8"
  type        = string
}

variable "search_endpoint" {
  description = "AI Search endpoint from Stage 9"
  type        = string
}

variable "search_index_name" {
  description = "AI Search index name from Stage 13"
  type        = string
  default     = "ird-guidance"
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID from Stage 1"
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
    Stage       = "integration"
    ManagedBy   = "terraform"
  }
}