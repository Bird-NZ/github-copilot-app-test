locals {
  # Naming convention: microsoft-alz pattern
  # Pattern: {zoneid}-{type}-{service}-{env}-{region_short}
  # Zone: zd (Development Zone)
  acr_name = "zdacr${var.project}${var.environment}${var.region_short}"
  
  project  = var.project
  location = var.location

  # Common tags applied to all resources
  common_tags = {
    Environment = var.environment
    Purpose     = "prototype"
    Project     = "nz-tax-copilot"
    Zone        = "zd"
    Stage       = "container-registry"
    ManagedBy   = "terraform"
  }
}