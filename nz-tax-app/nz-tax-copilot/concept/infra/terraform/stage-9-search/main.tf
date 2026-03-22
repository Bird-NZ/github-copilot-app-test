# Data source: Stage 1 outputs (foundation)
data "terraform_remote_state" "stage1" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage1-foundation.tfstate"
  }
}

# Data source: Stage 2 outputs (networking)
data "terraform_remote_state" "stage2" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage2-networking.tfstate"
  }
}

# Data source: Stage 7 outputs (blob storage)
data "terraform_remote_state" "stage7" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage7-storage.tfstate"
  }
}

# Data source: Stage 8 outputs (azure openai)
data "terraform_remote_state" "stage8" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage8-openai.tfstate"
  }
}

# Azure AI Search Service
resource "azapi_resource" "search" {
  type      = "Microsoft.Search/searchServices@2025-06-01"
  name      = local.search_service_name
  parent_id = data.terraform_remote_state.stage1.outputs.resource_group_id
  location  = var.location

  body = {
    properties = {
      replicaCount              = 1
      partitionCount            = 1
      hostingMode               = "default"
      publicNetworkAccess       = "disabled"
      authOptions = {
        aadOrApiKey = {
          aadAuthFailureMode = "http401WithBearerChallenge"
        }
      }
      disableLocalAuth          = true
      encryptionWithCmk = {
        enforcement = "Disabled"
      }
      semanticSearch            = "disabled"
    }
    sku = {
      name = "basic"
    }
    identity = {
      type = "SystemAssigned"
    }
    tags = local.common_tags
  }

  response_export_values = ["identity", "properties"]
}

# Private Endpoint for AI Search
resource "azapi_resource" "private_endpoint" {
  type      = "Microsoft.Network/privateEndpoints@2025-06-01"
  name      = local.private_endpoint_name
  parent_id = data.terraform_remote_state.stage1.outputs.resource_group_id
  location  = var.location

  body = {
    properties = {
      subnet = {
        id = data.terraform_remote_state.stage2.outputs.subnet_ai_id
      }
      privateLinkServiceConnections = [
        {
          name = "search-connection"
          properties = {
            privateLinkServiceId = azapi_resource.search.id
            groupIds             = ["searchService"]
          }
        }
      ]
    }
    tags = local.common_tags
  }

  depends_on = [azapi_resource.search]
}

# Private DNS Zone Group for Private Endpoint
resource "azapi_resource" "private_dns_zone_group" {
  type      = "Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-06-01"
  name      = "default"
  parent_id = azapi_resource.private_endpoint.id

  body = {
    properties = {
      privateDnsZoneConfigs = [
        {
          name = "privatelink-search-windows-net"
          properties = {
            privateDnsZoneId = data.terraform_remote_state.stage2.outputs.private_dns_zone_search_id
          }
        }
      ]
    }
  }

  depends_on = [azapi_resource.private_endpoint]
}

# Diagnostic Settings for AI Search
resource "azapi_resource" "diagnostic_settings" {
  type      = "Microsoft.Insights/diagnosticSettings@2021-05-01-preview"
  name      = "diag-search"
  parent_id = azapi_resource.search.id

  body = {
    properties = {
      workspaceId = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
      logs = [
        {
          category = "OperationLogs"
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

  depends_on = [azapi_resource.search]
}