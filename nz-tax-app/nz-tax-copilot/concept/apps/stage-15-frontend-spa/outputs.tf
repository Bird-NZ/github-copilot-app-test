# Frontend Container App outputs

output "frontend_fqdn" {
  description = "Frontend Container App FQDN"
  value       = jsondecode(azapi_resource.frontend.output).properties.configuration.ingress.fqdn
}

output "frontend_url" {
  description = "Frontend public URL"
  value       = "https://${jsondecode(azapi_resource.frontend.output).properties.configuration.ingress.fqdn}"
}

output "frontend_identity_principal_id" {
  description = "Frontend managed identity principal ID"
  value       = azapi_resource.frontend.identity.principal_id
}

output "frontend_identity_client_id" {
  description = "Frontend managed identity client ID"
  value       = azapi_resource.frontend.identity.client_id
}

output "frontend_container_app_id" {
  description = "Frontend Container App resource ID"
  value       = azapi_resource.frontend.id
}

output "frontend_container_app_name" {
  description = "Frontend Container App name"
  value       = azapi_resource.frontend.name
}