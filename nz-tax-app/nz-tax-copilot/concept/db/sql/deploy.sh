#!/bin/bash
# ============================================================================
# NZ Tax Copilot - Stage 12: SQL Schema Deployment
# ============================================================================
# Purpose: Deploy SQL schema to Azure SQL Database
# Authentication: Uses Entra ID (Azure AD) authentication via az login
# Prerequisites: Azure CLI logged in, SQL Database deployed (Stage 5)
# ============================================================================

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================
STAGE_NAME="Stage 12: SQL Schema"
RESOURCE_GROUP="zd-rg-tax-dev-aue"
SQL_SERVER="zd-sql-tax-dev-aue"
SQL_DATABASE="TaxCopilotDB"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_SCRIPT="${SCRIPT_DIR}/001_create_schema.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error trap
trap 'log_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

# ============================================================================
# Pre-flight Checks
# ============================================================================
log_info "Starting ${STAGE_NAME} deployment"
log_info "======================================================================"

# Check Azure CLI login
log_info "Checking Azure CLI login status..."
if ! az account show &>/dev/null; then
    log_error "Not logged into Azure CLI. Run 'az login' first."
    exit 1
fi

ACCOUNT_NAME=$(az account show --query name -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
log_info "Logged in as: ${ACCOUNT_NAME}"
log_info "Subscription: ${SUBSCRIPTION_ID}"

# Check SQL script exists
if [[ ! -f "${SQL_SCRIPT}" ]]; then
    log_error "SQL script not found: ${SQL_SCRIPT}"
    exit 1
fi

# Check SQL Server exists
log_info "Verifying SQL Server exists..."
if ! az sql server show \
    --resource-group "${RESOURCE_GROUP}" \
    --name "${SQL_SERVER}" \
    --query name -o tsv &>/dev/null; then
    log_error "SQL Server '${SQL_SERVER}' not found. Run Stage 5 first."
    exit 1
fi

# Check SQL Database exists
log_info "Verifying SQL Database exists..."
if ! az sql db show \
    --resource-group "${RESOURCE_GROUP}" \
    --server "${SQL_SERVER}" \
    --name "${SQL_DATABASE}" \
    --query name -o tsv &>/dev/null; then
    log_error "SQL Database '${SQL_DATABASE}' not found. Run Stage 5 first."
    exit 1
fi

# ============================================================================
# Deployment
# ============================================================================
log_info "Deploying SQL schema to ${SQL_DATABASE}..."

# Execute SQL script using az sql db invoke
# This uses Entra ID authentication via az login (no username/password required)
az sql db query \
    --server "${SQL_SERVER}" \
    --database "${SQL_DATABASE}" \
    --query-file "${SQL_SCRIPT}" \
    --auth-type ActiveDirectoryDefault

if [[ $? -eq 0 ]]; then
    log_info "SQL schema deployed successfully"
else
    log_error "SQL schema deployment failed"
    exit 1
fi

# ============================================================================
# Verification
# ============================================================================
log_info "Verifying table creation..."

# Query to list all tables
VERIFY_QUERY="SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"

TABLES=$(az sql db query \
    --server "${SQL_SERVER}" \
    --database "${SQL_DATABASE}" \
    --query "[].columnName" \
    --query-text "${VERIFY_QUERY}" \
    --auth-type ActiveDirectoryDefault -o tsv)

if [[ -z "${TABLES}" ]]; then
    log_error "No tables found after schema deployment"
    exit 1
fi

log_info "Tables created:"
echo "${TABLES}" | while read -r table; do
    log_info "  - ${table}"
done

# Verify reference data
log_info "Verifying reference data..."

INCOME_TYPES_COUNT=$(az sql db query \
    --server "${SQL_SERVER}" \
    --database "${SQL_DATABASE}" \
    --query-text "SELECT COUNT(*) AS cnt FROM IncomeTypeMappings" \
    --auth-type ActiveDirectoryDefault -o tsv | tail -n 1)

IR3_CODES_COUNT=$(az sql db query \
    --server "${SQL_SERVER}" \
    --database "${SQL_DATABASE}" \
    --query-text "SELECT COUNT(*) AS cnt FROM IR3BoxCodes" \
    --auth-type ActiveDirectoryDefault -o tsv | tail -n 1)

log_info "Reference data counts:"
log_info "  - IncomeTypeMappings: ${INCOME_TYPES_COUNT} rows"
log_info "  - IR3BoxCodes: ${IR3_CODES_COUNT} rows"

if [[ "${INCOME_TYPES_COUNT}" -lt 5 ]] || [[ "${IR3_CODES_COUNT}" -lt 5 ]]; then
    log_error "Reference data not populated correctly"
    exit 1
fi

# ============================================================================
# Export Outputs
# ============================================================================
log_info "Exporting deployment outputs..."

# Create outputs directory if it doesn't exist
mkdir -p "${SCRIPT_DIR}/outputs"

# Export outputs to JSON
cat > "${SCRIPT_DIR}/outputs/outputs.json" <<EOF
{
  "schema_version": "1.0",
  "deployment_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "tables_created": $(echo "${TABLES}" | jq -R -s -c 'split("\n") | map(select(length > 0))'),
  "reference_data": {
    "income_types_count": ${INCOME_TYPES_COUNT},
    "ir3_codes_count": ${IR3_CODES_COUNT}
  }
}
EOF

log_info "Outputs exported to ${SCRIPT_DIR}/outputs/outputs.json"

# ============================================================================
# Success
# ============================================================================
log_info "======================================================================"
log_info "${STAGE_NAME} deployment completed successfully"
log_info "======================================================================"
log_info ""
log_info "Next steps:"
log_info "  1. Review outputs in ${SCRIPT_DIR}/outputs/outputs.json"
log_info "  2. Verify database schema via Azure Portal (SQL Query Editor)"
log_info "  3. Proceed to application deployment stages"
log_info ""