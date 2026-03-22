locals {
  region_short = "aue"  # australiaeast abbreviation

  # Networking resource names
  vnet_name = "${var.zone_id}-vnet-${var.project}-${var.environment}-${local.region_short}"

  subnet_apps_name = "snet-apps"
  subnet_data_name = "snet-data"
  subnet_ai_name   = "snet-ai"
  subnet_mgmt_name = "snet-mgmt"

  nsg_apps_name = "nsg-apps"
  nsg_data_name = "nsg-data"
  nsg_ai_name   = "nsg-ai"

  # Private DNS zone names (standard Azure private link zones)
  dns_zone_blob_name     = "privatelink.blob.core.windows.net"
  dns_zone_keyvault_name = "privatelink.vaultcore.azure.net"
  dns_zone_sql_name      = "privatelink.database.windows.net"
  dns_zone_cosmos_name   = "privatelink.documents.azure.com"
  dns_zone_openai_name   = "privatelink.openai.azure.com"
  dns_zone_search_name   = "privatelink.search.windows.net"

  # Common tags
  common_tags = merge(var.tags, {
    Stage = "networking"
    Zone  = var.zone_id
  })
}