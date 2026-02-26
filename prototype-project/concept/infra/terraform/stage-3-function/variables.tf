variable "subscription_id" {
  description = "Azure subscription ID for deployment"
  type        = string
  sensitive   = true
}

variable "project" {
  description = "Project name from naming convention"
  type        = string
  default     = "helloworld"
}

variable "environment" {
  description = "Environment name from naming convention"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "australiaeast"
}

variable "region_short" {
  description = "Short region code for naming convention"
  type        = string
  default     = "aue"
}

variable "zone_id" {
  description = "Zone ID from naming convention (zd for Development Zone)"
  type        = string
  default     = "zd"
}