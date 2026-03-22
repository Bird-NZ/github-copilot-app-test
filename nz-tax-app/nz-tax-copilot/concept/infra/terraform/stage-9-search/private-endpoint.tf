# Private endpoint for AI Search
resource "azapi_resource" "private_endpoint" {
  type      = "Microsoft.Network/privateEndpoints@2025-06-01"
  name      = local.private_endpoint_name
  parent_id = data.azapi_resource.rg.id
  location  = var.location

  body = {
    properties = {
      subnet = {
        id = data.azapi_resource.subnet_ai.id
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

  schema_validation_enabled = false
  ignore_missing_property   = true

  depends_on = [azapi_resource.search]
}

# Private DNS zone group for automatic A record creation
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
            privateDnsZoneId = data.azapi_resource.private_dns_zone_search.id
          }
        }
      ]
    }
  }

  schema_validation_enabled = false
  ignore_missing_property   = true

  depends_on = [azapi_resource.private_endpoint]
}