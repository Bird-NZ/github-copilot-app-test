locals {
  region_short = "aue"
  
  # Resource naming following microsoft-alz convention
  sql_server_name = "zd-sql-${var.project}-${var.environment}-${local.region_short}"
  private_endpoint_name = "pe-sql-${var.project}-${var.environment}-${local.region_short}"
  
  # Common tags merged with defaults
  common_tags = merge(var.tags, {
    ManagedBy = "terraform"
    Stage     = "sql"
  })
}