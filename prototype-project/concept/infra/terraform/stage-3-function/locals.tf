locals {
  # Common tags applied to all resources
  common_tags = {
    Environment = var.environment
    Owner       = "mat"
    Purpose     = "prototype"
    ManagedBy   = "terraform"
    Project     = var.project
    Stage       = "function-app"
    env         = var.environment
    ttl         = "7d"
    costCap     = "10NZD"
  }
  
  # Resource naming using Azure Landing Zone convention
  # Pattern: {zoneid}-{type}-{service}-{env}-{region_short}
  asp_name  = "${var.zone_id}-asp-${var.project}-${var.environment}-${var.region_short}"
  func_name = "${var.zone_id}-func-${var.project}-${var.environment}-${var.region_short}"
}