# User-assigned managed identity for API access to storage
resource "azapi_resource" "identity" {
  type      = "Microsoft.ManagedIdentity/userAssignedIdentities@2025-06-01"
  name      = "${local.zone_id}-id-storage-${var.environment}-${local.region_short}"
  parent_id = data.azapi_resource.rg.id
  location  = var.location

  body = {
    tags = merge(local.common_tags, {
      Purpose = "Storage access for backend API"
    })
  }

  response_export_values = ["properties.principalId", "properties.clientId"]
}

# RBAC: Storage Blob Data Contributor role assignment
resource "azapi_resource" "rbac_blob_contributor" {
  type      = "Microsoft.Authorization/roleAssignments@2022-04-01"
  name      = guid(azapi_resource.storage.id, jsondecode(azapi_resource.identity.output).properties.principalId, "ba92f5b4-2d11-453d-a403-e96b0029c9fe")
  parent_id = azapi_resource.storage.id

  body = {
    properties = {
      roleDefinitionId = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe"
      principalId      = jsondecode(azapi_resource.identity.output).properties.principalId
      principalType    = "ServicePrincipal"
    }
  }

  depends_on = [azapi_resource.storage, azapi_resource.identity]
}