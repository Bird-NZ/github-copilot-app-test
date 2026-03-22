#!/bin/bash
set -euo pipefail

# Stage 7: Blob Storage Deployment Script
# Deploys Azure Blob Storage with private endpoint and managed identity

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_NAME="stage7-storage"
OUTPUT_FILE="${SCRIPT_DIR}/stage-7-outputs.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Error handler
trap 'echo -e "${RED}❌ Deployment failed at line $LINENO${NC}"; cleanup; exit 1' ERR

cleanup() {
  if [[ -f tfplan ]]; then
    rm -f tfplan
  fi
}

log_info() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# Check if running in dry-run mode
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  log_info "Running in dry-run mode (plan only, no apply)"
fi

# Verify Azure CLI is logged in
log_info "Checking Azure CLI authentication..."
if ! az account show &>/dev/null; then
  log_error "Not logged in to Azure CLI. Run 'az login' first."
  exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
log_info "Using subscription: ${SUBSCRIPTION_NAME} (${SUBSCRIPTION_ID})"

# Verify prerequisite stages completed
log_info "Verifying prerequisite stages..."
STAGE1_STATE="${SCRIPT_DIR}/../.terraform-state/stage1-foundation.tfstate"
STAGE2_STATE="${SCRIPT_DIR}/../.terraform-state/stage2-networking.tfstate"
STAGE3_STATE="${SCRIPT_DIR}/../.terraform-state/stage3-keyvault.tfstate"

if [[ ! -f "${STAGE1_STATE}" ]]; then
  log_error "Stage 1 (Foundation) state file not found. Deploy Stage 1 first."
  exit 1
fi

if [[ ! -f "${STAGE2_STATE}" ]]; then
  log_error "Stage 2 (Networking) state file not found. Deploy Stage 2 first."
  exit 1
fi

if [[ ! -f "${STAGE3_STATE}" ]]; then
  log_error "Stage 3 (Key Vault) state file not found. Deploy Stage 3 first."
  exit 1
fi

log_info "All prerequisite stages verified"

# Change to stage directory
cd "${SCRIPT_DIR}"

# Initialize Terraform
log_info "Initializing Terraform..."
terraform init -input=false

# Validate configuration
log_info "Validating Terraform configuration..."
terraform validate

# Format check
log_info "Checking Terraform formatting..."
if ! terraform fmt -check -recursive; then
  log_warn "Terraform files are not properly formatted. Run 'terraform fmt -recursive' to fix."
fi

if [[ "${DRY_RUN}" == "true" ]]; then
  # Dry run: plan only
  log_info "Generating execution plan (dry-run mode)..."
  terraform plan -input=false
  log_info "Dry-run complete. No changes applied."
  exit 0
fi

# Plan deployment
log_info "Planning deployment..."
terraform plan -input=false -out=tfplan

# Apply deployment
log_info "Applying deployment for ${STAGE_NAME}..."
terraform apply -input=false tfplan

# Export outputs to JSON
log_info "Exporting stage outputs..."
terraform output -json > "${OUTPUT_FILE}"

log_info "Stage 7 outputs exported to: ${OUTPUT_FILE}"

# Cleanup
cleanup

# Post-deployment verification
log_info "Running post-deployment verification..."

STORAGE_ACCOUNT_NAME=$(terraform output -raw storage_account_name)
CONTAINER_DOCUMENTS=$(terraform output -raw container_documents_name)
CONTAINER_EXPORTS=$(terraform output -raw container_exports_name)

# Verify storage account exists
if az storage account show --name "${STORAGE_ACCOUNT_NAME}" --resource-group "zd-rg-tax-dev-aue" &>/dev/null; then
  log_info "Storage account verified: ${STORAGE_ACCOUNT_NAME}"
else
  log_error "Storage account not found: ${STORAGE_ACCOUNT_NAME}"
  exit 1
fi

# Verify containers exist (using managed identity)
log_info "Verifying blob containers..."
if az storage container exists --account-name "${STORAGE_ACCOUNT_NAME}" --name "${CONTAINER_DOCUMENTS}" --auth-mode login &>/dev/null; then
  log_info "Container verified: ${CONTAINER_DOCUMENTS}"
else
  log_warn "Container not accessible yet: ${CONTAINER_DOCUMENTS} (may take a few moments for RBAC propagation)"
fi

if az storage container exists --account-name "${STORAGE_ACCOUNT_NAME}" --name "${CONTAINER_EXPORTS}" --auth-mode login &>/dev/null; then
  log_info "Container verified: ${CONTAINER_EXPORTS}"
else
  log_warn "Container not accessible yet: ${CONTAINER_EXPORTS} (may take a few moments for RBAC propagation)"
fi

# Verify private endpoint
PE_ID=$(terraform output -raw private_endpoint_id)
if az network private-endpoint show --ids "${PE_ID}" &>/dev/null; then
  log_info "Private endpoint verified: ${PE_ID}"
else
  log_error "Private endpoint not found: ${PE_ID}"
  exit 1
fi

log_info "Post-deployment verification complete"

echo ""
log_info "=========================================="
log_info "Stage 7: Blob Storage Deployment Complete"
log_info "=========================================="
echo ""
log_info "Storage Account: ${STORAGE_ACCOUNT_NAME}"
log_info "Containers: ${CONTAINER_DOCUMENTS}, ${CONTAINER_EXPORTS}"
log_info "Managed Identity: $(terraform output -raw managed_identity_client_id)"
log_info "Private Endpoint: Enabled in snet-data subnet"
log_info "Authentication: Managed identity only (shared key disabled)"
echo ""
log_info "Next steps:"
log_info "1. Deploy Stage 8 (Azure OpenAI) for AI guidance services"
log_info "2. Configure backend API to use this managed identity for blob operations"
log_info "3. Test document upload workflow with SAS token generation"
echo ""
log_info "Outputs saved to: ${OUTPUT_FILE}"