output "storage_account_id" {
  description = "Storage account resource ID"
  value       = azapi_resource.storage.id
}

output "storage_account_name" {
  description = "Storage account name"
  value       = local.storage_account_name
}

output "storage_blob_endpoint" {
  description = "Primary blob endpoint URL"
  value       = jsondecode(azapi_resource.storage.output).properties.primaryEndpoints.blob
}

output "container_documents_name" {
  description = "Tax documents container name"
  value       = "tax-documents"
}

output "container_exports_name" {
  description = "Export output container name"
  value       = "export-output"
}

output "private_endpoint_id" {
  description = "Private endpoint resource ID"
  value       = azapi_resource.private_endpoint.id
}

output "private_endpoint_ip" {
  description = "Private endpoint IP address"
  value       = try(jsondecode(azapi_resource.private_endpoint.output).properties.customDnsConfigs[0].ipAddresses[0], null)
}

output "managed_identity_id" {
  description = "User-assigned managed identity resource ID for storage access"
  value       = azapi_resource.identity.id
}

output "managed_identity_client_id" {
  description = "Client ID of the managed identity"
  value       = jsondecode(azapi_resource.identity.output).properties.clientId
}

output "managed_identity_principal_id" {
  description = "Principal ID of the managed identity"
  value       = jsondecode(azapi_resource.identity.output).properties.principalId
}