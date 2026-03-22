# Reference Stage 1 outputs (Foundation)
data "terraform_remote_state" "stage1" {
  backend = "local"
  config = {
    path = var.stage1_state_key
  }
}

# Reference Stage 2 outputs (Networking)
data "terraform_remote_state" "stage2" {
  backend = "local"
  config = {
    path = var.stage2_state_key
  }
}

# Reference Stage 3 outputs (Key Vault)
data "terraform_remote_state" "stage3" {
  backend = "local"
  config = {
    path = var.stage3_state_key
  }
}

# Get current Azure client configuration
data "azurerm_client_config" "current" {}

# Reference resource group
data "azapi_resource" "rg" {
  type      = "Microsoft.Resources/resourceGroups@2021-04-01"
  name      = data.terraform_remote_state.stage1.outputs.resource_group_name
  parent_id = "/subscriptions/${data.azurerm_client_config.current.subscription_id}"
}

# Reference managed identity
data "azapi_resource" "managed_identity" {
  type        = "Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31"
  resource_id = data.terraform_remote_state.stage1.outputs.managed_identity_id
}

# Reference data subnet
data "azapi_resource" "data_subnet" {
  type        = "Microsoft.Network/virtualNetworks/subnets@2023-11-01"
  resource_id = data.terraform_remote_state.stage2.outputs.subnet_data_id
}

# Reference Cosmos DB private DNS zone
data "azapi_resource" "cosmos_dns_zone" {
  type        = "Microsoft.Network/privateDnsZones@2020-06-01"
  resource_id = data.terraform_remote_state.stage2.outputs.private_dns_zone_cosmos_id
}

# Reference Key Vault
data "azapi_resource" "key_vault" {
  type        = "Microsoft.KeyVault/vaults@2023-07-01"
  resource_id = data.terraform_remote_state.stage3.outputs.key_vault_id
}