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

variable "location" {
  description = "Azure region"
  type        = string
  default     = "australiaeast"
}

variable "stage1_state_key" {
  description = "Terraform state key for Stage 1 (Foundation)"
  type        = string
  default     = "../.terraform-state/stage1-foundation.tfstate"
}

variable "stage2_state_key" {
  description = "Terraform state key for Stage 2 (Networking)"
  type        = string
  default     = "../.terraform-state/stage2-networking.tfstate"
}

variable "stage3_state_key" {
  description = "Terraform state key for Stage 3 (Key Vault)"
  type        = string
  default     = "../.terraform-state/stage3-keyvault.tfstate"
}

variable "consistency_level" {
  description = "Cosmos DB consistency level"
  type        = string
  default     = "Session"
}

variable "enable_serverless" {
  description = "Enable serverless capacity mode"
  type        = bool
  default     = true
}

variable "enable_free_tier" {
  description = "Enable free tier (only one per subscription)"
  type        = bool
  default     = false
}

variable "workspaces_container_ttl" {
  description = "Default TTL for workspaces container (seconds, -1 for no TTL)"
  type        = number
  default     = -1
}

variable "questionnaire_container_ttl" {
  description = "Default TTL for questionnaire responses container (seconds, -1 for no TTL)"
  type        = number
  default     = -1
}

variable "guidance_history_ttl" {
  description = "Default TTL for guidance history container (seconds, 30 days = 2592000)"
  type        = number
  default     = 2592000
}