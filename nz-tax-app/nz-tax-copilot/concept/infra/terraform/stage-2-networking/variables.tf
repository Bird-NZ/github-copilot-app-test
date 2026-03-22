variable "resource_group_name" {
  description = "Resource group name from Stage 1 (Foundation)"
  type        = string
  default     = "zd-rg-tax-dev-aue"
}

variable "location" {
  description = "Azure region for networking resources"
  type        = string
  default     = "australiaeast"
}

variable "project" {
  description = "Project identifier for resource naming"
  type        = string
  default     = "tax"
}

variable "environment" {
  description = "Environment name (dev, test, prod)"
  type        = string
  default     = "dev"
}

variable "zone_id" {
  description = "Azure Landing Zone ID (pc for Connectivity Platform)"
  type        = string
  default     = "pc"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Purpose     = "prototype"
    Project     = "nz-tax-copilot"
    ManagedBy   = "terraform"
  }
}

variable "vnet_address_space" {
  description = "Virtual Network address space (CIDR)"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnet_apps_address_prefix" {
  description = "Apps subnet address prefix (for Container Apps)"
  type        = list(string)
  default     = ["10.0.2.0/23"]
}

variable "subnet_data_address_prefix" {
  description = "Data subnet address prefix (for private endpoints: Cosmos DB, SQL, Storage, Key Vault)"
  type        = list(string)
  default     = ["10.0.4.0/24"]
}

variable "subnet_ai_address_prefix" {
  description = "AI subnet address prefix (for private endpoints: Azure OpenAI, AI Search)"
  type        = list(string)
  default     = ["10.0.5.0/25"]
}

variable "subnet_mgmt_address_prefix" {
  description = "Management subnet address prefix (for Bastion and monitoring)"
  type        = list(string)
  default     = ["10.0.6.0/26"]
}

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
  default     = null
}