output "openai_account_id" {
  description = "Azure OpenAI account resource ID"
  value       = azapi_resource.openai.id
}

output "openai_account_name" {
  description = "Azure OpenAI account name"
  value       = local.openai_account_name
}

output "openai_endpoint" {
  description = "Azure OpenAI endpoint URL"
  value       = jsondecode(azapi_resource.openai.output).properties.endpoint
}

output "gpt4o_deployment_name" {
  description = "GPT-4o model deployment name"
  value       = azapi_resource.gpt4o_deployment.name
}

output "embeddings_deployment_name" {
  description = "Text embedding model deployment name"
  value       = azapi_resource.embeddings_deployment.name
}

output "private_endpoint_id" {
  description = "Private endpoint resource ID"
  value       = azapi_resource.private_endpoint.id
}

output "private_endpoint_ip" {
  description = "Private endpoint IP address"
  value       = try(jsondecode(azapi_resource.private_endpoint.output).properties.customDnsConfigs[0].ipAddresses[0], null)
}