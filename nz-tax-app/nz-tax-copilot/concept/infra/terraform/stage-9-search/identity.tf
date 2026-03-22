# RBAC Role Assignment: AI Search → Storage Blob Data Reader (for indexer data source)
resource "azapi_resource" "role_search_to_storage" {
  type      = "Microsoft.Authorization/roleAssignments@2025-06-01"
  name      = local.role_assignment_search_to_storage_name
  parent_id = data.terraform_remote_state.stage7.outputs.storage_account_id

  body = {
    properties = {
      roleDefinitionId = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/2a2b9908-6ea1-4ae2-8e65-a410df84e7d1"
      principalId      = jsondecode(azapi_resource.search.output).identity.principalId
      principalType    = "ServicePrincipal"
    }
  }

  depends_on = [azapi_resource.search]
}

# RBAC Role Assignment: AI Search → Cognitive Services OpenAI User (for skillset enrichment)
resource "azapi_resource" "role_search_to_openai" {
  type      = "Microsoft.Authorization/roleAssignments@2025-06-01"
  name      = local.role_assignment_search_to_openai_name
  parent_id = data.terraform_remote_state.stage8.outputs.openai_account_id

  body = {
    properties = {
      roleDefinitionId = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/providers/Microsoft.Authorization/roleDefinitions/5e0bd9bd-7b93-4f28-af87-19fc36ad61bd"
      principalId      = jsondecode(azapi_resource.search.output).identity.principalId
      principalType    = "ServicePrincipal"
    }
  }

  depends_on = [azapi_resource.search]
}

# Data source for current Azure subscription
data "azurerm_client_config" "current" {}