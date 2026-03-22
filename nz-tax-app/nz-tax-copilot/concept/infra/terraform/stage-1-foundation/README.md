# Stage 1: Foundation

This stage deploys the foundational infrastructure for the NZ Tax Copilot prototype, including:

- **Resource Group**: Single resource group for all prototype resources
- **User-Assigned Managed Identity**: Shared identity for Container Apps and backend services to access data services
- **Log Analytics Workspace**: Centralized logging destination for all Azure service diagnostic logs
- **Application Insights**: Application telemetry and distributed tracing

## Deployed Resources

| Resource | Name | Type | Zone |
|----------|------|------|------|
| Resource Group | `zd-rg-tax-dev-aue` | Microsoft.Resources/resourceGroups | zd |
| Managed Identity | `zd-id-tax-dev-aue` | Microsoft.ManagedIdentity/userAssignedIdentities | zd |
| Log Analytics Workspace | `pm-log-tax-dev-aue` | Microsoft.OperationalInsights/workspaces | pm |
| Application Insights | `pm-appi-tax-dev-aue` | Microsoft.Insights/components | pm |

## Prerequisites

- Azure CLI installed and authenticated (`az login`)
- Terraform >= 1.9.0 installed
- Azure subscription with Contributor permissions
- `azapi` provider version ~> 2.8.0
- `azurerm` provider version >= 4.0, < 5.0

## Deployment

### Standard Deployment

```bash
./deploy.sh