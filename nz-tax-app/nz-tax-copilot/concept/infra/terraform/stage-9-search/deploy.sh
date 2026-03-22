#!/bin/bash
set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Trap errors and cleanup
trap 'echo -e "${RED}Deployment failed at line $LINENO${NC}"; exit 1' ERR

# Function to log messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed and logged in
log_info "Verifying Azure CLI authentication..."
if ! az account show &>/dev/null; then
    log_error "Azure CLI not logged in. Please run 'az login' first."
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
log_info "Using subscription: $SUBSCRIPTION_ID"

# Change to the script directory
cd "$(dirname "$0")"

# Check if dependent stages are deployed
log_info "Verifying prerequisite stages..."

REQUIRED_STAGES=(
    "../.terraform-state/stage1-foundation.tfstate"
    "../.terraform-state/stage2-networking.tfstate"
    "../.terraform-state/stage7-storage.tfstate"
    "../.terraform-state/stage8-openai.tfstate"
)

for state_file in "${REQUIRED_STAGES[@]}"; do
    if [ ! -f "$state_file" ]; then
        log_error "Required state file not found: $state_file"
        log_error "Please deploy the prerequisite stages first."
        exit 1
    fi
done

log_info "All prerequisite stages verified."

# Initialize Terraform
log_info "Initializing Terraform..."
terraform init -input=false

# Validate Terraform configuration
log_info "Validating Terraform configuration..."
terraform validate

# Check if this is a dry-run
DRY_RUN=${DRY_RUN:-false}

if [ "$DRY_RUN" = "true" ]; then
    log_info "DRY-RUN MODE: Generating plan only (no changes will be applied)"
    terraform plan -input=false
    log_info "Dry-run complete. Review the plan above."
    exit 0
fi

# Generate execution plan
log_info "Generating execution plan..."
terraform plan -input=false -out=tfplan

# Apply the plan
log_info "Applying Terraform plan..."
terraform apply -input=false tfplan

# Clean up plan file
rm -f tfplan

# Export outputs to JSON
log_info "Exporting stage outputs..."
terraform output -json > stage-9-outputs.json

# Extract key outputs for verification
SEARCH_SERVICE_NAME=$(terraform output -raw search_service_name)
SEARCH_SERVICE_ENDPOINT=$(terraform output -raw search_service_endpoint)
SEARCH_IDENTITY_PRINCIPAL_ID=$(terraform output -raw search_service_identity_principal_id)

log_info "Deployment completed successfully!"
echo ""
echo "=================================================="
echo "Stage 9: AI Search - Deployment Summary"
echo "=================================================="
echo "AI Search Service: $SEARCH_SERVICE_NAME"
echo "Service Endpoint: $SEARCH_SERVICE_ENDPOINT"
echo "Identity Principal ID: $SEARCH_IDENTITY_PRINCIPAL_ID"
echo ""

# Post-deployment verification
log_info "Verifying AI Search service accessibility via private endpoint..."
SEARCH_STATUS=$(az search service show \
    --name "$SEARCH_SERVICE_NAME" \
    --resource-group "$(terraform output -raw stage1_resource_group_name)" \
    --query "provisioningState" -o tsv 2>/dev/null || echo "Unknown")

if [ "$SEARCH_STATUS" = "Succeeded" ]; then
    echo -e "${GREEN}✓ AI Search service is provisioned and ready${NC}"
else
    log_warn "AI Search service status: $SEARCH_STATUS (expected: Succeeded)"
fi

# Verify role assignments with specific role names
log_info "Verifying RBAC role assignments (may take 1-2 minutes to propagate)..."

# Wait for role assignment propagation
sleep 10

# Verify Storage Blob Data Reader role
STORAGE_ROLE=$(az role assignment list \
    --assignee "$SEARCH_IDENTITY_PRINCIPAL_ID" \
    --scope "$(terraform output -raw stage7_storage_account_id)" \
    --role "Storage Blob Data Reader" \
    --query "[0].roleDefinitionName" -o tsv 2>/dev/null || echo "")

# Verify Cognitive Services OpenAI User role
OPENAI_ROLE=$(az role assignment list \
    --assignee "$SEARCH_IDENTITY_PRINCIPAL_ID" \
    --scope "$(terraform output -raw stage8_openai_account_id)" \
    --role "Cognitive Services OpenAI User" \
    --query "[0].roleDefinitionName" -o tsv 2>/dev/null || echo "")

if [ -n "$STORAGE_ROLE" ] && [ -n "$OPENAI_ROLE" ]; then
    echo -e "${GREEN}✓ Required role assignments verified:${NC}"
    echo "  - Storage Blob Data Reader: $STORAGE_ROLE"
    echo "  - Cognitive Services OpenAI User: $OPENAI_ROLE"
else
    log_warn "Role assignments may still be propagating. Detected:"
    [ -z "$STORAGE_ROLE" ] && echo "  - Storage Blob Data Reader: Not yet visible"
    [ -n "$STORAGE_ROLE" ] && echo "  - Storage Blob Data Reader: $STORAGE_ROLE"
    [ -z "$OPENAI_ROLE" ] && echo "  - Cognitive Services OpenAI User: Not yet visible"
    [ -n "$OPENAI_ROLE" ] && echo "  - Cognitive Services OpenAI User: $OPENAI_ROLE"
    log_warn "Role propagation can take 1-2 minutes. Verify with: az role assignment list --assignee $SEARCH_IDENTITY_PRINCIPAL_ID"
fi

echo ""
echo "=================================================="
echo "Next Steps:"
echo "=================================================="
echo "1. Create the 'ird-guidance' search index:"
echo "   $(terraform output -raw index_creation_command)"
echo ""
echo "2. Populate the index with IRD guidance documents:"
echo "   cd backend/scripts"
echo "   python populate_ird_guidance.py --search-service $SEARCH_SERVICE_NAME --index-name ird-guidance"
echo ""
echo "3. Verify index creation:"
echo "   az search index show --service-name $SEARCH_SERVICE_NAME --name ird-guidance"
echo ""
echo "   The backend API will use this AI Search service for IRD guidance queries."
echo "   Ensure the index is populated before deploying Stage 10 (Container Apps)."
echo "=================================================="