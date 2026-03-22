#!/usr/bin/env bash
set -euo pipefail

# Stage 13: AI Search Index Deployment
# Creates the 'ird-guidance' vector search index in Azure AI Search

# Color output helpers
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

# Error handler
trap 'log_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

# Change to script directory
cd "$(dirname "$0")"

log_info "Starting Stage 13: AI Search Index deployment"

# ============================================================================
# Prerequisites Check
# ============================================================================

log_info "Checking prerequisites..."

# Check Azure CLI
if ! command -v az &> /dev/null; then
    log_error "Azure CLI not found. Install: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check jq
if ! command -v jq &> /dev/null; then
    log_error "jq not found. Install: sudo apt-get install jq"
    exit 1
fi

# Check Azure login
if ! az account show &> /dev/null; then
    log_error "Not logged in to Azure. Run: az login"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
log_info "Using subscription: $SUBSCRIPTION_ID"

# ============================================================================
# Load Stage 9 Outputs (AI Search Service)
# ============================================================================

log_info "Loading AI Search service name from Stage 9 outputs..."

STAGE9_DIR="../9-ai-search"
if [[ ! -f "$STAGE9_DIR/outputs.json" ]]; then
    log_error "Stage 9 outputs not found at $STAGE9_DIR/outputs.json"
    log_error "Deploy Stage 9 (AI Search service) first"
    exit 1
fi

SEARCH_SERVICE_NAME=$(jq -r '.search_service_name.value' "$STAGE9_DIR/outputs.json")

if [[ -z "$SEARCH_SERVICE_NAME" || "$SEARCH_SERVICE_NAME" == "null" ]]; then
    log_error "search_service_name not found in Stage 9 outputs"
    exit 1
fi

log_info "AI Search service: $SEARCH_SERVICE_NAME"

# ============================================================================
# Create AI Search Index
# ============================================================================

log_info "Creating 'ird-guidance' vector search index..."

INDEX_NAME="ird-guidance"

# Check if index already exists
if az search index show \
    --service-name "$SEARCH_SERVICE_NAME" \
    --name "$INDEX_NAME" &> /dev/null; then
    log_warn "Index '$INDEX_NAME' already exists. Skipping creation."
else
    # Create index using schema definition
    az search index create \
        --service-name "$SEARCH_SERVICE_NAME" \
        --name "$INDEX_NAME" \
        --fields @index-schema.json \
        --output none

    if [[ $? -eq 0 ]]; then
        log_info "Index '$INDEX_NAME' created successfully"
    else
        log_error "Failed to create index '$INDEX_NAME'"
        exit 1
    fi
fi

# ============================================================================
# Verify Index Creation
# ============================================================================

log_info "Verifying index creation..."

INDEX_INFO=$(az search index show \
    --service-name "$SEARCH_SERVICE_NAME" \
    --name "$INDEX_NAME" \
    --output json)

FIELD_COUNT=$(echo "$INDEX_INFO" | jq '.fields | length')
log_info "Index has $FIELD_COUNT fields defined"

# Check vector search configuration
VECTOR_PROFILES=$(echo "$INDEX_INFO" | jq -r '.vectorSearch.profiles[0].name // "none"')
if [[ "$VECTOR_PROFILES" != "none" ]]; then
    log_info "Vector search profile configured: $VECTOR_PROFILES"
else
    log_warn "No vector search profile found (check index-schema.json)"
fi

# Check semantic configuration
SEMANTIC_CONFIG=$(echo "$INDEX_INFO" | jq -r '.semantic.configurations[0].name // "none"')
if [[ "$SEMANTIC_CONFIG" != "none" ]]; then
    log_info "Semantic search configuration: $SEMANTIC_CONFIG"
else
    log_warn "No semantic configuration found (check index-schema.json)"
fi

# ============================================================================
# Export Outputs
# ============================================================================

log_info "Exporting outputs to outputs.json..."

cat > outputs.json <<EOF
{
  "search_service_name": {
    "value": "$SEARCH_SERVICE_NAME",
    "type": "string",
    "description": "AI Search service name (from Stage 9)"
  },
  "search_index_name": {
    "value": "$INDEX_NAME",
    "type": "string",
    "description": "IRD guidance vector search index name"
  },
  "search_index_endpoint": {
    "value": "https://${SEARCH_SERVICE_NAME}.search.windows.net/indexes/${INDEX_NAME}",
    "type": "string",
    "description": "Full index endpoint URL"
  },
  "vector_dimensions": {
    "value": 1536,
    "type": "number",
    "description": "Embedding dimensions (text-embedding-ada-002)"
  },
  "index_field_count": {
    "value": $FIELD_COUNT,
    "type": "number",
    "description": "Total number of fields in index"
  }
}
EOF

log_info "Outputs written to outputs.json"

# ============================================================================
# Deployment Summary
# ============================================================================

echo ""
log_info "=========================================="
log_info "Stage 13 Deployment Complete"
log_info "=========================================="
echo ""
echo "AI Search Index:      $INDEX_NAME"
echo "Service:              $SEARCH_SERVICE_NAME"
echo "Fields:               $FIELD_COUNT"
echo "Vector Profile:       $VECTOR_PROFILES"
echo "Semantic Config:      $SEMANTIC_CONFIG"
echo "Embedding Dimensions: 1536"
echo ""
log_info "Next Steps:"
echo "  1. Deploy Stage 14 (AI Search Index Population) to load IRD guidance documents"
echo "  2. Verify index statistics: az search index show-statistics --service-name $SEARCH_SERVICE_NAME --name $INDEX_NAME"
echo "  3. Query index: python query_test.py (see README.md for examples)"
echo ""
log_info "=========================================="