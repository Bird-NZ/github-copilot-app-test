# Read outputs from prior stages
data "terraform_remote_state" "stage1" {
  backend = "local"
  config = {
    path = var.stage1_state_path
  }
}

data "terraform_remote_state" "stage2" {
  backend = "local"
  config = {
    path = var.stage2_state_path
  }
}

data "terraform_remote_state" "stage3" {
  backend = "local"
  config = {
    path = var.stage3_state_path
  }
}

# Reference existing resources via azapi data sources
data "azapi_resource" "rg" {
  type        = "Microsoft.Resources/resourceGroups@2021-04-01"
  resource_id = data.terraform_remote_state.stage1.outputs.resource_group_id
}

data "azapi_resource" "subnet_data" {
  type        = "Microsoft.Network/virtualNetworks/subnets@2025-06-01"
  resource_id = data.terraform_remote_state.stage2.outputs.subnet_data_id
}

data "azapi_resource" "private_dns_zone_blob" {
  type        = "Microsoft.Network/privateDnsZones@2025-06-01"
  resource_id = data.terraform_remote_state.stage2.outputs.private_dns_zone_blob_id
}

# Storage Account
resource "azapi_resource" "storage" {
  type      = "Microsoft.Storage/storageAccounts@2025-06-01"
  name      = local.storage_account_name
  parent_id = data.azapi_resource.rg.id
  location  = var.location

  body = {
    kind = "StorageV2"
    sku = {
      name = "Standard_LRS"
    }
    properties = {
      accessTier                   = "Hot"
      allowBlobPublicAccess        = false
      allowSharedKeyAccess         = false
      minimumTlsVersion            = "TLS1_2"
      supportsHttpsTrafficOnly     = true
      publicNetworkAccess          = "Disabled"
      infrastructureEncryption     = true
      networkAcls = {
        defaultAction = "Deny"
        bypass        = "AzureServices"
      }
    }
    tags = local.common_tags
  }

  identity {
    type = "SystemAssigned"
  }

  response_export_values = ["properties.primaryEndpoints", "identity.principalId"]
}

# Blob Service (required before containers)
resource "azapi_resource" "blob_service" {
  type      = "Microsoft.Storage/storageAccounts/blobServices@2025-06-01"
  name      = "default"
  parent_id = azapi_resource.storage.id

  body = {
    properties = {
      deleteRetentionPolicy = {
        enabled = true
        days    = 30
      }
      containerDeleteRetentionPolicy = {
        enabled = true
        days    = 30
      }
      isVersioningEnabled = true
    }
  }

  depends_on = [azapi_resource.storage]
}

# Container: tax-documents
resource "azapi_resource" "container_documents" {
  type      = "Microsoft.Storage/storageAccounts/blobServices/containers@2025-06-01"
  name      = "tax-documents"
  parent_id = azapi_resource.blob_service.id

  body = {
    properties = {
      publicAccess = "None"
      metadata     = {}
    }
  }

  depends_on = [azapi_resource.blob_service]
}

# Container: export-output
resource "azapi_resource" "container_exports" {
  type      = "Microsoft.Storage/storageAccounts/blobServices/containers@2025-06-01"
  name      = "export-output"
  parent_id = azapi_resource.blob_service.id

  body = {
    properties = {
      publicAccess = "None"
      metadata     = {}
    }
  }

  depends_on = [azapi_resource.blob_service]
}