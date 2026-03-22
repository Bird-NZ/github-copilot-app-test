# Local variables for resource naming
locals {
  app_name              = "zd-ca-web-${var.environment}-${var.region_short}"
  resource_group_name   = local.resource_group_name  # From data.tf
  location              = local.location              # From data.tf
  common_tags           = merge(var.common_tags, {
    Stage = "frontend-spa"
  })
}

# Frontend Container App (React SPA with nginx)
resource "azapi_resource" "frontend" {
  type      = "Microsoft.App/containerApps@2025-06-01"
  name      = local.app_name
  parent_id = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${local.resource_group_name}"
  location  = local.location
  
  identity {
    type = "SystemAssigned"
  }
  
  body = jsonencode({
    properties = {
      environmentId = local.container_apps_environment_id
      
      configuration = {
        activeRevisionsMode = "Single"
        
        ingress = {
          external              = true
          targetPort            = 80
          transport             = "auto"
          allowInsecure         = false
          traffic = [{
            latestRevision = true
            weight         = 100
          }]
        }
        
        registries = [{
          server   = local.acr_login_server
          identity = "system"
        }]
        
        secrets = [{
          name        = "appinsights-connection-string"
          keyVaultUrl = "${local.key_vault_id}/secrets/application-insights-connection-string"
          identity    = "system"
        }]
      }
      
      template = {
        revisionSuffix = "v1"
        
        containers = [{
          name  = "frontend"
          image = "${local.acr_login_server}/frontend:latest"
          
          resources = {
            cpu    = 0.25
            memory = "0.5Gi"
          }
          
          env = [
            {
              name      = "APPLICATIONINSIGHTS_CONNECTION_STRING"
              secretRef = "appinsights-connection-string"
            },
            {
              name  = "ENVIRONMENT"
              value = var.environment
            },
            {
              name  = "REACT_APP_API_URL"
              value = "https://${local.backend_api_fqdn}"
            },
            {
              name  = "REACT_APP_B2C_TENANT_NAME"
              value = local.b2c_tenant_name
            },
            {
              name  = "REACT_APP_B2C_CLIENT_ID"
              value = local.b2c_client_id
            },
            {
              name  = "REACT_APP_B2C_POLICY_NAME"
              value = "B2C_1_signup_signin"
            },
            {
              name  = "REACT_APP_B2C_AUTHORITY"
              value = "https://${local.b2c_tenant_name}.b2clogin.com/${local.b2c_tenant_name}.onmicrosoft.com/B2C_1_signup_signin"
            }
          ]
          
          probes = [
            {
              type = "liveness"
              httpGet = {
                path   = "/health"
                port   = 80
                scheme = "HTTP"
              }
              initialDelaySeconds = 10
              periodSeconds       = 30
              timeoutSeconds      = 5
              failureThreshold    = 3
            },
            {
              type = "readiness"
              httpGet = {
                path   = "/health"
                port   = 80
                scheme = "HTTP"
              }
              initialDelaySeconds = 5
              periodSeconds       = 10
              timeoutSeconds      = 3
              failureThreshold    = 3
              successThreshold    = 1
            }
          ]
        }]
        
        scale = {
          minReplicas = 1
          maxReplicas = 3
          
          rules = [{
            name = "http-requests"
            http = {
              metadata = {
                concurrentRequests = "50"
              }
            }
          }]
        }
      }
    }
  })
  
  tags = local.common_tags
  
  depends_on = [
    azurerm_role_assignment.frontend_kv_secrets_user,
    azurerm_role_assignment.frontend_acr_pull
  ]
}

# RBAC: Frontend → Key Vault (Secrets User)
resource "azurerm_role_assignment" "frontend_kv_secrets_user" {
  scope                = local.key_vault_id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azapi_resource.frontend.identity.principal_id
}

# RBAC: Frontend → Container Registry (AcrPull)
resource "azurerm_role_assignment" "frontend_acr_pull" {
  scope                = local.acr_id
  role_definition_name = "AcrPull"
  principal_id         = azapi_resource.frontend.identity.principal_id
}

# Diagnostic Settings: Frontend Container App
resource "azurerm_monitor_diagnostic_setting" "frontend" {
  name                       = "diag-frontend"
  target_resource_id         = azapi_resource.frontend.id
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