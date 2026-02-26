# Stage 3: Function App

This stage deploys the Azure Function App infrastructure with App Service Plan (Consumption tier).

## Prerequisites

- Stage 1 (Foundation) must be deployed
- Stage 2 (Storage) must be deployed
- Azure CLI authenticated (`az login`)
- Terraform >= 1.9.0

## Resources Created

- **App Service Plan**: `zd-asp-helloworld-dev-aue` (Y1 Consumption tier)
- **Function App**: `zd-func-helloworld-dev-aue` (Python 3.12, Linux)
- **RBAC Role Assignment**: Storage Blob Data Contributor for function's managed identity

## Configuration

The Function App is configured with:

- **Runtime**: Python 3.12 on Linux
- **Authentication**: User-assigned managed identity (from Stage 2)
- **Storage Access**: Via managed identity (no connection strings)
- **Monitoring**: Application Insights integration (from Stage 1)
- **Security**: HTTPS-only, TLS 1.2+, CORS enabled for prototype testing

## Deployment

### Dry Run (Plan Only)

```bash
./deploy.sh --dry-run