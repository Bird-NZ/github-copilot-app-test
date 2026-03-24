# Stage 14: Backend API

This stage deploys the backend API as an Azure Container App.

## V1 auth posture

**Version 1 runs with authentication disabled.**
Azure AD B2C is explicitly deferred for a later release so deployment is not blocked on Stage 4.

The backend now supports a no-auth mode with a single demo/internal session and should be deployed with:

- `AUTH_MODE=none`
- no B2C tenant dependency
- health endpoints:
  - `/health`
  - `/health/live`
  - `/health/ready`

## Prerequisites

- Stages 1-3, 5-13 successfully deployed
- Backend application code in `../backend/` directory
- Docker installed for building container images
- Azure CLI authenticated with appropriate subscription

## What This Stage Deploys

### Azure Resources

- **Container App**: `zd-ca-api-dev-aue`
  - Backend API in no-auth V1 mode
  - External HTTPS ingress (POC shortcut — production: internal + APIM)
  - System-assigned + user-assigned managed identity
  - Health probes: `/health/live`, `/health/ready`
  - Autoscaling: 1-3 replicas based on HTTP concurrency (100 req/replica)

## Deployment Steps

1. **Build and push container image**
2. **Deploy infrastructure**
3. **Verify deployment** via `/health/live`

## Configuration

### Environment Variables

- `ENVIRONMENT`
- `AZURE_CLIENT_ID`
- `AUTH_MODE` = `none` for V1
- `COSMOS_ENDPOINT`
- `SQL_SERVER_FQDN`
- `OPENAI_ENDPOINT`
- `SEARCH_ENDPOINT`
- `STORAGE_ENDPOINT`
- `COSMOS_DATABASE`
- `SQL_DATABASE`

## Dependencies

### Upstream Stages

- Stage 1: Foundation
- Stage 3: Key Vault
- Stage 5: SQL Database
- Stage 6: Cosmos DB
- Stage 7: Blob Storage
- Stage 8: Azure OpenAI
- Stage 9: AI Search
- Stage 10: Container Registry
- Stage 11: Container Apps Environment

### Deferred from V1

- Stage 4: Azure AD B2C

## Outputs

- `container_app_name`
- `container_app_id`
- `container_app_fqdn`
- `api_url`
- `container_app_identity_principal_id`
- `container_app_identity_tenant_id`
