#!/bin/bash
set -euo pipefail

# =============================================================================
# Stage 14: Backend API Deployment Script
# =============================================================================
# This script deploys the FastAPI backend API to Azure Container Apps
# Prerequisites:
#   - Stages 1-13 successfully deployed
#   - Backend application code built and pushed to ACR
#   - Azure CLI authenticated with appropriate subscription selected
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_NAME="stage14-backend-api"
OUTPUT_FILE="${SCRIPT_DIR}/outputs.json"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
trap 'log_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

# =============================================================================
# Preflight Checks
# =============================================================================
log_info "Starting preflight checks for ${STAGE_NAME}..."

# Check Azure CLI authentication
if ! az account show &>/dev/null; then
    log_error "Not logged in to Azure CLI. Run 'az login' first."
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
log_info "Deploying to subscription: ${SUBSCRIPTION_NAME} (${SUBSCRIPTION_ID})"

# Check required Terraform backend environment variables
if [[ -z "${ARM_ACCESS_KEY:-}" ]]; then
    log_error "ARM_ACCESS_KEY environment variable not set (required for Terraform backend)"
    exit 1
fi

# Verify required prior stages exist
REQUIRED_STAGES=(
    "stage1-foundation"
    "stage3-key-vault"
    "stage5-sql-database"
    "stage6-cosmos-db"
    "stage7-blob-storage"
    "stage8-azure-openai"
    "stage9-ai-search"
    "stage10-container-registry"
    "stage11-container-apps-env"
)

for stage in "${REQUIRED_STAGES[@]}"; do
    if ! az storage blob exists \
        --account-name "${TF_STATE_STORAGE_ACCOUNT}" \
        --container-name "${TF_STATE_CONTAINER}" \
        --name "${stage}.tfstate" \
        --auth-mode login &>/dev/null; then
        log_error "Required stage '${stage}' has not been deployed yet"
        exit 1
    fi
done

log_info "Preflight checks passed"

# =============================================================================
# Build and Push Container Image
# =============================================================================
log_info "Building and pushing backend API container image..."

# Navigate to backend directory
BACKEND_DIR="$(dirname "${SCRIPT_DIR}")/backend"
if [[ ! -d "${BACKEND_DIR}" ]]; then
    log_error "Backend application directory not found: ${BACKEND_DIR}"
    exit 1
fi

# Get ACR login server from stage 10 outputs
ACR_LOGIN_SERVER=$(terraform output -state=../stage-10-container-registry/terraform.tfstate -raw acr_login_server 2>/dev/null || echo "")
if [[ -z "${ACR_LOGIN_SERVER}" ]]; then
    log_error "Failed to get ACR login server from stage 10 outputs"
    exit 1
fi

log_info "Container Registry: ${ACR_LOGIN_SERVER}"

# Login to ACR using managed identity
log_info "Authenticating to ACR..."
az acr login --name "${ACR_LOGIN_SERVER%%.*}"

# Build container image
IMAGE_TAG="latest"
IMAGE_NAME="${ACR_LOGIN_SERVER}/api:${IMAGE_TAG}"

log_info "Building container image: ${IMAGE_NAME}"
docker build -t "${IMAGE_NAME}" "${BACKEND_DIR}"

# Push to ACR
log_info "Pushing container image to ACR..."
docker push "${IMAGE_NAME}"

log_info "Container image pushed successfully"

# =============================================================================
# Terraform Initialization
# =============================================================================
log_info "Initializing Terraform..."

cd "${SCRIPT_DIR}"

terraform init \
    -backend-config="storage_account_name=${TF_STATE_STORAGE_ACCOUNT}" \
    -backend-config="container_name=${TF_STATE_CONTAINER}" \
    -backend-config="key=${STAGE_NAME}.tfstate"

# =============================================================================
# Terraform Plan
# =============================================================================
log_info "Running Terraform plan..."

terraform plan \
    -out="${SCRIPT_DIR}/tfplan" \
    -input=false

# =============================================================================
# Terraform Apply
# =============================================================================
log_info "Applying Terraform configuration..."

terraform apply \
    -input=false \
    -auto-approve \
    "${SCRIPT_DIR}/tfplan"

# =============================================================================
# Configure SQL Database Authentication
# =============================================================================
log_info "Configuring SQL Database authentication for Container App managed identity..."

# Get Container App managed identity principal ID
CONTAINER_APP_PRINCIPAL_ID=$(terraform output -raw container_app_identity_principal_id)
CONTAINER_APP_NAME=$(terraform output -raw container_app_name)
SQL_SERVER_FQDN=$(terraform output -state=../stage-5-sql-database/terraform.tfstate -raw sql_server_fqdn)
SQL_DATABASE_NAME=$(terraform output -state=../stage-5-sql-database/terraform.tfstate -raw sql_database_name)

log_info "Creating SQL database user for Container App managed identity..."

# Create SQL user and assign roles
# Note: This requires the current Azure CLI user to have SQL admin permissions
az sql db execute \
    --server "${SQL_SERVER_FQDN%%.database.windows.net}" \
    --database "${SQL_DATABASE_NAME}" \
    --auth-type ActiveDirectoryDefault \
    --query-text "
        IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = '${CONTAINER_APP_NAME}')
        BEGIN
            CREATE USER [${CONTAINER_APP_NAME}] FROM EXTERNAL PROVIDER;
        END;
        
        ALTER ROLE db_datareader ADD MEMBER [${CONTAINER_APP_NAME}];
        ALTER ROLE db_datawriter ADD MEMBER [${CONTAINER_APP_NAME}];
        
        GRANT EXECUTE ON SCHEMA::dbo TO [${CONTAINER_APP_NAME}];
    " || log_warn "Failed to create SQL user (may already exist or require manual setup)"

# =============================================================================
# Verify Deployment
# =============================================================================
log_info "Verifying deployment..."

API_URL=$(terraform output -raw api_url)

log_info "Testing health endpoint..."
sleep 10  # Wait for container to start

if curl -f -s "${API_URL}/health/live" > /dev/null; then
    log_info "✓ Health check passed: ${API_URL}/health/live"
else
    log_warn "Health check failed — container may still be starting. Check Container App logs for details."
fi

# =============================================================================
# Export Outputs
# =============================================================================
log_info "Exporting outputs to ${OUTPUT_FILE}..."

terraform output -json > "${OUTPUT_FILE}"

log_info "Deployment outputs saved to ${OUTPUT_FILE}"

# =============================================================================
# Deployment Summary
# =============================================================================
log_info "=========================================="
log_info "Stage 14 Deployment Complete"
log_info "=========================================="
log_info "Container App Name: ${CONTAINER_APP_NAME}"
log_info "API URL: ${API_URL}"
log_info "ACR Image: ${IMAGE_NAME}"
log_info ""
log_info "Next Steps:"
log_info "1. Test the API health endpoint: curl ${API_URL}/health/live"
log_info "2. Review Container App logs: az containerapp logs show --name ${CONTAINER_APP_NAME} --resource-group <rg-name> --follow"
log_info "3. Configure frontend to use API URL: ${API_URL}"
log_info "4. Review RBAC assignments in Azure Portal"
log_info ""
log_info "Production Backlog Items (from this stage):"
log_info "- PB-001: Deploy API Management gateway (change Container App ingress to internal)"
log_info "- PB-016: Upgrade to Workload Profiles plan for consistent performance"
log_info "- PB-017: Configure HTTP concurrency-based autoscaling"
log_info "- PB-018: Enhance health probes with dependency checks"
log_info "=========================================="

exit 0