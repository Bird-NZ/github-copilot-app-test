# Azure OpenAI Account
resource "azapi_resource" "openai" {
  type      = "Microsoft.CognitiveServices/accounts@2025-06-01"
  name      = local.openai_account_name
  parent_id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.resource_group_name}"
  location  = var.location

  body = {
    kind = "OpenAI"
    sku = {
      name = "S0"
    }
    properties = {
      customSubDomainName = local.openai_account_name
      publicNetworkAccess = "Disabled"
      networkAcls = {
        defaultAction = "Deny"
      }
      disableLocalAuth = true
    }
    identity = {
      type = "SystemAssigned"
    }
    tags = local.common_tags
  }
}

# GPT-4o Model Deployment
resource "azapi_resource" "gpt4o_deployment" {
  type      = "Microsoft.CognitiveServices/accounts/deployments@2025-06-01"
  name      = "gpt-4o"
  parent_id = azapi_resource.openai.id

  body = {
    sku = {
      name     = "Standard"
      capacity = var.gpt4o_capacity
    }
    properties = {
      model = {
        format  = "OpenAI"
        name    = "gpt-4o"
        version = "2024-08-06"
      }
      versionUpgradeOption = "OnceNewDefaultVersionAvailable"
      raiPolicyName        = "Microsoft.Default"
    }
  }

  depends_on = [azapi_resource.openai]
}

# Text Embedding Model Deployment
resource "azapi_resource" "embeddings_deployment" {
  type      = "Microsoft.CognitiveServices/accounts/deployments@2025-06-01"
  name      = "text-embedding-ada-002"
  parent_id = azapi_resource.openai.id

  body = {
    sku = {
      name     = "Standard"
      capacity = var.embeddings_capacity
    }
    properties = {
      model = {
        format  = "OpenAI"
        name    = "text-embedding-ada-002"
        version = "2"
      }
      versionUpgradeOption = "OnceNewDefaultVersionAvailable"
    }
  }

  depends_on = [azapi_resource.gpt4o_deployment]
}

# Private Endpoint for Azure OpenAI
resource "azapi_resource" "private_endpoint" {
  type      = "Microsoft.Network/privateEndpoints@2025-06-01"
  name      = local.private_endpoint_name
  parent_id = "/subscriptions/${var.subscription_id}/resourceGroups/${var.resource_group_name}"
  location  = var.location

  body = {
    properties = {
      subnet = {
        id = var.subnet_ai_id
      }
      privateLinkServiceConnections = [
        {
          name = "openai-connection"
          properties = {
            privateLinkServiceId = azapi_resource.openai.id
            groupIds             = ["account"]
          }
        }
      ]
    }
    tags = local.common_tags
  }

  depends_on = [azapi_resource.openai]
}

# Private DNS Zone Group
resource "azapi_resource" "dns_zone_group" {
  type      = "Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-06-01"
  name      = "openai-dns-zone-group"
  parent_id = azapi_resource.private_endpoint.id

  body = {
    properties = {
      privateDnsZoneConfigs = [
        {
          name = "openai-config"
          properties = {
            privateDnsZoneId = var.private_dns_zone_openai_id
          }
        }
      ]
    }
  }

  depends_on = [azapi_resource.private_endpoint]
}

# RBAC: Cognitive Services OpenAI User role for managed identity
resource "azapi_resource" "rbac_openai_user" {
  type      = "Microsoft.Authorization/roleAssignments@2025-06-01"
  name      = uuid()
  parent_id = azapi_resource.openai.id

  body = {
    properties = {
      roleDefinitionId = "/subscriptions/${var.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/5e0bd9bd-7b93-4f28-af87-19fc36ad61bd"
      principalId      = var.managed_identity_principal_id
      principalType    = "ServicePrincipal"
    }
  }

  depends_on = [azapi_resource.openai]
}

# Diagnostic Settings
resource "azapi_resource" "diagnostic_settings" {
  type      = "Microsoft.Insights/diagnosticSettings@2025-06-01"
  name      = "diag-openai"
  parent_id = azapi_resource.openai.id

  body = {
    properties = {
      workspaceId = var.log_analytics_workspace_id
      logs = [
        {
          category = "Audit"
          enabled  = true
        },
        {
          category = "RequestResponse"
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

  depends_on = [azapi_resource.openai]
}

# Store OpenAI endpoint in Key Vault
data "azurerm_key_vault" "main" {
  name                = split("/", var.key_vault_id)[8]
  resource_group_name = var.resource_group_name
}

resource "azurerm_key_vault_secret" "openai_endpoint" {
  name         = "openai-endpoint"
  value        = jsondecode(azapi_resource.openai.output).properties.endpoint
  key_vault_id = var.key_vault_id

  depends_on = [azapi_resource.openai]
}