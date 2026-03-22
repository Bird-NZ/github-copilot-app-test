locals {
  region_short = "aue"
  
  common_tags = {
    Environment = var.environment
    Purpose     = "prototype"
    Project     = var.project_name
    Stage       = "integration"
    Zone        = var.zone_id
    ManagedBy   = "terraform"
  }
  
  # Script configuration
  ingestion_script_name = "ingest_ird_guidance.py"
  requirements_file     = "requirements.txt"
  config_file          = "ingestion_config.json"
  
  # Search index schema configuration
  chunk_size         = 1000  # Maximum tokens per chunk
  chunk_overlap      = 100   # Overlap between chunks
  max_chunks_per_doc = 500   # Safety limit
  
  # Supported IRD document types
  supported_extensions = [".pdf"]
  
  # Document categories
  document_categories = [
    "general",
    "crypto",
    "self-employment",
    "rental-income",
    "dividends",
    "interest",
    "overseas-income",
    "rebates"
  ]
}