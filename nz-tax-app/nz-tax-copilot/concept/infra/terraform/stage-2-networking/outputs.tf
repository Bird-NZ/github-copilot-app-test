# Virtual Network outputs
output "vnet_id" {
  description = "Virtual Network resource ID"
  value       = azapi_resource.vnet.id
}

output "vnet_name" {
  description = "Virtual Network name"
  value       = azapi_resource.vnet.name
}

output "vnet_address_space" {
  description = "Virtual Network address space"
  value       = var.vnet_address_space
}

# Subnet outputs
output "subnet_apps_id" {
  description = "Apps subnet resource ID (for Container Apps Environment)"
  value       = azapi_resource.subnet_apps.id
}

output "subnet_apps_name" {
  description = "Apps subnet name"
  value       = azapi_resource.subnet_apps.name
}

output "subnet_data_id" {
  description = "Data subnet resource ID (for private endpoints: Cosmos DB, SQL, Storage, Key Vault)"
  value       = azapi_resource.subnet_data.id
}

output "subnet_data_name" {
  description = "Data subnet name"
  value       = azapi_resource.subnet_data.name
}

output "subnet_ai_id" {
  description = "AI subnet resource ID (for private endpoints: Azure OpenAI, AI Search)"
  value       = azapi_resource.subnet_ai.id
}

output "subnet_ai_name" {
  description = "AI subnet name"
  value       = azapi_resource.subnet_ai.name
}

output "subnet_mgmt_id" {
  description = "Management subnet resource ID (for Bastion and monitoring)"
  value       = azapi_resource.subnet_mgmt.id
}

output "subnet_mgmt_name" {
  description = "Management subnet name"
  value       = azapi_resource.subnet_mgmt.name
}

# NSG outputs
output "nsg_apps_id" {
  description = "Apps subnet NSG resource ID"
  value       = azapi_resource.nsg_apps.id
}

output "nsg_data_id" {
  description = "Data subnet NSG resource ID"
  value       = azapi_resource.nsg_data.id
}

output "nsg_ai_id" {
  description = "AI subnet NSG resource ID"
  value       = azapi_resource.nsg_ai.id
}

# Private DNS Zone outputs
output "dns_zone_blob_id" {
  description = "Blob Storage private DNS zone resource ID"
  value       = azapi_resource.dns_zone_blob.id
}

output "dns_zone_blob_name" {
  description = "Blob Storage private DNS zone name"
  value       = azapi_resource.dns_zone_blob.name
}

output "dns_zone_keyvault_id" {
  description = "Key Vault private DNS zone resource ID"
  value       = azapi_resource.dns_zone_keyvault.id
}

output "dns_zone_keyvault_name" {
  description = "Key Vault private DNS zone name"
  value       = azapi_resource.dns_zone_keyvault.name
}

output "dns_zone_sql_id" {
  description = "Azure SQL private DNS zone resource ID"
  value       = azapi_resource.dns_zone_sql.id
}

output "dns_zone_sql_name" {
  description = "Azure SQL private DNS zone name"
  value       = azapi_resource.dns_zone_sql.name
}

output "dns_zone_cosmos_id" {
  description = "Cosmos DB private DNS zone resource ID"
  value       = azapi_resource.dns_zone_cosmos.id
}

output "dns_zone_cosmos_name" {
  description = "Cosmos DB private DNS zone name"
  value       = azapi_resource.dns_zone_cosmos.name
}

output "dns_zone_openai_id" {
  description = "Azure OpenAI private DNS zone resource ID"
  value       = azapi_resource.dns_zone_openai.id
}

output "dns_zone_openai_name" {
  description = "Azure OpenAI private DNS zone name"
  value       = azapi_resource.dns_zone_openai.name
}

output "dns_zone_search_id" {
  description = "AI Search private DNS zone resource ID"
  value       = azapi_resource.dns_zone_search.id
}

output "dns_zone_search_name" {
  description = "AI Search private DNS zone name"
  value       = azapi_resource.dns_zone_search.name
}