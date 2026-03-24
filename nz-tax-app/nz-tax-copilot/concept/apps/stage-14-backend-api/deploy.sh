#!/bin/bash
set -euo pipefail

# =============================================================================
# Stage 14: Backend API Deployment Script
# =============================================================================
# Deploys the current no-auth V1 Node/Express backend to Azure Container Apps
# using Azure Container Registry remote builds (no local Docker required).
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_NAME="stage14-backend-api"
OUTPUT_FILE="${SCRIPT_DIR}/outputs.json"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
BACKEND_DIR="${WORKSPACE_ROOT}/src/api"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
trap 'log_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

log_info "Starting preflight checks for ${STAGE_NAME}..."

if ! az account show &>/dev/null; then
    log_error "Not logged in to Azure CLI. Run 'az login' first."
    exit 1
fi

if [[ -z "${ARM_ACCESS_KEY:-}" ]]; then
    log_error "ARM_ACCESS_KEY environment variable not set (required for Terraform backend)"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
log_info "Deploying to subscription: ${SUBSCRIPTION_NAME} (${SUBSCRIPTION_ID})"

if ! command -v terraform &>/dev/null; then
    log_error "Terraform is required but not installed"
    exit 1
fi

if [[ ! -d "${BACKEND_DIR}" ]]; then
    log_error "Current V1 backend directory not found: ${BACKEND_DIR}"
    exit 1
fi

for required in package.json server.js Dockerfile; do
    if [[ ! -f "${BACKEND_DIR}/${required}" ]]; then
        log_error "Missing required backend file: ${BACKEND_DIR}/${required}"
        exit 1
    fi
done

cd "${SCRIPT_DIR}"
terraform init -backend-config="storage_account_name=${TF_STATE_STORAGE_ACCOUNT}" \
    -backend-config="container_name=${TF_STATE_CONTAINER}" \
    -backend-config="key=${STAGE_NAME}.tfstate"

ACR_LOGIN_SERVER=$(terraform output -state=../stage-10-acr/terraform.tfstate -raw acr_login_server 2>/dev/null || terraform output -state=../stage-10-container-registry/terraform.tfstate -raw acr_login_server 2>/dev/null || echo "")
if [[ -z "${ACR_LOGIN_SERVER}" ]]; then
    log_error "Failed to get ACR login server from stage 10 outputs"
    exit 1
fi

ACR_NAME="${ACR_LOGIN_SERVER%%.*}"
IMAGE_NAME="${ACR_LOGIN_SERVER}/api:latest"

log_info "Building backend image remotely in ACR: ${IMAGE_NAME}"
az acr build \
    --registry "${ACR_NAME}" \
    --image "api:latest" \
    "${BACKEND_DIR}"

log_info "Running Terraform plan..."
terraform plan -out="${SCRIPT_DIR}/tfplan" -input=false

log_info "Applying Terraform configuration..."
terraform apply -input=false -auto-approve "${SCRIPT_DIR}/tfplan"

API_URL=$(terraform output -raw api_url)
CONTAINER_APP_NAME=$(terraform output -raw container_app_name)

log_info "Testing health endpoint..."
sleep 15
if curl -f -s "${API_URL}/health/live" >/dev/null; then
    log_info "✓ Health check passed: ${API_URL}/health/live"
else
    log_warn "Health check failed — container may still be starting. Check Container App logs for details."
fi

log_info "Exporting outputs to ${OUTPUT_FILE}..."
terraform output -json > "${OUTPUT_FILE}"

log_info "=========================================="
log_info "Stage 14 Deployment Complete"
log_info "=========================================="
log_info "Container App Name: ${CONTAINER_APP_NAME}"
log_info "API URL: ${API_URL}"
log_info "ACR Image: ${IMAGE_NAME}"
log_info "Auth Mode: none"
log_info "Backend Source: ${BACKEND_DIR}"
log_info "=========================================="
