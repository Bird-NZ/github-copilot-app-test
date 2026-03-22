output "cosmos_account_id" {
  description = "Cosmos DB account resource ID"
  value       = azapi_resource.cosmos_account.id
}

output "cosmos_account_name" {
  description = "Cosmos DB account name"
  value       = local.cosmos_account_name
}

output "cosmos_account_endpoint" {
  description = "Cosmos DB account endpoint URL"
  value       = jsondecode(azapi_resource.cosmos_account.output).properties.documentEndpoint
}

output "cosmos_database_id" {
  description = "Cosmos DB database resource ID"
  value       = azapi_resource.cosmos_database.id
}

output "cosmos_database_name" {
  description = "Cosmos DB database name"
  value       = local.database_name
}

output "workspaces_container_id" {
  description = "Workspaces container resource ID"
  value       = azapi_resource.workspaces_container.id
}

output "workspaces_container_name" {
  description = "Workspaces container name"
  value       = local.workspaces_container_name
}

output "questionnaire_container_id" {
  description = "Questionnaire responses container resource ID"
  value       = azapi_resource.questionnaire_container.id
}

output "questionnaire_container_name" {
  description = "Questionnaire responses container name"
  value       = local.questionnaire_responses_container_name
}

output "guidance_history_container_id" {
  description = "Guidance history container resource ID"
  value       = azapi_resource.guidance_history_container.id
}

output "guidance_history_container_name" {
  description = "Guidance history container name"
  value       = local.guidance_history_container_name
}

output "private_endpoint_id" {
  description = "Private endpoint resource ID"
  value       = azapi_resource.cosmos_private_endpoint.id
}

output "private_endpoint_ip" {
  description = "Private endpoint IP address"
  value       = jsondecode(azapi_resource.cosmos_private_endpoint.output).properties.customDnsConfigs[0].ipAddresses[0]
}

output "cosmos_account_connection_strings" {
  description = "NOTE: Local auth disabled, use managed identity instead. Connection strings not available."
  value       = "local_auth_disabled_use_managed_identity"
  sensitive   = true
}