locals {
  # Region short code
  region_short = "aue"

  # Resource naming following microsoft-alz convention
  # Pattern: {zone_id}-{type}-{service}-{env}-{region_short}
  key_vault_name        = "${var.zone_id}-kv-${var.project}-${var.environment}-${local.region_short}"
  private_endpoint_name = "pe-kv-${var.project}-${var.environment}-${local.region_short}"

  # Common tags
  common_tags = {
    Environment = var.environment
    Purpose     = "prototype"
    Project     = "nz-tax-copilot"
    Zone        = var.zone_id
    Stage       = "keyvault"
    ManagedBy   = "terraform"
  }
}