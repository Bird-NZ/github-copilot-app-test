# App Service Plan (Consumption Y1)
resource "azapi_resource" "app_service_plan" {
  type      = "Microsoft.Web/serverfarms@2025-03-01"
  name      = local.asp_name
  location  = var.location
  parent_id = data.terraform_remote_state.foundation.outputs.resource_group_id
  
  body = {
    properties = {
      reserved = true  # Required for Linux
    }
    sku = {
      name = "Y1"
      tier = "Dynamic"
    }
    kind = "functionapp"
  }
  
  tags = local.common_tags
}

# Linux Function App with User-Assigned Managed Identity
resource "azapi_resource" "function_app" {
  type      = "Microsoft.Web/sites@2025-03-01"
  name      = local.func_name
  location  = var.location
  parent_id = data.terraform_remote_state.foundation.outputs.resource_group_id
  
  body = {
    kind = "functionapp,linux"
    
    properties = {
      serverFarmId = azapi_resource.app_service_plan.id
      reserved     = true  # Linux
      
      httpsOnly = true
      
      siteConfig = {
        linuxFxVersion        = "Python|3.12"
        minTlsVersion         = "1.2"
        http20Enabled         = true
        ftpsState             = "Disabled"
        alwaysOn              = false  # Not supported on Consumption plan
        use32BitWorkerProcess = false
        
        appSettings = [
          {
            name  = "FUNCTIONS_WORKER_RUNTIME"
            value = "python"
          },
          {
            name  = "PYTHON_ISOLATE_WORKER_DEPENDENCIES"
            value = "1"
          },
          {
            name  = "AzureWebJobsFeatureFlags"
            value = "EnableWorkerIndexing"
          },
          {
            name  = "APPLICATIONINSIGHTS_CONNECTION_STRING"
            value = data.terraform_remote_state.foundation.outputs.application_insights_connection_string
          },
          {
            name  = "STORAGE_ACCOUNT_NAME"
            value = data.terraform_remote_state.storage.outputs.storage_account_name
          },
          {
            name  = "STORAGE_CONTAINER_NAME"
            value = data.terraform_remote_state.storage.outputs.storage_container_name
          },
          {
            name  = "AZURE_CLIENT_ID"
            value = data.terraform_remote_state.storage.outputs.managed_identity_client_id
          },
          {
            name  = "AzureWebJobsStorage__accountName"
            value = data.terraform_remote_state.storage.outputs.storage_account_name
          }
        ]
        
        cors = {
          allowedOrigins     = ["*"]
          supportCredentials = false
        }
      }
      
      storageAccountRequired = false
    }
    
    identity = {
      type = "UserAssigned"
      userAssignedIdentities = {
        "${data.terraform_remote_state.storage.outputs.managed_identity_id}" = {}
      }
    }
  }
  
  tags = local.common_tags
  
  depends_on = [
    azapi_resource.app_service_plan
  ]
}