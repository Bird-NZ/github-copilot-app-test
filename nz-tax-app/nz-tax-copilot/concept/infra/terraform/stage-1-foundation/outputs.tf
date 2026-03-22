# Resource Group Outputs
output "resource_group_name" {
  description = "Name of the resource group"
  value       = azapi_resource.rg.name
}

output "resource_group_id" {
  description = "Resource ID of the resource group"
  value       = azapi_resource.rg.id
}

output "location" {
  description = "Azure region where resources are deployed"
  value       = var.location
}

# Managed Identity Outputs
output "managed_identity_name" {
  description = "Name of the user-assigned managed identity"
  value       = azapi_resource.managed_identity.name
}

output "managed_identity_id" {
  description = "Resource ID of the user-assigned managed identity"
  value       = azapi_resource.managed_identity.id
}

output "managed_identity_principal_id" {
  description = "Principal ID of the managed identity (for RBAC assignments)"
  value       = azapi_resource.managed_identity.output.properties.principalId
}

output "managed_identity_client_id" {
  description = "Client ID of the managed identity (for application configuration)"
  value       = azapi_resource.managed_identity.output.properties.clientId
}

# Log Analytics Workspace Outputs
output "log_analytics_workspace_name" {
  description = "Name of the Log Analytics workspace"
  value       = azapi_resource.log_analytics.name
}

output "log_analytics_workspace_id" {
  description = "Resource ID of the Log Analytics workspace"
  value       = azapi_resource.log_analytics.id
}

output "log_analytics_workspace_resource_id" {
  description = "Full Azure Resource Manager ID for diagnostic settings"
  value       = azapi_resource.log_analytics.id
}

# Application Insights Outputs
output "application_insights_name" {
  description = "Name of the Application Insights component"
  value       = azapi_resource.app_insights.name
}

output "application_insights_id" {
  description = "Resource ID of the Application Insights component"
  value       = azapi_resource.app_insights.id
}

output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azapi_resource.app_insights.output.properties.InstrumentationKey
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azapi_resource.app_insights.output.properties.ConnectionString
  sensitive   = true
}

# Common Values for Downstream Stages
output "zone_development" {
  description = "Zone ID for development resources"
  value       = local.zone_development
}

output "zone_platform" {
  description = "Zone ID for platform resources"
  value       = local.zone_platform
}

output "region_short" {
  description = "Short region code"
  value       = local.region_short
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "common_tags" {
  description = "Common tags applied to all resources"
  value       = local.common_tags
}