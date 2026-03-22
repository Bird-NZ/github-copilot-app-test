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
  value       = jsondecode(azapi_resource.acr.output).properties.loginServer
}

output "acr_identity_principal_id" {
  description = "Principal ID of ACR system-assigned managed identity"
  value       = jsondecode(azapi_resource.acr.output).identity.principalId
}

output "private_endpoint_ip" {
  description = "Private IP address of ACR private endpoint"
  value       = try(jsondecode(azapi_resource.pe_acr.output).properties.customDnsConfigs[0].ipAddresses[0], null)
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