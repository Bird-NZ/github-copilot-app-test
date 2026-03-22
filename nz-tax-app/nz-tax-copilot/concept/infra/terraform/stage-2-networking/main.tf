# Reference Stage 1 resources
data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

# Virtual Network
resource "azapi_resource" "vnet" {
  type      = "Microsoft.Network/virtualNetworks@2025-03-01"
  name      = local.vnet_name
  parent_id = data.azurerm_resource_group.main.id
  location  = var.location

  body = {
    properties = {
      addressSpace = {
        addressPrefixes = var.vnet_address_space
      }
      dhcpOptions = {
        dnsServers = [] # Use Azure default DNS
      }
    }
    tags = local.common_tags
  }
}

# Subnet: Apps (Container Apps Environment)
resource "azapi_resource" "subnet_apps" {
  type      = "Microsoft.Network/virtualNetworks/subnets@2025-03-01"
  name      = local.subnet_apps_name
  parent_id = azapi_resource.vnet.id

  body = {
    properties = {
      addressPrefixes = var.subnet_apps_address_prefix
      serviceEndpoints = [
        {
          service = "Microsoft.KeyVault"
        },
        {
          service = "Microsoft.Storage"
        },
        {
          service = "Microsoft.Sql"
        }
      ]
      delegations = [
        {
          name = "container-apps-delegation"
          properties = {
            serviceName = "Microsoft.App/environments"
          }
        }
      ]
      privateEndpointNetworkPolicies    = "Enabled"
      privateLinkServiceNetworkPolicies = "Enabled"
    }
  }

  depends_on = [azapi_resource.vnet]
}

# Subnet: Data (Private endpoints for data services)
resource "azapi_resource" "subnet_data" {
  type      = "Microsoft.Network/virtualNetworks/subnets@2025-03-01"
  name      = local.subnet_data_name
  parent_id = azapi_resource.vnet.id

  body = {
    properties = {
      addressPrefixes                   = var.subnet_data_address_prefix
      privateEndpointNetworkPolicies    = "Disabled" # Required for private endpoints
      privateLinkServiceNetworkPolicies = "Enabled"
    }
  }

  depends_on = [
    azapi_resource.vnet,
    azapi_resource.subnet_apps
  ]
}

# Subnet: AI (Private endpoints for AI services)
resource "azapi_resource" "subnet_ai" {
  type      = "Microsoft.Network/virtualNetworks/subnets@2025-03-01"
  name      = local.subnet_ai_name
  parent_id = azapi_resource.vnet.id

  body = {
    properties = {
      addressPrefixes                   = var.subnet_ai_address_prefix
      privateEndpointNetworkPolicies    = "Disabled" # Required for private endpoints
      privateLinkServiceNetworkPolicies = "Enabled"
    }
  }

  depends_on = [
    azapi_resource.vnet,
    azapi_resource.subnet_apps,
    azapi_resource.subnet_data
  ]
}

# Subnet: Management (Bastion and monitoring)
resource "azapi_resource" "subnet_mgmt" {
  type      = "Microsoft.Network/virtualNetworks/subnets@2025-03-01"
  name      = local.subnet_mgmt_name
  parent_id = azapi_resource.vnet.id

  body = {
    properties = {
      addressPrefixes                   = var.subnet_mgmt_address_prefix
      privateEndpointNetworkPolicies    = "Enabled"
      privateLinkServiceNetworkPolicies = "Enabled"
    }
  }

  depends_on = [
    azapi_resource.vnet,
    azapi_resource.subnet_apps,
    azapi_resource.subnet_data,
    azapi_resource.subnet_ai
  ]
}