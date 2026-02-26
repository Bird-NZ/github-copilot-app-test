variable "subscription_id" {
  description = "Azure subscription ID for deployment"
  type        = string
  sensitive   = true
}

variable "stage1_state_path" {
  description = "Path to Stage 1 Terraform state file"
  type        = string
  default     = "../stage-1-foundation/terraform.tfstate"
}