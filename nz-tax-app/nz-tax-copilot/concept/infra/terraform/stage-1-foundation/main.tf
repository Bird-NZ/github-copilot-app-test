# Resource Group
resource "azapi_resource" "rg" {
  type      = "Microsoft.Resources/resourceGroups@2024-03-01"
  name      = local.resource_group_name
  location  = var.location
  body = {
    properties = {}
    tags = merge(local.common_tags, {
      Zone = local.zone_development
    })
  }
}

# User-Assigned Managed Identity
# This identity will be used by Container Apps and other compute services
# in subsequent stages to access data services (Cosmos DB, SQL, Storage, etc.)
resource "azapi_resource" "managed_identity" {
  type      = "Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31"
  name      = local.managed_identity_name
  parent_id = azapi_resource.rg.id
  location  = var.location
  body = {
    tags = merge(local.common_tags, {
      Zone = local.zone_development
    })
  }
}

# Log Analytics Workspace (Management Platform zone)
# Centralized logging destination for all Azure service diagnostic logs
resource "azapi_resource" "log_analytics" {
  type      = "Microsoft.OperationalInsights/workspaces@2023-09-01"
  name      = local.log_analytics_workspace_name
  parent_id = azapi_resource.rg.id
  location  = var.location
  body = {
    properties = {
      sku = {
        name = "PerGB2018"
      }
      retentionInDays = 30
      features = {
        enableLogAccessUsingOnlyResourcePermissions = true
      }
      workspaceCapping = {
        dailyQuotaGb = -1 # No daily cap for prototype
      }
      publicNetworkAccessForIngestion = "Enabled"
      publicNetworkAccessForQuery     = "Enabled"
    }
    tags = merge(local.common_tags, {
      Zone = local.zone_platform
    })
  }
}

# Application Insights (Management Platform zone)
# Application telemetry and distributed tracing
resource "azapi_resource" "app_insights" {
  type      = "Microsoft.Insights/components@2020-02-02"
  name      = local.application_insights_name
  parent_id = azapi_resource.rg.id
  location  = var.location
  body = {
    kind = "web"
    properties = {
      Application_Type = "web"
      WorkspaceResourceId = azapi_resource.log_analytics.id
      IngestionMode      = "LogAnalytics"
      RetentionInDays    = 30
      SamplingPercentage = 100 # 100% sampling for prototype
      DisableIpMasking   = false
      publicNetworkAccessForIngestion = "Enabled"
      publicNetworkAccessForQuery     = "Enabled"
    }
    tags = merge(local.common_tags, {
      Zone = local.zone_platform
    })
  }
}