variable "project" {
  description = "Project name used in resource naming"
  type        = string
  default     = "tax"
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

variable "sql_admin_group_id" {
  description = "Azure AD group object ID for SQL Server Entra admin"
  type        = string
}

variable "sql_admin_group_name" {
  description = "Azure AD group name for SQL Server Entra admin"
  type        = string
  default     = "nz-tax-copilot-sql-admins"
}

variable "database_name" {
  description = "SQL Database name"
  type        = string
  default     = "TaxCopilotDB"
}

variable "database_collation" {
  description = "SQL Database collation"
  type        = string
  default     = "SQL_Latin1_General_CP1_CI_AS"
}

variable "database_max_size_gb" {
  description = "Maximum database size in GB"
  type        = number
  default     = 32
}

variable "database_sku_name" {
  description = "Database SKU name (serverless)"
  type        = string
  default     = "GP_S_Gen5_2"
}

variable "database_min_capacity" {
  description = "Minimum vCores for serverless database"
  type        = number
  default     = 0.5
}

variable "database_auto_pause_delay_minutes" {
  description = "Minutes of inactivity before auto-pause"
  type        = number
  default     = 60
}

variable "backup_retention_days" {
  description = "Backup retention in days"
  type        = number
  default     = 7
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Purpose     = "prototype"
    Project     = "nz-tax-copilot"
    Zone        = "zd"
    Stage       = "sql"
    ManagedBy   = "terraform"
  }
}