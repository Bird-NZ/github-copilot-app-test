# Azure SQL Server
resource "azapi_resource" "sql_server" {
  type      = "Microsoft.Sql/servers@2025-06-01"
  name      = local.sql_server_name
  location  = var.location
  parent_id = data.terraform_remote_state.stage1.outputs.resource_group_id

  body = {
    properties = {
      administrators = {
        administratorType = "ActiveDirectory"
        principalType     = "Group"
        login             = var.sql_admin_group_name
        sid               = var.sql_admin_group_id
        tenantId          = data.azurerm_client_config.current.tenant_id
        azureADOnlyAuthentication = true
      }
      minimalTlsVersion        = "1.2"
      publicNetworkAccess      = "Disabled"
      restrictOutboundNetworkAccess = "Disabled"
    }
  }

  tags = local.common_tags

  identity {
    type = "SystemAssigned"
  }
}

# SQL Database
resource "azapi_resource" "sql_database" {
  type      = "Microsoft.Sql/servers/databases@2025-06-01"
  name      = var.database_name
  location  = var.location
  parent_id = azapi_resource.sql_server.id

  body = {
    properties = {
      collation            = var.database_collation
      maxSizeBytes         = var.database_max_size_gb * 1024 * 1024 * 1024
      zoneRedundant        = false
      autoPauseDelay       = var.database_auto_pause_delay_minutes
      minCapacity          = var.database_min_capacity
      requestedBackupStorageRedundancy = "Local"
    }
    sku = {
      name     = var.database_sku_name
      tier     = "GeneralPurpose"
      family   = "Gen5"
      capacity = 2
    }
  }

  tags = local.common_tags
}

# Short-term retention policy (7 days point-in-time restore)
resource "azapi_resource" "backup_policy" {
  type      = "Microsoft.Sql/servers/databases/backupShortTermRetentionPolicies@2025-06-01"
  name      = "default"
  parent_id = azapi_resource.sql_database.id

  body = {
    properties = {
      retentionDays = var.backup_retention_days
    }
  }
}

# Transparent Data Encryption (enabled by default, explicit configuration)
resource "azapi_resource" "tde" {
  type      = "Microsoft.Sql/servers/databases/transparentDataEncryption@2025-06-01"
  name      = "current"
  parent_id = azapi_resource.sql_database.id

  body = {
    properties = {
      state = "Enabled"
    }
  }
}

# Advanced Threat Protection (SQL Security Alert Policy)
resource "azapi_resource" "threat_protection" {
  type      = "Microsoft.Sql/servers/securityAlertPolicies@2025-06-01"
  name      = "Default"
  parent_id = azapi_resource.sql_server.id

  body = {
    properties = {
      state                      = "Enabled"
      disabledAlerts             = []
      emailAddresses             = []
      emailAccountAdmins         = false
      retentionDays              = 0
      storageAccountAccessKey    = ""
      storageEndpoint            = ""
    }
  }
}

# Private Endpoint for SQL Server
resource "azapi_resource" "private_endpoint" {
  type      = "Microsoft.Network/privateEndpoints@2025-06-01"
  name      = local.private_endpoint_name
  location  = var.location
  parent_id = data.terraform_remote_state.stage1.outputs.resource_group_id

  body = {
    properties = {
      subnet = {
        id = data.terraform_remote_state.stage2.outputs.subnet_data_id
      }
      privateLinkServiceConnections = [
        {
          name = "sql-connection"
          properties = {
            privateLinkServiceId = azapi_resource.sql_server.id
            groupIds             = ["sqlServer"]
          }
        }
      ]
    }
  }

  tags = local.common_tags
}

# Private DNS Zone Group for SQL Server
resource "azapi_resource" "dns_zone_group" {
  type      = "Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-06-01"
  name      = "sql-dns-zone-group"
  parent_id = azapi_resource.private_endpoint.id

  body = {
    properties = {
      privateDnsZoneConfigs = [
        {
          name = "privatelink-database-windows-net"
          properties = {
            privateDnsZoneId = data.terraform_remote_state.stage2.outputs.private_dns_zone_sql_id
          }
        }
      ]
    }
  }
}

# Diagnostic Settings for SQL Server
resource "azapi_resource" "sql_server_diagnostics" {
  type      = "Microsoft.Insights/diagnosticSettings@2021-05-01-preview"
  name      = "diag-sql-server"
  parent_id = azapi_resource.sql_server.id

  body = {
    properties = {
      workspaceId = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
      logs = [
        {
          category = "SQLSecurityAuditEvents"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        },
        {
          category = "DevOpsOperationsAudit"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        }
      ]
      metrics = [
        {
          category = "AllMetrics"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        }
      ]
    }
  }
}

# Diagnostic Settings for SQL Database
resource "azapi_resource" "sql_database_diagnostics" {
  type      = "Microsoft.Insights/diagnosticSettings@2021-05-01-preview"
  name      = "diag-sql-database"
  parent_id = azapi_resource.sql_database.id

  body = {
    properties = {
      workspaceId = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
      logs = [
        {
          category = "SQLInsights"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        },
        {
          category = "QueryStoreRuntimeStatistics"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        },
        {
          category = "Errors"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        },
        {
          category = "Timeouts"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        },
        {
          category = "Blocks"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        },
        {
          category = "Deadlocks"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        }
      ]
      metrics = [
        {
          category = "Basic"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        },
        {
          category = "InstanceAndAppAdvanced"
          enabled  = true
          retentionPolicy = {
            enabled = false
            days    = 0
          }
        }
      ]
    }
  }
}