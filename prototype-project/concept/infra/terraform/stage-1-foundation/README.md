# Stage 1: Foundation

This stage deploys the foundational infrastructure for the hello-world prototype:

- **Resource Group**: Container for all Azure resources
- **Log Analytics Workspace**: Centralized logging backend (90-day retention)
- **Application Insights**: Function telemetry and distributed tracing

## Prerequisites

- Azure CLI installed and authenticated (`az login`)
- Terraform 1.9.0 or later installed
- Azure subscription with Contributor permissions

## Deployment

### Quick Start

```bash
# Deploy with interactive confirmation
./deploy.sh

# Deploy with auto-approval (CI/CD pipelines)
./deploy.sh --auto-approve

# Dry run (plan only, no apply)
./deploy.sh --dry-run