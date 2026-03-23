# Data source: Reference Stage 1 (Foundation) outputs
data "terraform_remote_state" "stage1" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage-1-foundation.tfstate"
  }
}

# Data source: Reference Stage 2 (Networking) outputs
data "terraform_remote_state" "stage2" {
  backend = "local"
  config = {
    path = "../.terraform-state/stage2-networking.tfstate"
  }
}

# Azure Key Vault
resource "azapi_resource" "key_vault" {
  type      = "Microsoft.KeyVault/vaults@2025-05-01"
  name      = local.key_vault_name
  location  = var.location
  parent_id = data.terraform_remote_state.stage1.outputs.resource_group_id

  body = {
    properties = {
      tenantId = data.azurerm_client_config.current.tenant_id
      sku = {
        family = "A"
        name   = "standard"
      }

      # Security baseline: RBAC authorization (NOT access policies)
      enableRbacAuthorization = true

      # Soft delete and purge protection (mandatory for production)
      enableSoftDelete        = true
      softDeleteRetentionInDays = 90
      enablePurgeProtection   = true

      # Network isolation: Deny public access (private endpoint only)
      publicNetworkAccess = "Disabled"

      networkAcls = {
        defaultAction = "Deny"
        bypass        = "AzureServices"
        ipRules       = []
        virtualNetworkRules = []
      }
    }

    tags = local.common_tags
  }

  schema_validation_enabled = false
  ignore_missing_property   = true
}

# Private Endpoint for Key Vault
resource "azapi_resource" "key_vault_private_endpoint" {
  type      = "Microsoft.Network/privateEndpoints@2025-05-01"
  name      = local.private_endpoint_name
  location  = var.location
  parent_id = data.terraform_remote_state.stage1.outputs.resource_group_id

  body = {
    properties = {
      subnet = {
        id = data.terraform_remote_state.stage2.outputs.subnet_data_id
      }

      privateLinkServiceConnections = [
        {
          name = "kv-connection"
          properties = {
            privateLinkServiceId = azapi_resource.key_vault.id
            groupIds             = ["vault"]
          }
        }
      ]
    }

    tags = local.common_tags
  }

  schema_validation_enabled = false
  ignore_missing_property   = true

  depends_on = [azapi_resource.key_vault]
}

# Private DNS Zone Group (links private endpoint to DNS zone)
resource "azapi_resource" "kv_dns_zone_group" {
  type      = "Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01"
  name      = "kv-dns-zone-group"
  parent_id = azapi_resource.key_vault_private_endpoint.id

  body = {
    properties = {
      privateDnsZoneConfigs = [
        {
          name = "config1"
          properties = {
            privateDnsZoneId = data.terraform_remote_state.stage2.outputs.dns_zone_keyvault_id
          }
        }
      ]
    }
  }

  schema_validation_enabled = false
  ignore_missing_property   = true

  depends_on = [azapi_resource.key_vault_private_endpoint]
}

# RBAC Role Assignment: Managed Identity -> Key Vault Secrets User
# Role: Key Vault Secrets User (4633458b-17de-408a-b874-0445c86b69e6)
resource "azapi_resource" "kv_secrets_user_role" {
  type = "Microsoft.Authorization/roleAssignments@2022-04-01"
  
  # Deterministic UUID based on: Key Vault ID + Principal ID + Role ID
  # This ensures the name is stable across deployments but unique per assignment
  name = uuidv5(
    "dns", 
    "${azapi_resource.key_vault.id}-${data.terraform_remote_state.stage1.outputs.managed_identity_principal_id}-4633458b-17de-408a-b874-0445c86b69e6"
  )
  
  parent_id = azapi_resource.key_vault.id

  body = {
    properties = {
      roleDefinitionId = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/4633458b-17de-408a-b874-0445c86b69e6"
      principalId      = data.terraform_remote_state.stage1.outputs.managed_identity_principal_id
      principalType    = "ServicePrincipal"
    }
  }

  schema_validation_enabled = false
  ignore_missing_property   = true

  depends_on = [azapi_resource.key_vault]
}

# Diagnostic Settings: Send Key Vault logs to Log Analytics
resource "azapi_resource" "kv_diagnostic_settings" {
  type      = "Microsoft.Insights/diagnosticSettings@2021-05-01-preview"
  name      = "diag-kv"
  parent_id = azapi_resource.key_vault.id

  body = {
    properties = {
      workspaceId = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
      
      logs = [
        {
          category = "AuditEvent"
          enabled  = true
        },
        {
          category = "AzurePolicyEvaluationDetails"
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

  schema_validation_enabled = false
  ignore_missing_property   = true

  depends_on = [azapi_resource.key_vault]
}