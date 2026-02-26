output "resource_group_name" {
  description = "Name of the resource group"
  value       = azapi_resource.rg.name
}

output "resource_group_id" {
  description = "Resource ID of the resource group"
  value       = azapi_resource.rg.id
}

output "location" {
  description = "Azure region for all resources"
  value       = var.location
}

output "log_analytics_workspace_id" {
  description = "Resource ID of Log Analytics workspace"
  value       = azapi_resource.log_analytics.id
}

output "log_analytics_workspace_name" {
  description = "Name of Log Analytics workspace"
  value       = azapi_resource.log_analytics.name
}

output "application_insights_id" {
  description = "Resource ID of Application Insights"
  value       = azapi_resource.app_insights.id
}

output "application_insights_name" {
  description = "Name of Application Insights"
  value       = azapi_resource.app_insights.name
}

output "application_insights_connection_string" {
  description = "Application Insights connection string for function app"
  value       = azapi_resource.app_insights.output.properties.ConnectionString
  sensitive   = true
}

output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azapi_resource.app_insights.output.properties.InstrumentationKey
  sensitive   = true
}

output "tags" {
  description = "Common tags for all resources"
  value       = local.common_tags
}