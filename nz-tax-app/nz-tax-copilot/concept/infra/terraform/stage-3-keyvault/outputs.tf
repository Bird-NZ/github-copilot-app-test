# Key Vault Outputs
output "key_vault_id" {
  description = "Resource ID of the Key Vault"
  value       = azapi_resource.key_vault.id
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = local.key_vault_name
}

output "key_vault_uri" {
  description = "URI of the Key Vault (for Key Vault references)"
  value       = try(azapi_resource.key_vault.output.properties.vaultUri, azapi_resource.key_vault.output.vaultUri, null)
}

# Private Endpoint Outputs
output "private_endpoint_id" {
  description = "Resource ID of the Key Vault private endpoint"
  value       = azapi_resource.key_vault_private_endpoint.id
}

output "private_endpoint_ip" {
  description = "Private IP address of the Key Vault private endpoint"
  value       = try(
    azapi_resource.key_vault_private_endpoint.output.properties.customDnsConfigs[0].ipAddresses[0],
    null
  )
}

# Role Assignment Output
output "rbac_role_assignment_id" {
  description = "Resource ID of the Key Vault Secrets User role assignment"
  value       = azapi_resource.kv_secrets_user_role.id
}

# Diagnostic Settings Output
output "diagnostic_settings_id" {
  description = "Resource ID of the Key Vault diagnostic settings"
  value       = azapi_resource.kv_diagnostic_settings.id
}