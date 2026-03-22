output "container_apps_environment_id" {
  description = "Container Apps Environment resource ID"
  value       = azapi_resource.container_apps_environment.id
}

output "container_apps_environment_name" {
  description = "Container Apps Environment name"
  value       = local.cae_name
}

output "container_apps_environment_default_domain" {
  description = "Default domain for Container Apps in this environment"
  value       = jsondecode(azapi_resource.container_apps_environment.output).properties.defaultDomain
}

output "container_apps_environment_static_ip" {
  description = "Static IP address of the Container Apps Environment (for NSG rules)"
  value       = jsondecode(azapi_resource.container_apps_environment.output).properties.staticIp
}