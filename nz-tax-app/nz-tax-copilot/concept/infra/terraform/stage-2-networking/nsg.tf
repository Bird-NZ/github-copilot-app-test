# Network Security Group: Apps Subnet
resource "azapi_resource" "nsg_apps" {
  type      = "Microsoft.Network/networkSecurityGroups@2025-03-01"
  name      = local.nsg_apps_name
  parent_id = data.azurerm_resource_group.main.id
  location  = var.location

  body = {
    properties = {
      securityRules = [
        {
          name = "AllowHttpsInbound"
          properties = {
            description              = "Allow HTTPS from Internet for user-facing API"
            protocol                 = "Tcp"
            sourcePortRange          = "*"
            destinationPortRange     = "443"
            sourceAddressPrefix      = "Internet"
            destinationAddressPrefix = "10.0.2.0/23"
            access                   = "Allow"
            priority                 = 100
            direction                = "Inbound"
          }
        },
        {
          name = "AllowHttpInbound"
          properties = {
            description              = "Allow HTTP from Internet (redirect to HTTPS)"
            protocol                 = "Tcp"
            sourcePortRange          = "*"
            destinationPortRange     = "80"
            sourceAddressPrefix      = "Internet"
            destinationAddressPrefix = "10.0.2.0/23"
            access                   = "Allow"
            priority                 = 110
            direction                = "Inbound"
          }
        },
        {
          name = "AllowDataSubnetOutbound"
          properties = {
            description              = "Allow HTTPS to Data Subnet (private endpoints)"
            protocol                 = "Tcp"
            sourcePortRange          = "*"
            destinationPortRange     = "443"
            sourceAddressPrefix      = "10.0.2.0/23"
            destinationAddressPrefix = "10.0.4.0/24"
            access                   = "Allow"
            priority                 = 100
            direction                = "Outbound"
          }
        },
        {
          name = "AllowAiSubnetOutbound"
          properties = {
            description              = "Allow HTTPS to AI Subnet (OpenAI, AI Search)"
            protocol                 = "Tcp"
            sourcePortRange          = "*"
            destinationPortRange     = "443"
            sourceAddressPrefix      = "10.0.2.0/23"
            destinationAddressPrefix = "10.0.5.0/25"
            access                   = "Allow"
            priority                 = 110
            direction                = "Outbound"
          }
        },
        {
          name = "AllowDnsOutbound"
          properties = {
            description              = "Allow DNS queries to Azure DNS"
            protocol                 = "Udp"
            sourcePortRange          = "*"
            destinationPortRange     = "53"
            sourceAddressPrefix      = "10.0.2.0/23"
            destinationAddressPrefix = "AzureCloud"
            access                   = "Allow"
            priority                 = 120
            direction                = "Outbound"
          }
        }
      ]
    }
    tags = merge(local.common_tags, {
      Purpose = "Apps subnet network security"
    })
  }
}

# NSG: Data Subnet
resource "azapi_resource" "nsg_data" {
  type      = "Microsoft.Network/networkSecurityGroups@2025-03-01"
  name      = local.nsg_data_name
  parent_id = data.azurerm_resource_group.main.id
  location  = var.location

  body = {
    properties = {
      securityRules = [
        {
          name = "AllowAppsSubnetInbound"
          properties = {
            description              = "Allow HTTPS from Apps Subnet"
            protocol                 = "Tcp"
            sourcePortRange          = "*"
            destinationPortRange     = "443"
            sourceAddressPrefix      = "10.0.2.0/23"
            destinationAddressPrefix = "10.0.4.0/24"
            access                   = "Allow"
            priority                 = 100
            direction                = "Inbound"
          }
        },
        {
          name = "AllowSqlInbound"
          properties = {
            description              = "Allow SQL port from Apps Subnet"
            protocol                 = "Tcp"
            sourcePortRange          = "*"
            destinationPortRange     = "1433"
            sourceAddressPrefix      = "10.0.2.0/23"
            destinationAddressPrefix = "10.0.4.0/24"
            access                   = "Allow"
            priority                 = 110
            direction                = "Inbound"
          }
        },
        {
          name = "DenyAllOutbound"
          properties = {
            description              = "Deny all outbound (private endpoints are ingress-only)"
            protocol                 = "*"
            sourcePortRange          = "*"
            destinationPortRange     = "*"
            sourceAddressPrefix      = "10.0.4.0/24"
            destinationAddressPrefix = "*"
            access                   = "Deny"
            priority                 = 4096
            direction                = "Outbound"
          }
        }
      ]
    }
    tags = merge(local.common_tags, {
      Purpose = "Data subnet network security"
    })
  }
}

# NSG: AI Subnet
resource "azapi_resource" "nsg_ai" {
  type      = "Microsoft.Network/networkSecurityGroups@2025-03-01"
  name      = local.nsg_ai_name
  parent_id = data.azurerm_resource_group.main.id
  location  = var.location

  body = {
    properties = {
      securityRules = [
        {
          name = "AllowAppsSubnetInbound"
          properties = {
            description              = "Allow HTTPS from Apps Subnet"
            protocol                 = "Tcp"
            sourcePortRange          = "*"
            destinationPortRange     = "443"
            sourceAddressPrefix      = "10.0.2.0/23"
            destinationAddressPrefix = "10.0.5.0/25"
            access                   = "Allow"
            priority                 = 100
            direction                = "Inbound"
          }
        },
        {
          name = "DenyAllOutbound"
          properties = {
            description              = "Deny all outbound (private endpoints are ingress-only)"
            protocol                 = "*"
            sourcePortRange          = "*"
            destinationPortRange     = "*"
            sourceAddressPrefix      = "10.0.5.0/25"
            destinationAddressPrefix = "*"
            access                   = "Deny"
            priority                 = 4096
            direction                = "Outbound"
          }
        }
      ]
    }
    tags = merge(local.common_tags, {
      Purpose = "AI subnet network security"
    })
  }
}

# Associate NSG with Apps Subnet
resource "azapi_update_resource" "subnet_apps_nsg" {
  type        = "Microsoft.Network/virtualNetworks/subnets@2025-03-01"
  resource_id = azapi_resource.subnet_apps.id

  body = {
    properties = {
      networkSecurityGroup = {
        id = azapi_resource.nsg_apps.id
      }
    }
  }

  depends_on = [
    azapi_resource.subnet_apps,
    azapi_resource.nsg_apps
  ]
}

# Associate NSG with Data Subnet
resource "azapi_update_resource" "subnet_data_nsg" {
  type        = "Microsoft.Network/virtualNetworks/subnets@2025-03-01"
  resource_id = azapi_resource.subnet_data.id

  body = {
    properties = {
      networkSecurityGroup = {
        id = azapi_resource.nsg_data.id
      }
    }
  }

  depends_on = [
    azapi_resource.subnet_data,
    azapi_resource.nsg_data
  ]
}

# Associate NSG with AI Subnet
resource "azapi_update_resource" "subnet_ai_nsg" {
  type        = "Microsoft.Network/virtualNetworks/subnets@2025-03-01"
  resource_id = azapi_resource.subnet_ai.id

  body = {
    properties = {
      networkSecurityGroup = {
        id = azapi_resource.nsg_ai.id
      }
    }
  }

  depends_on = [
    azapi_resource.subnet_ai,
    azapi_resource.nsg_ai
  ]
}