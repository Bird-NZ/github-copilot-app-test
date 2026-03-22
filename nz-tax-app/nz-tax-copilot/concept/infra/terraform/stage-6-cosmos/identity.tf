# Cosmos DB Built-in Data Contributor Role Definition (built-in role)
# Role ID: 00000000-0000-0000-0000-000000000002

# RBAC Role Assignment: Managed Identity -> Cosmos DB Data Contributor
resource "azapi_resource" "cosmos_role_assignment" {
  type      = "Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2025-06-01"
  name      = "${data.azapi_resource.managed_identity.id}-${azapi_resource.cosmos_account.id}"
  parent_id = azapi_resource.cosmos_account.id

  body = {
    properties = {
      roleDefinitionId = "${azapi_resource.cosmos_account.id}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
      principalId      = jsondecode(data.azapi_resource.managed_identity.output).properties.principalId
      scope            = azapi_resource.cosmos_account.id
    }
  }

  depends_on = [
    azapi_resource.cosmos_account,
    azapi_resource.workspaces_container,
    azapi_resource.questionnaire_container,
    azapi_resource.guidance_history_container
  ]
}