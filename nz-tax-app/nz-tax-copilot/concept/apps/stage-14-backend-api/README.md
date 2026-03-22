# Stage 14: Backend API

This stage deploys the FastAPI backend API as an Azure Container App.

## Prerequisites

- Stages 1-13 successfully deployed
- Backend application code in `../backend/` directory
- Docker installed for building container images
- Azure CLI authenticated with appropriate subscription

## What This Stage Deploys

### Azure Resources

- **Container App**: `zd-ca-api-dev-aue`
  - FastAPI backend with JWT authentication
  - External HTTPS ingress (POC shortcut — production: internal + APIM)
  - System-assigned + user-assigned managed identity
  - Health probes: `/health/live`, `/health/ready`
  - Autoscaling: 1-3 replicas based on HTTP concurrency (100 req/replica)
  
### RBAC Role Assignments

- **Container App → Key Vault**: Key Vault Secrets User
- **Container App → Cosmos DB**: Cosmos DB Built-in Data Contributor
- **Container App → Blob Storage**: Storage Blob Data Contributor
- **Container App → Azure OpenAI**: Cognitive Services OpenAI User
- **Container App → AI Search**: Search Index Data Contributor
- **Container App → SQL Database**: `db_datareader`, `db_datawriter` (via SQL script)

### Key Vault Secrets

- `cosmos-endpoint`: Cosmos DB endpoint URL
- `sql-server-fqdn`: Azure SQL Server FQDN
- `openai-endpoint`: Azure OpenAI endpoint URL
- `search-endpoint`: AI Search endpoint URL
- `storage-endpoint`: Blob Storage endpoint URL
- `cosmos-database`: Cosmos DB database name
- `sql-database`: SQL Database name

## Deployment Steps

1. **Build and push container image**:
   ```bash
   # Authenticate to ACR
   az acr login --name zdacrtaxdevaue
   
   # Build and push
   docker build -t zdacrtaxdevaue.azurecr.io/api:latest ../backend
   docker push zdacrtaxdevaue.azurecr.io/api:latest
   ```

2. **Deploy infrastructure**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Verify deployment**:
   ```bash
   # Get API URL
   API_URL=$(terraform output -raw api_url)
   
   # Test health endpoint
   curl $API_URL/health/live
   
   # View Container App logs
   az containerapp logs show \
     --name zd-ca-api-dev-aue \
     --resource-group zd-rg-tax-dev-aue \
     --follow
   ```

## Configuration

### Environment Variables

The Container App uses these environment variables (all from Key Vault references):

- `AZURE_CLIENT_ID`: User-assigned managed identity client ID
- `B2C_TENANT_NAME`: Azure AD B2C tenant name
- `B2C_TENANT_ID`: Azure AD B2C tenant ID
- `COSMOS_ENDPOINT`: Cosmos DB endpoint URL
- `SQL_SERVER_FQDN`: SQL Server FQDN
- `OPENAI_ENDPOINT`: Azure OpenAI endpoint URL
- `SEARCH_ENDPOINT`: AI Search endpoint URL
- `STORAGE_ENDPOINT`: Blob Storage endpoint URL
- `COSMOS_DATABASE`: Cosmos DB database name
- `SQL_DATABASE`: SQL Database name

### Health Probes

- **Liveness probe**: `GET /health/live`
  - Initial delay: 10s
  - Period: 30s
  - Failure threshold: 3
  - Returns 200 if container process is running
  
- **Readiness probe**: `GET /health/ready`
  - Initial delay: 5s
  - Period: 10s
  - Failure threshold: 3
  - Returns 200 only if all dependencies (SQL, Cosmos, Storage, OpenAI, Search) are reachable

## Outputs

- `container_app_name`: Name of the Container App
- `container_app_id`: Resource ID of the Container App
- `container_app_fqdn`: FQDN of the latest revision
- `api_url`: Public HTTPS URL of the backend API
- `container_app_identity_principal_id`: Principal ID of the system-assigned managed identity
- `container_app_identity_tenant_id`: Tenant ID of the system-assigned managed identity

## Dependencies

### Upstream Stages

- Stage 1: Foundation (resource group, managed identity, Log Analytics)
- Stage 3: Key Vault (secret storage)
- Stage 4: Azure AD B2C (user authentication)
- Stage 5: SQL Database (relational data storage)
- Stage 6: Cosmos DB (document storage)
- Stage 7: Blob Storage (document/file storage)
- Stage 8: Azure OpenAI (AI inference)
- Stage 9: AI Search (vector search)
- Stage 10: Container Registry (image storage)
- Stage 11: Container Apps Environment (hosting platform)

### Downstream Stages

None — this is the final application deployment stage.

## POC Shortcuts

This stage includes these prototype shortcuts:

| Shortcut | Production Requirement | Priority |
|----------|----------------------|----------|
| External ingress | Internal ingress + APIM

---
**Governance warnings:**
- Possible credential/secret in output — use managed identity instead of connection strings or keys.