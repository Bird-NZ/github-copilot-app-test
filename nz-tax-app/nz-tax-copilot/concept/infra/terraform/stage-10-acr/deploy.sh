#!/bin/bash
set -euo pipefail

# Stage 10: Container Registry Deployment Script
# This script deploys Azure Container Registry with private endpoint

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_NAME="stage-10-acr"
STATE_DIR="${SCRIPT_DIR}/../.terraform-state"

# Colors for output
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

# Error handler
cleanup_on_error() {
    local exit_code=$?
    log_error "Deployment failed with exit code ${exit_code}"
    log_info "Cleaning up temporary files..."
    rm -f tfplan
    exit "${exit_code}"
}

trap cleanup_on_error ERR

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Container Registry (Stage 10)

OPTIONS:
    -h, --help          Show this help message
    --dry-run           Plan only, do not apply changes
    --destroy           Destroy resources (reverse deployment)
    --auto-approve      Skip confirmation prompts

EXAMPLES:
    $0                  # Deploy with confirmation
    $0 --dry-run        # Preview changes only
    $0 --auto-approve   # Deploy without confirmation
    $0 --destroy        # Destroy resources

EOF
    exit 0
}

# Parse arguments
DRY_RUN=false
DESTROY=false
AUTO_APPROVE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --destroy)
            DESTROY=true
            shift
            ;;
        --auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Check Azure CLI authentication
log_info "Checking Azure CLI authentication..."
if ! az account show &> /dev/null; then
    log_error "Not logged in to Azure CLI. Run 'az login' first."
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
log_info "Using subscription: ${SUBSCRIPTION_NAME} (${SUBSCRIPTION_ID})"

# Verify prerequisite stages
log_info "Verifying prerequisite stages..."
REQUIRED_STAGES=("stage1-foundation" "stage2-networking")

for stage in "${REQUIRED_STAGES[@]}"; do
    STATE_FILE="${STATE_DIR}/${stage}.tfstate"
    if [[ ! -f "${STATE_FILE}" ]]; then
        log_error "Prerequisite stage not found: ${stage}"
        log_error "State file missing: ${STATE_FILE}"
        log_error "Please deploy ${stage} before deploying ${STAGE_NAME}"
        exit 1
    fi
    log_info "✓ Prerequisite verified: ${stage}"
done

# Create state directory if it doesn't exist
mkdir -p "${STATE_DIR}"

# Initialize Terraform
log_info "Initializing Terraform..."
terraform init -input=false

# Validate configuration
log_info "Validating Terraform configuration..."
terraform validate

if [[ "${DRY_RUN}" == "true" ]]; then
    log_info "Dry-run mode: Planning changes only..."
    terraform plan -input=false
    log_info "Dry-run complete. No changes applied."
    exit 0
fi

if [[ "${DESTROY}" == "true" ]]; then
    log_warn "DESTROY MODE: This will delete all Container Registry resources."
    
    if [[ "${AUTO_APPROVE}" == "false" ]]; then
        read -p "Are you sure you want to destroy? Type 'yes' to confirm: " confirm
        if [[ "${confirm}" != "yes" ]]; then
            log_info "Destroy cancelled."
            exit 0
        fi
    fi
    
    log_info "Planning destroy..."
    terraform plan -destroy -input=false -out=tfplan
    
    log_info "Destroying resources..."
    terraform apply -input=false tfplan
    
    rm -f tfplan
    log_info "Destroy complete."
    exit 0
fi

# Plan deployment
log_info "Planning deployment..."
terraform plan -input=false -out=tfplan

# Confirm apply
if [[ "${AUTO_APPROVE}" == "false" ]]; then
    read -p "Apply this plan? Type 'yes' to confirm: " confirm
    if [[ "${confirm}" != "yes" ]]; then
        log_info "Deployment cancelled."
        rm -f tfplan
        exit 0
    fi
fi

# Apply deployment
log_info "Applying deployment..."
terraform apply -input=false tfplan

# Cleanup plan file
rm -f tfplan

# Export outputs
log_info "Exporting outputs..."
terraform output -json > "${STATE_DIR}/${STAGE_NAME}-outputs.json"

log_info "Deployment complete!"
log_info "Outputs saved to: ${STATE_DIR}/${STAGE_NAME}-outputs.json"

# Display key outputs
echo ""
log_info "Key Outputs:"
echo "  ACR Login Server: $(terraform output -raw acr_login_server)"
echo "  ACR Name: $(terraform output -raw acr_name)"
echo ""

# Post-deployment verification
log_info "Verifying deployment..."

ACR_NAME=$(terraform output -raw acr_name)

# Verify ACR exists
if az acr show --name "${ACR_NAME}" &> /dev/null; then
    log_info "✓ Container Registry verified: ${ACR_NAME}"
else
    log_error "✗ Container Registry not found: ${ACR_NAME}"
    exit 1
fi

# Verify private endpoint
PE_STATUS=$(az network private-endpoint show \
    --name "pe-acr-${var.project}" \
    --resource-group "zd-rg-tax-dev-aue" \
    --query 'provisioningState' -o tsv 2>/dev/null || echo "NotFound")

if [[ "${PE_STATUS}" == "Succeeded" ]]; then
    log_info "✓ Private endpoint verified"
else
    log_warn "⚠ Private endpoint status: ${PE_STATUS}"
fi

# Display next steps
echo ""
log_info "Next Steps:"
echo "  1. Build container image: cd ../../backend && docker build -t ${ACR_NAME}.azurecr.io/api:latest ."
echo "  2. Push to ACR: az acr login --name ${ACR_NAME} && docker push ${ACR_NAME}.azurecr.io/api:latest"
echo "  3. Deploy Stage 11 (Container Apps Environment)"
echo ""