# Data sources for existing resources from prior stages
data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

data "azurerm_search_service" "search" {
  name                = var.search_service_name
  resource_group_name = data.azurerm_resource_group.main.name
}

# No Azure resources to deploy in this stage
# This stage provides the Python script for IRD guidance ingestion
# The script is executed manually or via CI/CD pipeline after Stage 13 (AI Search Index)