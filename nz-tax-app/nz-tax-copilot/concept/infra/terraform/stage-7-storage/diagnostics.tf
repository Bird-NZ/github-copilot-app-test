# Diagnostic settings for Storage Account
resource "azapi_resource" "diagnostics" {
  type      = "Microsoft.Insights/diagnosticSettings@2025-06-01"
  name      = "diag-storage-blob"
  parent_id = "${azapi_resource.storage.id}/blobServices/default"

  body = {
    properties = {
      workspaceId = data.terraform_remote_state.stage1.outputs.log_analytics_workspace_id
      logs = [
        {
          category = "StorageRead"
          enabled  = true
        },
        {
          category = "StorageWrite"
          enabled  = true
        },
        {
          category = "StorageDelete"
          enabled  = true
        }
      ]
      metrics = [
        {
          category = "Transaction"
          enabled  = true
        },
        {
          category = "Capacity"
          enabled  = true
        }
      ]
    }
  }

  depends_on = [azapi_resource.blob_service]
}