# Outputs for Stage 16: IRD Guidance Data Ingestion

output "script_path" {
  description = "Path to IRD guidance ingestion script"
  value       = "${path.module}/ingest_ird_guidance.py"
}

output "data_directory" {
  description = "Directory containing IRD guidance PDFs"
  value       = "../../../data/ird-guidance"
}

output "execution_command" {
  description = "Command to execute