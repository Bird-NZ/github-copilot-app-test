# Cosmos DB Account
resource "azapi_resource" "cosmos_account" {
  type      = "Microsoft.DocumentDB/databaseAccounts@2025-06-01"
  name      = local.cosmos_account_name
  parent_id = data.azapi_resource.rg.id
  location  = var.location

  body = {
    kind = "GlobalDocumentDB"
    
    properties = {
      databaseAccountOfferType = "Standard"
      
      consistencyPolicy = {
        defaultConsistencyLevel = var.consistency_level
        maxIntervalInSeconds    = 5
        maxStalenessPrefix      = 100
      }
      
      locations = [
        {
          locationName     = var.location
          failoverPriority = 0
          isZoneRedundant  = false
        }
      ]
      
      capabilities = var.enable_serverless ? [
        {
          name = "EnableServerless"
        }
      ] : []
      
      enableFreeTier                     = var.enable_free_tier
      disableLocalAuth                   = true
      publicNetworkAccess                = "Disabled"
      networkAclBypass                   = "None"
      enableAutomaticFailover            = false
      enableMultipleWriteLocations       = false
      
      backupPolicy = {
        type = "Continuous"
        continuousModeProperties = {
          tier = "Continuous7Days"
        }
      }
    }
  }

  tags = local.common_tags

  schema_validation_enabled = false
  
  lifecycle {
    ignore_changes = [
      body.properties.capabilities
    ]
  }
}

# Cosmos DB SQL Database
resource "azapi_resource" "cosmos_database" {
  type      = "Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2025-06-01"
  name      = local.database_name
  parent_id = azapi_resource.cosmos_account.id

  body = {
    properties = {
      resource = {
        id = local.database_name
      }
      options = {}
    }
  }

  schema_validation_enabled = false
  
  depends_on = [azapi_resource.cosmos_account]
}

# Container: workspaces
resource "azapi_resource" "workspaces_container" {
  type      = "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-06-01"
  name      = local.workspaces_container_name
  parent_id = azapi_resource.cosmos_database.id

  body = {
    properties = {
      resource = {
        id = local.workspaces_container_name
        
        partitionKey = {
          paths = ["/userId"]
          kind  = "Hash"
        }
        
        indexingPolicy = {
          indexingMode = "consistent"
          automatic    = true
          
          includedPaths = [
            {
              path = "/*"
            }
          ]
          
          excludedPaths = [
            {
              path = "/\"_etag\"/?"
            }
          ]
        }
        
        defaultTtl = var.workspaces_container_ttl
      }
      options = {}
    }
  }

  schema_validation_enabled = false
  
  depends_on = [azapi_resource.cosmos_database]
}

# Container: questionnaireResponses
resource "azapi_resource" "questionnaire_container" {
  type      = "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-06-01"
  name      = local.questionnaire_responses_container_name
  parent_id = azapi_resource.cosmos_database.id

  body = {
    properties = {
      resource = {
        id = local.questionnaire_responses_container_name
        
        partitionKey = {
          paths = ["/workspaceId"]
          kind  = "Hash"
        }
        
        indexingPolicy = {
          indexingMode = "consistent"
          automatic    = true
          
          includedPaths = [
            {
              path = "/*"
            }
          ]
        }
        
        defaultTtl = var.questionnaire_container_ttl
      }
      options = {}
    }
  }

  schema_validation_enabled = false
  
  depends_on = [azapi_resource.cosmos_database]
}

# Container: guidanceHistory
resource "azapi_resource" "guidance_history_container" {
  type      = "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2025-06-01"
  name      = local.guidance_history_container_name
  parent_id = azapi_resource.cosmos_database.id

  body = {
    properties = {
      resource = {
        id = local.guidance_history_container_name
        
        partitionKey = {
          paths = ["/userId"]
          kind  = "Hash"
        }
        
        indexingPolicy = {
          indexingMode = "consistent"
          automatic    = true
          
          includedPaths = [
            {
              path = "/*"
            }
          ]
        }
        
        defaultTtl = var.guidance_history_ttl
      }
      options = {}
    }
  }

  schema_validation_enabled = false
  
  depends_on = [azapi_resource.cosmos_database]
}

# Private Endpoint for Cosmos DB
resource "azapi_resource" "cosmos_private_endpoint" {
  type      = "Microsoft.Network/privateEndpoints@2025-06-01"
  name      = local.private_endpoint_name
  parent_id = data.azapi_resource.rg.id
  location  = var.location

  body = {
    properties = {
      subnet = {
        id = data.azapi_resource.data_subnet.id
      }
      
      privateLinkServiceConnections = [
        {
          name = "cosmos-connection"
          properties = {
            privateLinkServiceId = azapi_resource.cosmos_account.id
            groupIds             = ["Sql"]
          }
        }
      ]
      
      customNetworkInterfaceName = "${local.private_endpoint_name}-nic"
    }
  }

  tags = local.common_tags

  depends_on = [
    azapi_resource.cosmos_account,
    azapi_resource.workspaces_container,
    azapi_resource.questionnaire_container,
    azapi_resource.guidance_history_container
  ]
}

# Private DNS Zone Group for Private Endpoint
resource "azapi_resource" "cosmos_dns_zone_group" {
  type      = "Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-06-01"
  name      = "default"
  parent_id = azapi_resource.cosmos_private_endpoint.id

  body = {
    properties = {
      privateDnsZoneConfigs = [
        {
          name = "cosmos-dns-config"
          properties = {
            privateDnsZoneId = data.azapi_resource.cosmos_dns_zone.id
          }
        }
      ]
    }
  }

  depends_on = [azapi_resource.cosmos_private_endpoint]
}

# Diagnostic Settings for Cosmos DB
resource "azapi_resource" "cosmos_diagnostics" {
  type      = "Microsoft.Insights/diagnosticSettings@2021-05-01-preview"
  name      = "diag-cosmos"
  parent_id = azapi_resource.cosmos_account.id

  body = {
    properties = {
      workspaceId = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
      
      logs = [
        {
          category = "DataPlaneRequests"
          enabled  = true
        },
        {
          category = "QueryRuntimeStatistics"
          enabled  = true
        },
        {
          category = "PartitionKeyStatistics"
          enabled  = true
        },
        {
          category = "ControlPlaneRequests"
          enabled  = true
        }
      ]
      
      metrics = [
        {
          category = "Requests"
          enabled  = true
        }
      ]
    }
  }

  depends_on = [azapi_resource.cosmos_account]
}