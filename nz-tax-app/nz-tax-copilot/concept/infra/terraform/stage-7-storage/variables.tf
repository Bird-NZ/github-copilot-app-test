variable "project" {
  description = "Project name"
  type        = string
  default     = "nz-tax-copilot"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "australiaeast"
}

variable "stage1_state_path" {
  description = "Path to Stage 1 state file"
  type        = string
  default     = "../.terraform-state/stage1-foundation.tfstate"
}

variable "stage2_state_path" {
  description = "Path to Stage 2 state file"
  type        = string
  default     = "../.terraform-state/stage2-networking.tfstate"
}

variable "stage3_state_path" {
  description = "Path to Stage 3 state file"
  type        = string
  default     = "../.terraform-state/stage3-keyvault.tfstate"
}