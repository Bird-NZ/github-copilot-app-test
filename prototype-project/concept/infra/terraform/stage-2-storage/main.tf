# Storage Account
# SKU: Standard LRS (locally-redundant storage for dev/test)
# Security: Shared key access disabled, public blob access disabled
# Network: Firewall default-deny with AzureServices bypass (trusted services exception)

resource "azapi_resource" "storage_account" {
  type      = "Microsoft.Storage/storageAccounts@2025-06-01"
  name      = local.storage_account_name
  parent_id = local.resource_group_id
  location  = local.location
  
  body = {
    kind = "StorageV2"
    sku = {
      name = "Standard_LRS"
    }
    properties = {
      accessTier                    = "Hot"
      minimumTlsVersion             = "TLS1_2"
      allowBlobPublicAccess         = false
      allowSharedKeyAccess          = false
      supportsHttpsTrafficOnly      = true
      
      encryption = {
        requireInfrastructureEncryption = true
        services = {
          blob = {
            enabled = true
            keyType = "Account"
          }
        }
        keySource = "Microsoft.Storage"
      }
      
      networkAcls = {
        bypass              = "AzureServices"
        defaultAction       = "Deny"
        ipRules             = []
        virtualNetworkRules = []
      }
    }
    tags = local.common_tags
  }
  
  ignore_missing_property = true
  
  timeouts {
    create = "15m"
    update = "15m"
    delete = "15m"
  }
}

# Blob Container
# Pre-created container to avoid runtime permission issues
# Access level: Private (no anonymous access)

resource "azapi_resource" "blob_container" {
  type      = "Microsoft.Storage/storageAccounts/blobServices/containers@2025-06-01"
  name      = local.container_name
  parent_id = "${azapi_resource.storage_account.id}/blobServices/default"
  
  body = {
    properties = {
      publicAccess = "None"
    }
  }
  
  depends_on = [azapi_resource.storage_account]
  
  timeouts {
    create = "10m"
    delete = "10m"
  }
}

# User-Assigned Managed Identity
# Reusable identity for function app authentication
# Lifecycle bound to this stage (not individual function apps)

resource "azapi_resource" "user_identity" {
  type      = "Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31"
  name      = local.identity_name
  parent_id = local.resource_group_id
  location  = local.location
  
  body = {
    tags = merge(local.common_tags, {
      Purpose = "function-app-authentication"
    })
  }
  
  timeouts {
    create = "10m"
    delete = "10m"
  }
}

# RBAC Role Assignment: Storage Blob Data Contributor
# Grants managed identity read/write access to blob storage
# Role ID: ba92f5b4-2d11-453d-a403-e96b0029c9fe (Storage Blob Data Contributor)
# Scope: Entire storage account (not scoped to container for simplicity)

resource "azapi_resource" "role_assignment" {
  type      = "Microsoft.Authorization/roleAssignments@2022-04-01"
  name      = uuid()
  parent_id = azapi_resource.storage_account.id
  
  body = {
    properties = {
      roleDefinitionId = "/subscriptions/${var.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe"
      principalId      = azapi_resource.user_identity.output.properties.principalId
      principalType    = "ServicePrincipal"
    }
  }
  
  depends_on = [
    azapi_resource.user_identity,
    azapi_resource.storage_account
  ]
  
  timeouts {
    create = "10m"
    delete = "10m"
  }
}