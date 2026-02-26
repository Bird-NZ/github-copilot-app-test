locals {
  # Region short code for naming
  region_short = "aue"
  
  # Common tags for all resources
  common_tags = {
    Environment = var.environment
    Owner       = var.owner
    Purpose     = "prototype"
    ManagedBy   = "terraform"
    Project     = var.project
    Stage       = "foundation"
    env         = var.environment
    ttl         = "7d"
    costCap     = "10NZD"
  }
  
  # Resource naming pattern (Azure Landing Zone: zd-{type}-{service}-{env}-{region})
  prefix = "zd"
}