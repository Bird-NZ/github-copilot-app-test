locals {
  # Zone IDs following Microsoft Azure Landing Zone naming convention
  zone_development = "zd"  # Development Zone (application resources)
  zone_platform    = "pm"  # Management Platform (monitoring resources)
  zone_identity    = "pi"  # Identity Platform

  # Region short code
  region_short = "aue"  # australiaeast

  # Naming convention: {zoneid}-{type}-{service}-{env}-{region_short}
  # Resource naming patterns
  resource_group_name           = "${local.zone_development}-rg-tax-${var.environment}-${local.region_short}"
  managed_identity_name         = "${local.zone_development}-id-tax-${var.environment}-${local.region_short}"
  log_analytics_workspace_name  = "${local.zone_platform}-log-tax-${var.environment}-${local.region_short}"
  application_insights_name     = "${local.zone_platform}-appi-tax-${var.environment}-${local.region_short}"

  # Common tags applied to all resources
  common_tags = {
    Environment = var.environment
    Purpose     = "prototype"
    Project     = var.project_name
    Stage       = "foundation"
    ManagedBy   = "terraform"
  }
}