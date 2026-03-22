# Container Apps Environment
# https://learn.microsoft.com/en-us/azure/templates/microsoft.app/2025-06-01/managedenvironments
resource "azapi_resource" "container_apps_environment" {
  type      = "Microsoft.App/managedEnvironments@2025-06-01"
  name      = local.cae_name
  parent_id = data.azurerm_resource_group.main.id
  location  = var.location

  body = {
    properties = {
      # VNET integration for private endpoint connectivity
      vnetConfiguration = {
        infrastructureSubnetId = var.subnet_apps_id
        internal               = false # External ingress required for user-facing API (prototype)
      }

      # Log Analytics workspace integration
      appLogsConfiguration = {
        destination = "log-analytics"
        logAnalyticsConfiguration = {
          customerId = data.azurerm_log_analytics_workspace.main.workspace_id
          sharedKey  = data.azurerm_log_analytics_workspace.main.primary_shared_key
        }
      }

      # Zone redundancy disabled (single-zone for prototype)
      zoneRedundant = false

      # Workload profiles (Consumption plan for prototype)
      workloadProfiles = [
        {
          name                = "Consumption"
          workloadProfileType = "Consumption"
        }
      ]

      # Dapr configuration (disabled for prototype)
      daprAIInstrumentationKey = null
      daprAIConnectionString   = null

      # Keda configuration (disabled for prototype)
      kedaConfiguration = null
    }

    tags = var.tags
  }

  # Ignore changes to shared key (prevents drift from Log Analytics key rotation)
  lifecycle {
    ignore_changes = [
      body.properties.appLogsConfiguration.logAnalyticsConfiguration.sharedKey
    ]
  }
}

# Diagnostic settings for Container Apps Environment
# https://learn.microsoft.com/en-us/azure/templates/microsoft.insights/2025-06-01/diagnosticsettings
resource "azapi_resource" "cae_diagnostic_settings" {
  type      = "Microsoft.Insights/diagnosticSettings@2025-06-01"
  name      = "diag-cae"
  parent_id = azapi_resource.container_apps_environment.id

  body = {
    properties = {
      workspaceId = var.log_analytics_workspace_id

      logs = [
        {
          category = "ContainerAppSystemLogs"
          enabled  = true
        }
      ]

      metrics = [
        {
          category = "AllMetrics"
          enabled  = true
        }
      ]
    }
  }
}