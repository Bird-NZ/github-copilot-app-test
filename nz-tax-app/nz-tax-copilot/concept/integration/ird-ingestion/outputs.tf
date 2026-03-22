output "ingestion_script_path" {
  description = "Path to IRD guidance ingestion script"
  value       = "${path.module}/${local.ingestion_script_name}"
}

output "ingestion_config_path" {
  description = "Path to ingestion configuration file"
  value       = "${path.module}/ingestion_config.json"
}

output "requirements_path" {
  description = "Path to Python requirements file"
  value       = "${path.module}/${local.requirements_file}"
}

output "search_service_name" {
  description = "AI Search service name for ingestion"
  value       = var.search_service_name
}

output "search_index_name" {
  description = "AI Search index name for ingestion"
  value       = var.search_index_name
}

output "managed_identity_client_id" {
  description = "Managed identity client ID for authentication"
  value       = var.managed_identity_client_id
}

output "ingestion_command" {
  description = "Command to run IRD guidance ingestion"
  value       = "python ${local.ingestion_script_name} --documents-path ${var.ird_guidance_documents_path}"
}

output "readme_path" {
  description = "Path to README with ingestion instructions"
  value       = "${path.module}/README.md"
}