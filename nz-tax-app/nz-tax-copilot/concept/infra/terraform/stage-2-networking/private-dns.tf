# Private DNS Zone: Blob Storage
resource "azapi_resource" "dns_zone_blob" {
  type      = "Microsoft.Network/privateDnsZones@2024-06-01"
  name      = local.dns_zone_blob_name
  parent_id = data.azurerm_resource_group.main.id
  location  = "global"

  body = {
    tags = merge(local.common_tags, {
      Purpose = "Private DNS for Blob Storage"
    })
  }
}

# Link Blob DNS Zone to VNET
resource "azapi_resource" "dns_link_blob" {
  type      = "Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01"
  name      = "blob-vnet-link"
  parent_id = azapi_resource.dns_zone_blob.id
  location  = "global"

  body = {
    properties = {
      virtualNetwork = {
        id = azapi_resource.vnet.id
      }
      registrationEnabled = false
    }
    tags = local.common_tags
  }
}

# Private DNS Zone: Key Vault
resource "azapi_resource" "dns_zone_keyvault" {
  type      = "Microsoft.Network/privateDnsZones@2024-06-01"
  name      = local.dns_zone_keyvault_name
  parent_id = data.azurerm_resource_group.main.id
  location  = "global"

  body = {
    tags = merge(local.common_tags, {
      Purpose = "Private DNS for Key Vault"
    })
  }
}

# Link Key Vault DNS Zone to VNET
resource "azapi_resource" "dns_link_keyvault" {
  type      = "Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01"
  name      = "keyvault-vnet-link"
  parent_id = azapi_resource.dns_zone_keyvault.id
  location  = "global"

  body = {
    properties = {
      virtualNetwork = {
        id = azapi_resource.vnet.id
      }
      registrationEnabled = false
    }
    tags = local.common_tags
  }
}

# Private DNS Zone: Azure SQL
resource "azapi_resource" "dns_zone_sql" {
  type      = "Microsoft.Network/privateDnsZones@2024-06-01"
  name      = local.dns_zone_sql_name
  parent_id = data.azurerm_resource_group.main.id
  location  = "global"

  body = {
    tags = merge(local.common_tags, {
      Purpose = "Private DNS for Azure SQL"
    })
  }
}

# Link SQL DNS Zone to VNET
resource "azapi_resource" "dns_link_sql" {
  type      = "Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01"
  name      = "sql-vnet-link"
  parent_id = azapi_resource.dns_zone_sql.id
  location  = "global"

  body = {
    properties = {
      virtualNetwork = {
        id = azapi_resource.vnet.id
      }
      registrationEnabled = false
    }
    tags = local.common_tags
  }
}

# Private DNS Zone: Cosmos DB
resource "azapi_resource" "dns_zone_cosmos" {
  type      = "Microsoft.Network/privateDnsZones@2024-06-01"
  name      = local.dns_zone_cosmos_name
  parent_id = data.azurerm_resource_group.main.id
  location  = "global"

  body = {
    tags = merge(local.common_tags, {
      Purpose = "Private DNS for Cosmos DB"
    })
  }
}

# Link Cosmos DB DNS Zone to VNET
resource "azapi_resource" "dns_link_cosmos" {
  type      = "Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01"
  name      = "cosmos-vnet-link"
  parent_id = azapi_resource.dns_zone_cosmos.id
  location  = "global"

  body = {
    properties = {
      virtualNetwork = {
        id = azapi_resource.vnet.id
      }
      registrationEnabled = false
    }
    tags = local.common_tags
  }
}

# Private DNS Zone: Azure OpenAI
resource "azapi_resource" "dns_zone_openai" {
  type      = "Microsoft.Network/privateDnsZones@2024-06-01"
  name      = local.dns_zone_openai_name
  parent_id = data.azurerm_resource_group.main.id
  location  = "global"

  body = {
    tags = merge(local.common_tags, {
      Purpose = "Private DNS for Azure OpenAI"
    })
  }
}

# Link OpenAI DNS Zone to VNET
resource "azapi_resource" "dns_link_openai" {
  type      = "Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01"
  name      = "openai-vnet-link"
  parent_id = azapi_resource.dns_zone_openai.id
  location  = "global"

  body = {
    properties = {
      virtualNetwork = {
        id = azapi_resource.vnet.id
      }
      registrationEnabled = false
    }
    tags = local.common_tags
  }
}

# Private DNS Zone: AI Search
resource "azapi_resource" "dns_zone_search" {
  type      = "Microsoft.Network/privateDnsZones@2024-06-01"
  name      = local.dns_zone_search_name
  parent_id = data.azurerm_resource_group.main.id
  location  = "global"

  body = {
    tags = merge(local.common_tags, {
      Purpose = "Private DNS for AI Search"
    })
  }
}

# Link AI Search DNS Zone to VNET
resource "azapi_resource" "dns_link_search" {
  type      = "Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01"
  name      = "search-vnet-link"
  parent_id = azapi_resource.dns_zone_search.id
  location  = "global"

  body = {
    properties = {
      virtualNetwork = {
        id = azapi_resource.vnet.id
      }
      registrationEnabled = false
    }
    tags = local.common_tags
  }
}