output "app_service_plan_id" {
  description = "Resource ID of App Service Plan"
  value       = azapi_resource.app_service_plan.id
}

output "app_service_plan_name" {
  description = "Name of App Service Plan"
  value       = azapi_resource.app_service_plan.name
}

output "function_app_id" {
  description = "Resource ID of Function App"
  value       = azapi_resource.function_app.id
}

output "function_app_name" {
  description = "Name of Function App"
  value       = azapi_resource.function_app.name
}

output "function_app_hostname" {
  description = "Default hostname of Function App"
  value       = azapi_resource.function_app.output.properties.defaultHostName
}

output "function_app_url" {
  description = "Full HTTPS URL to Function App"
  value       = "https://${azapi_resource.function_app.output.properties.defaultHostName}"
}

output "managed_identity_principal_id" {
  description = "Principal ID of Function App's user-assigned managed identity"
  value       = data.terraform_remote_state.storage.outputs.managed_identity_principal_id
}

output "managed_identity_client_id" {
  description = "Client ID of Function App's user-assigned managed identity"
  value       = data.terraform_remote_state.storage.outputs.managed_identity_client_id
}