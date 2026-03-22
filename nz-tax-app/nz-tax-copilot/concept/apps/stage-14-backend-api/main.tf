terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100.0"
    }
  }
  backend "azurerm" {
    key = "stage14-backend-api.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}

# Data sources from prior stages
data "terraform_remote_state" "stage1" {
  backend = "azurerm"
  config = {
    key = "stage1-foundation.tfstate"
  }
}

data "terraform_remote_state" "stage3" {
  backend = "azurerm"
  config = {
    key = "stage3-key-vault.tfstate"
  }
}

data "terraform_remote_state" "stage4" {
  backend = "azurerm"
  config = {
    key = "stage4-azure-ad-b2c.tfstate"
  }
}

data "terraform_remote_state" "stage5" {
  backend = "azurerm"
  config = {
    key = "stage5-sql-database.tfstate"
  }
}

data "terraform_remote_state" "stage6" {
  backend = "azurerm"
  config = {
    key = "stage6-cosmos-db.tfstate"
  }
}

data "terraform_remote_state" "stage7" {
  backend = "azurerm"
  config = {
    key = "stage7-blob-storage.tfstate"
  }
}

data "terraform_remote_state" "stage8" {
  backend = "azurerm"
  config = {
    key = "stage8-azure-openai.tfstate"
  }
}

data "terraform_remote_state" "stage9" {
  backend = "azurerm"
  config = {
    key = "stage9-ai-search.tfstate"
  }
}

data "terraform_remote_state" "stage10" {
  backend = "azurerm"
  config = {
    key = "stage10-container-registry.tfstate"
  }
}

data "terraform_remote_state" "stage11" {
  backend = "azurerm"
  config = {
    key = "stage11-container-apps-env.tfstate"
  }
}

locals {
  # Foundation outputs
  resource_group_name = data.terraform_remote_state.stage1.outputs.resource_group_name
  location            = data.terraform_remote_state.stage1.outputs.location
  managed_identity_id = data.terraform_remote_state.stage1.outputs.managed_identity_id
  managed_identity_principal_id = data.terraform_remote_state.stage1.outputs.managed_identity_principal_id
  managed_identity_client_id    = data.terraform_remote_state.stage1.outputs.managed_identity_client_id
  log_analytics_workspace_id    = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
  
  # Key Vault outputs
  key_vault_id   = data.terraform_remote_state.stage3.outputs.key_vault_id
  key_vault_name = data.terraform_remote_state.stage3.outputs.key_vault_name
  
  # Azure AD B2C outputs
  b2c_tenant_name = data.terraform_remote_state.stage4.outputs.tenant_name
  b2c_tenant_id   = data.terraform_remote_state.stage4.outputs.tenant_id
  
  # SQL Database outputs
  sql_server_fqdn   = data.terraform_remote_state.stage5.outputs.sql_server_fqdn
  sql_database_name = data.terraform_remote_state.stage5.outputs.sql_database_name
  
  # Cosmos DB outputs
  cosmos_endpoint       = data.terraform_remote_state.stage6.outputs.cosmos_endpoint
  cosmos_database_name  = data.terraform_remote_state.stage6.outputs.cosmos_database_name
  
  # Blob Storage outputs
  storage_account_name  = data.terraform_remote_state.stage7.outputs.storage_account_name
  storage_blob_endpoint = data.terraform_remote_state.stage7.outputs.storage_blob_endpoint
  
  # Azure OpenAI outputs
  openai_endpoint = data.terraform_remote_state.stage8.outputs.openai_endpoint
  
  # AI Search outputs
  search_endpoint = data.terraform_remote_state.stage9.outputs.search_endpoint
  
  # Container Registry outputs
  acr_login_server = data.terraform_remote_state.stage10.outputs.acr_login_server
  
  # Container Apps Environment outputs
  container_apps_environment_id = data.terraform_remote_state.stage11.outputs.container_apps_environment_id
  
  # Naming convention
  project      = "tax"
  environment  = "dev"
  region_short = "aue"
  zone_id      = "zd"
  
  # Container App name
  container_app_name = "${local.zone_id}-ca-api-${local.environment}-${local.region_short}"
  
  # Tags
  common_tags = {
    Environment = local.environment
    Purpose     = "prototype"
    Project     = "nz-tax-copilot"
    Zone        = local.zone_id
    Stage       = "backend-api"
    ManagedBy   = "terraform"
  }
}

# Store application configuration in Key Vault
resource "azurerm_key_vault_secret" "cosmos_endpoint" {
  name         = "cosmos-endpoint"
  value        = local.cosmos_endpoint
  key_vault_id = local.key_vault_id
}

resource "azurerm_key_vault_secret" "sql_server_fqdn" {
  name         = "sql-server-fqdn"
  value        = local.sql_server_fqdn
  key_vault_id = local.key_vault_id
}

resource "azurerm_key_vault_secret" "openai_endpoint" {
  name         = "openai-endpoint"
  value        = local.openai_endpoint
  key_vault_id = local.key_vault_id
}

resource "azurerm_key_vault_secret" "search_endpoint" {
  name         = "search-endpoint"
  value        = local.search_endpoint
  key_vault_id = local.key_vault_id
}

resource "azurerm_key_vault_secret" "storage_endpoint" {
  name         = "storage-endpoint"
  value        = local.storage_blob_endpoint
  key_vault_id = local.key_vault_id
}

resource "azurerm_key_vault_secret" "cosmos_database" {
  name         = "cosmos-database"
  value        = local.cosmos_database_name
  key_vault_id = local.key_vault_id
}

resource "azurerm_key_vault_secret" "sql_database" {
  name         = "sql-database"
  value        = local.sql_database_name
  key_vault_id = local.key_vault_id
}

# Backend API Container App
resource "azurerm_container_app" "api" {
  name                         = local.container_app_name
  container_app_environment_id = local.container_apps_environment_id
  resource_group_name          = local.resource_group_name
  revision_mode                = "Single"
  
  identity {
    type         = "SystemAssigned, UserAssigned"
    identity_ids = [local.managed_identity_id]
  }
  
  template {
    min_replicas = 1
    max_replicas = 3
    
    container {
      name   = "api"
      image  = "${local.acr_login_server}/api:latest"
      cpu    = 0.5
      memory = "1Gi"
      
      # Application configuration
      env {
        name  = "ENVIRONMENT"
        value = local.environment
      }
      
      env {
        name  = "AZURE_CLIENT_ID"
        value = local.managed_identity_client_id
      }
      
      # Azure AD B2C configuration
      env {
        name  = "B2C_TENANT_NAME"
        value = local.b2c_tenant_name
      }
      
      env {
        name  = "B2C_TENANT_ID"
        value = local.b2c_tenant_id
      }
      
      # Key Vault references for service endpoints
      env {
        name        = "COSMOS_ENDPOINT"
        secret_name = "cosmos-endpoint"
      }
      
      env {
        name        = "SQL_SERVER_FQDN"
        secret_name = "sql-server-fqdn"
      }
      
      env {
        name        = "OPENAI_ENDPOINT"
        secret_name = "openai-endpoint"
      }
      
      env {
        name        = "SEARCH_ENDPOINT"
        secret_name = "search-endpoint"
      }
      
      env {
        name        = "STORAGE_ENDPOINT"
        secret_name = "storage-endpoint"
      }
      
      env {
        name        = "COSMOS_DATABASE"
        secret_name = "cosmos-database"
      }
      
      env {
        name        = "SQL_DATABASE"
        secret_name = "sql-database"
      }
      
      # Health probes
      liveness_probe {
        transport = "HTTP"
        port      = 8000
        path      = "/health/live"
        
        initial_delay = 10
        period_seconds = 30
        timeout        = 5
        failure_threshold = 3
      }
      
      readiness_probe {
        transport = "HTTP"
        port      = 8000
        path      = "/health/ready"
        
        initial_delay = 5
        period_seconds = 10
        timeout        = 3
        failure_threshold = 3
        success_threshold = 1
      }
    }
    
    # HTTP-based autoscaling
    http_scale_rule {
      name                = "http-requests"
      concurrent_requests = 100
    }
  }
  
  # External HTTPS ingress (POC shortcut - production should use internal + APIM)
  ingress {
    external_enabled = true
    target_port      = 8000
    
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
    
    transport = "http"
  }
  
  # Key Vault secret references
  secret {
    name                = "cosmos-endpoint"
    key_vault_secret_id = azurerm_key_vault_secret.cosmos_endpoint.versionless_id
    identity            = local.managed_identity_id
  }
  
  secret {
    name                = "sql-server-fqdn"
    key_vault_secret_id = azurerm_key_vault_secret.sql_server_fqdn.versionless_id
    identity            = local.managed_identity_id
  }
  
  secret {
    name                = "openai-endpoint"
    key_vault_secret_id = azurerm_key_vault_secret.openai_endpoint.versionless_id
    identity            = local.managed_identity_id
  }
  
  secret {
    name                = "search-endpoint"
    key_vault_secret_id = azurerm_key_vault_secret.search_endpoint.versionless_id
    identity            = local.managed_identity_id
  }
  
  secret {
    name                = "storage-endpoint"
    key_vault_secret_id = azurerm_key_vault_secret.storage_endpoint.versionless_id
    identity            = local.managed_identity_id
  }
  
  secret {
    name                = "cosmos-database"
    key_vault_secret_id = azurerm_key_vault_secret.cosmos_database.versionless_id
    identity            = local.managed_identity_id
  }
  
  secret {
    name                = "sql-database"
    key_vault_secret_id = azurerm_key_vault_secret.sql_database.versionless_id
    identity            = local.managed_identity_id
  }
  
  # Container Registry authentication
  registry {
    server   = local.acr_login_server
    identity = local.managed_identity_id
  }
  
  tags = local.common_tags
}

# RBAC: Container App → Key Vault (Secrets User)
resource "azurerm_role_assignment" "api_kv_secrets_user" {
  scope                = local.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_container_app.api.identity[0].principal_id
}

# RBAC: Container App → Cosmos DB (Data Contributor)
resource "azurerm_cosmosdb_sql_role_assignment" "api_cosmos_contributor" {
  resource_group_name = local.resource_group_name
  account_name        = split("/", local.cosmos_endpoint)[2]
  role_definition_id  = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${local.resource_group_name}/providers/Microsoft.DocumentDB/databaseAccounts/${split("/", local.cosmos_endpoint)[2]}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002"
  principal_id        = azurerm_container_app.api.identity[0].principal_id
  scope               = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${local.resource_group_name}/providers/Microsoft.DocumentDB/databaseAccounts/${split("/", local.cosmos_endpoint)[2]}"
}

# RBAC: Container App → Blob Storage (Data Contributor)
resource "azurerm_role_assignment" "api_blob_contributor" {
  scope                = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${local.resource_group_name}/providers/Microsoft.Storage/storageAccounts/${local.storage_account_name}"
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_container_app.api.identity[0].principal_id
}

# RBAC: Container App → Azure OpenAI (OpenAI User)
resource "azurerm_role_assignment" "api_openai_user" {
  scope                = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${local.resource_group_name}/providers/Microsoft.CognitiveServices/accounts/${split("/", local.openai_endpoint)[2]}"
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azurerm_container_app.api.identity[0].principal_id
}

# RBAC: Container App → AI Search (Index Data Contributor)
resource "azurerm_role_assignment" "api_search_contributor" {
  scope                = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${local.resource_group_name}/providers/Microsoft.Search/searchServices/${split("/", local.search_endpoint)[2]}"
  role_definition_name = "Search Index Data Contributor"
  principal_id         = azurerm_container_app.api.identity[0].principal_id
}

# Note: SQL Database RBAC must be configured via SQL scripts after deployment
# See deploy.sh for the SQL user creation and role assignment commands

# Diagnostic settings
resource "azurerm_monitor_diagnostic_setting" "api" {
  name                       = "diag-${local.container_app_name}"
  target_resource_id         = azurerm_container_app.api.id
  log_analytics_workspace_id = local.log_analytics_workspace_id
  
  enabled_log {
    category = "ContainerAppConsoleLogs"
  }
  
  enabled_log {
    category = "ContainerAppSystemLogs"
  }
  
  metric {
    category = "AllMetrics"
  }
}

data "azurerm_client_config" "current" {}