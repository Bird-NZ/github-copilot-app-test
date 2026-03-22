# AI Search Service Outputs
output "search_service_id" {
  description = "AI Search service resource ID"
  value       = azapi_resource.search.id
}

output "search_service_name" {
  description = "AI Search service name"
  value       = local.search_service_name
}

output "search_service_endpoint" {
  description = "AI Search service endpoint URL"
  value       = "https://${local.search_service_name}.search.windows.net"
}

output "search_service_identity_principal_id" {
  description = "AI Search managed identity principal ID"
  value       = jsondecode(azapi_resource.search.output).identity.principalId
}

output "search_service_identity_tenant_id" {
  description = "AI Search managed identity tenant ID"
  value       = jsondecode(azapi_resource.search.output).identity.tenantId
}

# Private Endpoint Outputs
output "private_endpoint_id" {
  description = "AI Search private endpoint resource ID"
  value       = azapi_resource.private_endpoint.id
}

output "private_endpoint_name" {
  description = "AI Search private endpoint name"
  value       = local.private_endpoint_name
}

# Pass-through outputs from dependent stages (for verification)
output "stage7_storage_account_id" {
  description = "Pass-through: Storage account ID from Stage 7"
  value       = data.terraform_remote_state.stage7.outputs.storage_account_id
}

output "stage8_openai_account_id" {
  description = "Pass-through: OpenAI account ID from Stage 8"
  value       = data.terraform_remote_state.stage8.outputs.openai_account_id
}

# Index creation guidance (manual step)
output "index_creation_command" {
  description = "Command to create the ird-guidance index (run after deployment)"
  value       = "az search index create --service-name ${local.search_service_name} --name ird-guidance --fields @index-schema.json"
}