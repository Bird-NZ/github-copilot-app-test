# Private endpoint for Blob Storage
resource "azapi_resource" "private_endpoint" {
  type      = "Microsoft.Network/privateEndpoints@2025-06-01"
  name      = local.pe_name
  parent_id = data.azapi_resource.rg.id
  location  = var.location

  body = {
    properties = {
      subnet = {
        id = data.azapi_resource.subnet_data.id
      }
      privateLinkServiceConnections = [
        {
          name = "${local.pe_name}-connection"
          properties = {
            privateLinkServiceId = azapi_resource.storage.id
            groupIds             = ["blob"]
          }
        }
      ]
    }
    tags = local.common_tags
  }

  depends_on = [azapi_resource.storage]
}

# Private DNS Zone Group for private endpoint
resource "azapi_resource" "private_dns_zone_group" {
  type      = "Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-06-01"
  name      = "default"
  parent_id = azapi_resource.private_endpoint.id

  body = {
    properties = {
      privateDnsZoneConfigs = [
        {
          name = "blob-config"
          properties = {
            privateDnsZoneId = data.azapi_resource.private_dns_zone_blob.id
          }
        }
      ]
    }
  }

  depends_on = [azapi_resource.private_endpoint]
}