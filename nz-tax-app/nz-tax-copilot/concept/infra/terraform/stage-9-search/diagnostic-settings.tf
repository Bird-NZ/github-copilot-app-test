# Diagnostic settings for AI Search (send logs to Log Analytics)
resource "azapi_resource" "diagnostic_settings" {
  type      = "Microsoft.Insights/diagnosticSettings@2021-05-01-preview"
  name      = "diag-search"
  parent_id = azapi_resource.search.id

  body = {
    properties = {
      workspaceId = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
      logs = [
        {
          category = "OperationLogs"
          enabled  = true
        }
      ]
      metrics = [
        {
          category = "AllMetrics"
          enabled  = true
        }
      ]
    }
  }

  schema_validation_enabled = false
  ignore_missing_property   = true

  depends_on = [azapi_resource.search]
}