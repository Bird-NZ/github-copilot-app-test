variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "australiaeast"
}

variable "project" {
  description = "Project identifier for naming"
  type        = string
  default     = "tax"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}