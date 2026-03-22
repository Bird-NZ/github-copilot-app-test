# Store Cosmos DB endpoint in Key Vault for application configuration
resource "azapi_resource" "cosmos_endpoint_secret" {
  type      = "Microsoft.KeyVault/vaults/secrets@2023-07-01"
  name      = "cosmos-endpoint"
  parent_id = data.azapi_resource.key_vault.id

  body = {
    properties = {
      value = jsondecode(azapi_resource.cosmos_account.output).properties.documentEndpoint
    }
  }

  depends_on = [azapi_resource.cosmos_account]
}

# Store Cosmos DB database name in Key Vault
resource "azapi_resource" "cosmos_database_secret" {
  type      = "Microsoft.KeyVault/vaults/secrets@2023-07-01"
  name      = "cosmos-database"
  parent_id = data.azapi_resource.key_vault.id

  body = {
    properties = {
      value = local.database_name
    }
  }

  depends_on = [azapi_resource.cosmos_database]
}