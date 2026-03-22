locals {
  # Naming convention: microsoft-alz pattern with zone ID zd
  region_short          = "aue"
  zone_id               = "zd"
  
  search_service_name   = "${local.zone_id}-search-${var.project}-${var.environment}-${local.region_short}"
  private_endpoint_name = "pe-search-${var.project}-${var.environment}-${local.region_short}"
  
  # Role assignment names (must be GUIDs)
  role_assignment_search_to_storage_name = "${substr(md5("${azapi_resource.search.id}-storage-blob-reader"), 0, 8)}-${substr(md5("${azapi_resource.search.id}-storage-blob-reader"), 8, 4)}-${substr(md5("${azapi_resource.search.id}-storage-blob-reader"), 12, 4)}-${substr(md5("${azapi_resource.search.id}-storage-blob-reader"), 16, 4)}-${substr(md5("${azapi_resource.search.id}-storage-blob-reader"), 20, 12)}"
  role_assignment_search_to_openai_name  = "${substr(md5("${azapi_resource.search.id}-openai-user"), 0, 8)}-${substr(md5("${azapi_resource.search.id}-openai-user"), 8, 4)}-${substr(md5("${azapi_resource.search.id}-openai-user"), 12, 4)}-${substr(md5("${azapi_resource.search.id}-openai-user"), 16, 4)}-${substr(md5("${azapi_resource.search.id}-openai-user"), 20, 12)}"
  
  # Common tags
  common_tags = merge(
    {
      Environment = var.environment
      Purpose     = "prototype"
      Project     = "nz-tax-copilot"
      Zone        = local.zone_id
      Stage       = "ai-search"
      ManagedBy   = "terraform"
    },
    var.tags
  )
}