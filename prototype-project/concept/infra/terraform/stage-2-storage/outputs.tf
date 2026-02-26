# Storage Account Outputs
output "storage_account_name" {
  description = "Name of storage account for function app configuration"
  value       = local.storage_account_name
}

output "storage_account_id" {
  description = "Resource ID of storage account"
  value       = azapi_resource.storage_account.id
}

output "storage_account_primary_endpoints" {
  description = "Primary endpoints for storage account services"
  value       = azapi_resource.storage_account.output.properties.primaryEndpoints
}

# Blob Container Outputs
output "storage_container_name" {
  description = "Name of blob container for function output"
  value       = local.container_name
}

output "storage_container_id" {
  description = "Resource ID of blob container"
  value       = azapi_resource.blob_container.id
}

# Managed Identity Outputs (CRITICAL for Stage 3)
output "managed_identity_id" {
  description = "Resource ID of user-assigned managed identity"
  value       = azapi_resource.user_identity.id
}

output "managed_identity_client_id" {
  description = "Client ID of managed identity for function app configuration (AZURE_CLIENT_ID)"
  value       = azapi_resource.user_identity.output.properties.clientId
}

output "managed_identity_principal_id" {
  description = "Principal ID of managed identity for RBAC assignments"
  value       = azapi_resource.user_identity.output.properties.principalId
}

output "managed_identity_tenant_id" {
  description = "Tenant ID of managed identity"
  value       = azapi_resource.user_identity.output.properties.tenantId
}

# RBAC Role Assignment Output
output "role_assignment_id" {
  description = "Resource ID of Storage Blob Data Contributor role assignment"
  value       = azapi_resource.role_assignment.id
}