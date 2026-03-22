locals {
  # Resource naming following microsoft-alz convention
  openai_account_name = "zd-openai-tax-${var.environment}-aue"
  private_endpoint_name = "pe-openai-tax-${var.environment}-aue"

  # Region short code
  region_short = "aue"

  # Common tags
  common_tags = merge(
    {
      Environment = var.environment
      Purpose     = "prototype"
      Project     = var.project
      Zone        = "zd"
      Stage       = "ai"
      ManagedBy   = "terraform"
    },
    var.tags
  )
}