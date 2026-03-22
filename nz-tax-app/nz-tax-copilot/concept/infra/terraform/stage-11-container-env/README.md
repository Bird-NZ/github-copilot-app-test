# Stage 11: Container Apps Environment

This stage deploys the Azure Container Apps Environment, which provides the hosting infrastructure for containerized applications (backend API and frontend).

## Resources Deployed

- **Container Apps Environment** (`zd-cae-tax-dev-aue`): Managed Kubernetes environment for Container Apps
  - Plan: Consumption (serverless, pay-per-use)
  - VNET Integration: Enabled (deployed into `snet-apps` subnet from Stage 2)
  - Internal Load Balancer: Disabled (external ingress required for user-facing API)
  - Log Analytics: Integrated with workspace from Stage 1

- **Diagnostic Settings**: System logs and metrics sent to Log Analytics

## Dependencies

### Required Prior Stages

- **Stage 1 (Foundation)**: Resource group, managed identity, Log Analytics workspace
- **Stage 2 (Networking)**: VNET, subnets (specifically `snet-apps`)

### Outputs Consumed

From **Stage 1**:
- `resource_group_name`: Resource group for Container Apps Environment
- `managed_identity_id`: User-assigned managed identity (for future Container Apps)
- `managed_identity_principal_id`: Principal ID for RBAC assignments
- `log_analytics_workspace_id`: Log Analytics workspace for logging
- `log_analytics_workspace_name`: Workspace name for configuration

From **Stage 2**:
- `subnet_apps_id`: Subnet ID for VNET integration (delegated to Microsoft.App/environments)

## Configuration

### VNET Integration

The Container Apps Environment is deployed into a dedicated subnet (`snet-apps`) with delegation to `Microsoft.App/environments`. This enables:

- Private endpoint connectivity to data services (Cosmos DB, SQL, Blob Storage, Key Vault)
- Internal network communication between Container Apps
- External HTTPS ingress for user-facing API (prototype configuration)

**Production Enhancement**: Enable internal load balancer mode and deploy Azure API Management or Application Gateway as the public gateway.

### Logging Configuration

The environment is configured to send all system logs and console logs to the Log Analytics workspace from Stage 1:

- **System Logs**: Container lifecycle events (start, stop, crash), scaling events, health probe results
- **Console Logs**: stdout/stderr from application containers (captured after Container Apps are deployed in Stage 12)

### Workload Profiles

**Prototype**: Consumption plan (serverless, pay-per-use)
- Auto-scales from 0 to maximum replicas based on HTTP traffic
- No minimum commitment or reserved capacity
- Cost: ~$0.000012/vCPU-second + ~$0.000003/GB-second

**Production**: Dedicated Workload Profiles plan
- Reserved compute: 2 vCPU, 4 GB RAM per node (3 nodes minimum)
- Predictable performance and cost
- Zone redundancy for high availability

## Outputs Exported

This stage exports the following outputs for downstream stages (Stage 12+):

- `container_apps_environment_id`: Full resource ID (for Container App deployment)
- `container_apps_environment_name`: Environment name
- `container_apps_environment_default_domain`: Default domain for Container Apps (e.g., `*.australiaeast.azurecontainerapps.io`)
- `container_apps_environment_static_ip`: Static IP address (for NSG rules and firewall allowlists)

## Deployment

### Prerequisites

1. Azure CLI authenticated (`az login`)
2. Appropriate subscription selected (`az account set --subscription <id>`)
3. Stage 1 (Foundation) deployed successfully
4. Stage 2 (Networking) deployed successfully

### Deploy

```bash
# From this directory (stage-11-container-env/)
./deploy.sh