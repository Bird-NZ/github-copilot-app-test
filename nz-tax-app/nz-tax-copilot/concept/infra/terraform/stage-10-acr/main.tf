# Data source: Read outputs from Stage 1 (Foundation)
data "terraform_remote_state" "stage1" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage1-foundation.tfstate"
  }
}

# Data source: Read outputs from Stage 2 (Networking)
data "terraform_remote_state" "stage2" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage2-networking.tfstate"
  }
}

# Azure Container Registry
resource "azapi_resource" "acr" {
  type      = "Microsoft.ContainerRegistry/registries@2023-11-01-preview"
  name      = local.acr_name
  parent_id = data.terraform_remote_state.stage1.outputs.resource_group_id
  location  = local.location

  body = {
    sku = {
      name = "Basic"
    }
    properties = {
      adminUserEnabled      = false
      publicNetworkAccess   = "Disabled"
      networkRuleBypassOptions = "AzureServices"
      policies = {
        retentionPolicy = {
          status = "enabled"
          days   = 7
        }
      }
    }
    identity = {
      type = "SystemAssigned"
    }
  }

  tags = local.common_tags

  response_export_values = ["identity.principalId"]
}

# Private Endpoint for Container Registry
resource "azapi_resource" "pe_acr" {
  type      = "Microsoft.Network/privateEndpoints@2024-01-01"
  name      = "pe-acr-${local.project}"
  parent_id = data.terraform_remote_state.stage1.outputs.resource_group_id
  location  = local.location

  body = {
    properties = {
      subnet = {
        id = data.terraform_remote_state.stage2.outputs.subnet_data_id
      }
      privateLinkServiceConnections = [
        {
          name = "acr-connection"
          properties = {
            privateLinkServiceId = azapi_resource.acr.id
            groupIds             = ["registry"]
          }
        }
      ]
    }
  }

  tags = local.common_tags

  depends_on = [azapi_resource.acr]
}

# Private DNS Zone Group for ACR Private Endpoint
resource "azapi_resource" "pe_acr_dns_group" {
  type      = "Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-01-01"
  name      = "acr-dns-zone-group"
  parent_id = azapi_resource.pe_acr.id

  body = {
    properties = {
      privateDnsZoneConfigs = [
        {
          name = "privatelink-azurecr-io"
          properties = {
            privateDnsZoneId = data.terraform_remote_state.stage2.outputs.private_dns_zone_acr_id
          }
        }
      ]
    }
  }

  depends_on = [azapi_resource.pe_acr]
}

# Diagnostic Settings for Container Registry
resource "azapi_resource" "acr_diagnostics" {
  type      = "Microsoft.Insights/diagnosticSettings@2021-05-01-preview"
  name      = "diag-acr"
  parent_id = azapi_resource.acr.id

  body = {
    properties = {
      workspaceId = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
      logs = [
        {
          category = "ContainerRegistryRepositoryEvents"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        },
        {
          category = "ContainerRegistryLoginEvents"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        }
      ]
      metrics = [
        {
          category = "AllMetrics"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        }
      ]
    }
  }

  depends_on = [azapi_resource.acr]
}