variable "project" {
  description = "Project name"
  type        = string
  default     = "tax"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "region_short" {
  description = "Short region code (aue for australiaeast)"
  type        = string
  default     = "aue"
}

variable "common_tags" {
  description = "Common resource tags"
  type        = map(string)
  default = {
    Environment = "dev"
    Purpose     = "prototype"
    Project     = "nz-tax-copilot"
    Zone        = "zd"
    Stage       = "frontend-spa"
    ManagedBy   = "terraform"
  }
}