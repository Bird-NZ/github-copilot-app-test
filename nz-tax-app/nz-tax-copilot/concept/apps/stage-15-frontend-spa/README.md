# Stage 15: Frontend SPA

This stage deploys the React SPA frontend as an Azure Container App with external HTTPS ingress.

## Resources Deployed

- **Container App**: `zd-ca-web-dev-aue`
  - SKU: Consumption (0.25 vCPU, 0.5 GB RAM)
  - Replicas: 1-3 (autoscale on HTTP concurrency)
  - Ingress: External HTTPS (port 80)
  - Identity: System-assigned managed identity

## Prerequisites

1. All prior stages deployed (1-14)
2. Frontend container image built and pushed to ACR:
   ```bash
   cd frontend
   docker build -t <acr-name>.azurecr.io/frontend:latest .
   az acr login --name <acr-name>
   docker push <acr-name>.azurecr.io/frontend:latest
   ```

## Configuration

### Environment Variables

The frontend receives these environment variables:

- `REACT_APP_API_URL`: Backend API URL (from Stage 14)
- `REACT_APP_B2C_TENANT_NAME`: Azure AD B2C tenant name (from Stage 4)
- `REACT_APP_B2C_CLIENT_ID`: B2C frontend app client ID (from Stage 4)
- `REACT_APP_B2C_POLICY_NAME`: B2C sign-up/sign-in policy name
- `APPLICATIONINSIGHTS_CONNECTION_STRING`: App Insights connection string (from Key Vault)

### RBAC Roles

The frontend managed identity is granted:

- **Key Vault Secrets User**: Access Application Insights connection string
- **AcrPull**: Pull container images from ACR

## Deployment

```bash
# Deploy infrastructure
./deploy.sh

# Verify deployment
FRONTEND_URL=$(terraform output -raw frontend_url)
curl "$FRONTEND_URL/health"