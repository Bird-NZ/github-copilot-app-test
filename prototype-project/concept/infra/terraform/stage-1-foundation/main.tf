# Resource Group
resource "azapi_resource" "rg" {
  type      = "Microsoft.Resources/resourceGroups@2024-03-01"
  name      = "${local.prefix}-rg-${var.project}-${var.environment}-${local.region_short}"
  location  = var.location
  
  body = {
    tags = local.common_tags
  }
}

# Log Analytics Workspace
resource "azapi_resource" "log_analytics" {
  type      = "Microsoft.OperationalInsights/workspaces@2023-09-01"
  name      = "${local.prefix}-log-${var.project}-${var.environment}-${local.region_short}"
  parent_id = azapi_resource.rg.id
  location  = var.location
  
  body = {
    properties = {
      sku = {
        name = "PerGB2018"
      }
      retentionInDays = 90
      features = {
        enableLogAccessUsingOnlyResourcePermissions = true
      }
    }
    tags = local.common_tags
  }
}

# Application Insights (workspace-based)
resource "azapi_resource" "app_insights" {
  type      = "Microsoft.Insights/components@2020-02-02"
  name      = "${local.prefix}-appi-${var.project}-${var.environment}-${local.region_short}"
  parent_id = azapi_resource.rg.id
  location  = var.location
  
  body = {
    kind = "web"
    properties = {
      Application_Type              = "web"
      WorkspaceResourceId          = azapi_resource.log_analytics.id
      RetentionInDays              = 90
      IngestionMode                = "LogAnalytics"
      publicNetworkAccessForIngestion = "Enabled"
      publicNetworkAccessForQuery     = "Enabled"
    }
    tags = local.common_tags
  }
}