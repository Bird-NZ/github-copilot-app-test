output "sql_server_id" {
  description = "SQL Server resource ID"
  value       = azapi_resource.sql_server.id
}

output "sql_server_name" {
  description = "SQL Server name"
  value       = azapi_resource.sql_server.name
}

output "sql_server_fqdn" {
  description = "SQL Server fully qualified domain name"
  value       = jsondecode(azapi_resource.sql_server.output).properties.fullyQualifiedDomainName
}

output "sql_database_id" {
  description = "SQL Database resource ID"
  value       = azapi_resource.sql_database.id
}

output "sql_database_name" {
  description = "SQL Database name"
  value       = azapi_resource.sql_database.name
}

output "private_endpoint_id" {
  description = "SQL Server private endpoint resource ID"
  value       = azapi_resource.private_endpoint.id
}

output "private_endpoint_ip" {
  description = "SQL Server private endpoint IP address"
  value       = jsondecode(azapi_resource.private_endpoint.output).properties.customDnsConfigs[0].ipAddresses[0]
}