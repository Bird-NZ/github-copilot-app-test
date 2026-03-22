variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "nz-tax-copilot"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "australiaeast"
}

variable "zone_id" {
  description = "Zone identifier for naming convention"
  type        = string
  default     = "zd"
}

# Inputs from prior stages (passed via terraform_remote_state)
variable "resource_group_name" {
  description = "Resource group name from Stage 1"
  type        = string
}

variable "search_service_name" {
  description = "AI Search service name from Stage 9"
  type        = string
}

variable "search_index_name" {
  description = "AI Search index name from Stage 13"
  type        = string
  default     = "ird-guidance"
}

variable "openai_endpoint" {
  description = "Azure OpenAI endpoint from Stage 8"
  type        = string
}

variable "openai_deployment_embeddings" {
  description = "OpenAI embeddings deployment name from Stage 8"
  type        = string
  default     = "text-embedding-ada-002"
}

variable "managed_identity_id" {
  description = "User-assigned managed identity ID from Stage 1"
  type        = string
}

variable "managed_identity_client_id" {
  description = "User-assigned managed identity client ID from Stage 1"
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "Log Analytics workspace ID from Stage 1"
  type        = string
}

variable "ird_guidance_documents_path" {
  description = "Local path to IRD guidance PDF documents"
  type        = string
  default     = "../../../data/ird-guidance"
}