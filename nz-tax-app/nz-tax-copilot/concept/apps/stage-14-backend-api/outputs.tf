output "container_app_name" {
  value       = azurerm_container_app.api.name
  description = "Name of the backend API Container App"
}

output "container_app_id" {
  value       = azurerm_container_app.api.id
  description = "Resource ID of the backend API Container App"
}

output "container_app_fqdn" {
  value       = azurerm_container_app.api.latest_revision_fqdn
  description = "FQDN of the latest Container App revision"
}

output "api_url" {
  value       = "https://${azurerm_container_app.api.latest_revision_fqdn}"
  description = "Public URL of the backend API (HTTPS)"
}

output "container_app_identity_principal_id" {
  value       = azurerm_container_app.api.identity[0].principal_id
  description = "Principal ID of Container App system-assigned managed identity"
}

output "container_app_identity_tenant_id" {
  value       = azurerm_container_app.api.identity[0].tenant_id
  description = "Tenant ID of Container App system-assigned managed identity"
}