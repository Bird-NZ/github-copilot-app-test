# Data source: Read outputs from Stage 1 (Foundation)
data "terraform_remote_state" "stage1" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage-1-foundation.tfstate"
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
      name = "Standard"
    }
    properties = {
      adminUserEnabled = false
    }
    identity = {
      type = "SystemAssigned"
    }
  }

  tags = local.common_tags

  response_export_values = ["identity.principalId"]
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