# Container Registry Outputs
output "acr_id" {
  description = "Azure Container Registry resource ID"
  value       = azapi_resource.acr.id
}

output "acr_name" {
  description = "Azure Container Registry name"
  value       = azapi_resource.acr.name
}

output "acr_login_server" {
  description = "Azure Container Registry login server URL"
  value       = "${azapi_resource.acr.name}.azurecr.io"
}

output "acr_identity_principal_id" {
  description = "Principal ID of ACR system-assigned managed identity"
  value       = try(azapi_resource.acr.output.identity.principalId, null)
}

output "private_endpoint_ip" {
  description = "Private IP address of ACR private endpoint (not used in V1 path)"
  value       = null
}

# Stage metadata
output "stage_name" {
  description = "Deployment stage name"
  value       = "stage-10-acr"
}

output "deployment_timestamp" {
  description = "Timestamp of deployment"
  value       = timestamp()
}