#!/bin/bash
set -euo pipefail

# Stage 2: Storage Deployment Script
# Deploys storage account, blob container, managed identity, and RBAC role assignment
# Dependencies: Stage 1 (Foundation) must be deployed first

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_NAME="stage-2-storage"
STATE_FILE="terraform.tfstate"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    log_error "Deployment failed with exit code $exit_code"
    log_info "Check terraform.log for detailed error messages"
  fi
  rm -f tfplan
}

trap cleanup EXIT

# Parse command-line arguments
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  log_info "Running in dry-run mode (plan only, no apply)"
fi

log_info "=========================================="
log_info "Stage 2: Storage Deployment"
log_info "=========================================="

# Preflight checks
log_info "Running preflight checks..."

# Check Azure CLI authentication
if ! az account show &>/dev/null; then
  log_error "Not logged in to Azure CLI. Run 'az login' first."
  exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
log_info "Using Azure subscription: $SUBSCRIPTION_ID"

# Check Stage 1 state file exists
STAGE1_STATE="../stage-1-foundation/terraform.tfstate"
if [ ! -f "$STAGE1_STATE" ]; then
  log_error "Stage 1 state file not found: $STAGE1_STATE"
  log_error "Deploy Stage 1 (Foundation) before Stage 2"
  exit 1
fi

log_info "Stage 1 state file found: $STAGE1_STATE"

# Initialize Terraform
log_info "Initializing Terraform..."
terraform init -input=false -upgrade

# Validate Terraform configuration
log_info "Validating Terraform configuration..."
terraform validate

# Format check
log_info "Checking Terraform formatting..."
if ! terraform fmt -check -recursive; then
  log_warn "Terraform files are not properly formatted. Run 'terraform fmt -recursive' to fix."
fi

# Plan deployment
log_info "Planning deployment..."
terraform plan \
  -var="subscription_id=$SUBSCRIPTION_ID" \
  -out=tfplan

if [ "$DRY_RUN" = true ]; then
  log_info "Dry-run complete. Terraform plan saved to tfplan (not applied)."
  exit 0
fi

# Prompt for confirmation
echo ""
read -p "Deploy Stage 2 resources? (yes/no): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy][Ee][Ss]$ ]]; then
  log_warn "Deployment cancelled by user"
  exit 0
fi

# Apply deployment
log_info "Applying Terraform plan..."
terraform apply -input=false tfplan

# Clean up plan file
rm -f tfplan

# Export outputs
log_info "Exporting outputs to stage-2-outputs.json..."
terraform output -json > stage-2-outputs.json

# Wait for RBAC propagation (critical for Stage 3)
log_warn "Waiting 60 seconds for RBAC role assignment propagation..."
log_warn "Stage 3 deployment may fail with 403 errors if executed immediately."
sleep 60

# Validation checks
log_info "Running post-deployment validation..."

STORAGE_ACCOUNT=$(terraform output -raw storage_account_name)
CONTAINER_NAME=$(terraform output -raw storage_container_name)
IDENTITY_NAME="zd-id-helloworld-dev-aue"
RESOURCE_GROUP=$(terraform output -json | jq -r '.storage_account_id.value' | cut -d'/' -f5)

# Verify storage account exists
if az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  log_info "✓ Storage account exists: $STORAGE_ACCOUNT"
else
  log_error "✗ Storage account not found: $STORAGE_ACCOUNT"
  exit 1
fi

# Verify blob container exists
if az storage container show \
  --name "$CONTAINER_NAME" \
  --account-name "$STORAGE_ACCOUNT" \
  --auth-mode login &>/dev/null; then
  log_info "✓ Blob container exists: $CONTAINER_NAME"
else
  log_error "✗ Blob container not found: $CONTAINER_NAME"
  exit 1
fi

# Verify managed identity exists
if az identity show --name "$IDENTITY_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  PRINCIPAL_ID=$(terraform output -raw managed_identity_principal_id)
  log_info "✓ Managed identity exists: $IDENTITY_NAME (Principal ID: $PRINCIPAL_ID)"
else
  log_error "✗ Managed identity not found: $IDENTITY_NAME"
  exit 1
fi

# Verify RBAC role assignment
STORAGE_ACCOUNT_ID=$(terraform output -raw storage_account_id)
if az role assignment list \
  --assignee "$PRINCIPAL_ID" \
  --scope "$STORAGE_ACCOUNT_ID" \
  --query "[?roleDefinitionName=='Storage Blob Data Contributor']" \
  -o tsv | grep -q .; then
  log_info "✓ RBAC role assignment exists: Storage Blob Data Contributor"
else
  log_error "✗ RBAC role assignment not found"
  log_error "Stage 3 will fail with 403 errors. Check role assignment manually."
  exit 1
fi

log_info "=========================================="
log_info "Stage 2 deployment complete!"
log_info "=========================================="
log_info ""
log_info "Next steps:"
log_info "  1. Review stage-2-outputs.json for exported values"
log_info "  2. Wait 2-3 minutes for full RBAC propagation (recommended)"
log_info "  3. Deploy Stage 3 (Function App):"
log_info "     cd ../stage-3-function"
log_info "     ./deploy.sh"
log_info ""
log_info "Resources deployed:"
log_info "  - Storage Account: $STORAGE_ACCOUNT"
log_info "  - Blob Container: $CONTAINER_NAME"
log_info "  - Managed Identity: $IDENTITY_NAME"
log_info "  - RBAC Role: Storage Blob Data Contributor"