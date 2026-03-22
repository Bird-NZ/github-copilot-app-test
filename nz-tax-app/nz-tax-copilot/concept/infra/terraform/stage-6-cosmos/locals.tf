locals {
  region_short = "aue"
  zone_id      = "zd"

  # Resource naming following microsoft-alz convention
  cosmos_account_name = "${local.zone_id}-cosmos-tax-${var.environment}-${local.region_short}"
  database_name       = "TaxCopilotDB"
  
  # Container names
  workspaces_container_name             = "workspaces"
  questionnaire_responses_container_name = "questionnaireResponses"
  guidance_history_container_name        = "guidanceHistory"
  
  # Private endpoint naming
  private_endpoint_name = "pe-cosmos-tax-${var.environment}-${local.region_short}"
  
  # Common tags
  common_tags = {
    Environment = var.environment
    Purpose     = "prototype"
    Project     = var.project
    Zone        = local.zone_id
    Stage       = "data"
    ManagedBy   = "terraform"
  }
}