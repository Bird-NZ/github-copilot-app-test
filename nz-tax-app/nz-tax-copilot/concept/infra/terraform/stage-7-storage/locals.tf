locals {
  region_short = "aue"
  zone_id      = "zd"
  
  # Storage account name (24 chars max, lowercase alphanumeric only)
  storage_account_name = "zdsttaxdevaue"
  
  # Private endpoint name
  pe_name = "pe-st-tax-dev-${local.region_short}"
  
  # Common tags
  common_tags = {
    Environment = var.environment
    Purpose     = "prototype"
    Project     = var.project
    Zone        = local.zone_id
    Stage       = "data"
    ManagedBy   = "az-prototype"
  }
}