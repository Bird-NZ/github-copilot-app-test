#!/bin/bash
set -euo pipefail

# Stage 5: SQL Database Deployment Script
# Deploys Azure SQL Server and Database with private endpoint and Entra-only authentication

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="../.terraform-state"
OUTPUT_FILE="stage-5-sql-outputs.json"

# Error handling
trap 'echo -e "${RED}❌ Deployment failed at line $LINENO${NC}"; cleanup_on_error' ERR

cleanup_on_error() {
    echo -e "${YELLOW}⚠️  Cleaning up temporary files...${NC}"
    rm -f tfplan
    exit 1
}

# Preflight checks
echo -e "${GREEN}🔍 Running preflight checks...${NC}"

# Check Azure CLI login
if ! az account show &>/dev/null; then
    echo -e "${RED}❌ Not logged in to Azure CLI${NC}"
    echo "Please run: az login"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✓ Logged in to Azure subscription: ${SUBSCRIPTION_ID}${NC}"

# Verify previous stages completed
if [ ! -f "${STATE_DIR}/stage1-foundation.tfstate" ]; then
    echo -e "${RED}❌ Stage 1 (Foundation) not completed${NC}"
    echo "Please deploy Stage 1 first"
    exit 1
fi

if [ ! -f "${STATE_DIR}/stage2-networking.tfstate" ]; then
    echo -e "${RED}❌ Stage 2 (Networking) not completed${NC}"
    echo "Please deploy Stage 2 first"
    exit 1
fi

echo -e "${GREEN}✓ Previous stages validated${NC}"

# Check for required variable: sql_admin_group_id
if [ -z "${TF_VAR_sql_admin_group_id:-}" ]; then
    echo -e "${YELLOW}⚠️  SQL admin group ID not set${NC}"
    echo "Please set TF_VAR_sql_admin_group_id environment variable"
    echo "Example: export TF_VAR_sql_admin_group_id=\$(az ad group show --group nz-tax-copilot-sql-admins --query id -o tsv)"
    exit 1
fi

echo -e "${GREEN}✓ SQL admin group ID configured: ${TF_VAR_sql_admin_group_id}${NC}"

# Initialize Terraform
echo -e "${GREEN}📦 Initializing Terraform...${NC}"
terraform init -input=false

# Validate configuration
echo -e "${GREEN}✅ Validating Terraform configuration...${NC}"
terraform validate

# Format check
echo -e "${GREEN}🎨 Checking Terraform formatting...${NC}"
terraform fmt -check -recursive || {
    echo -e "${YELLOW}⚠️  Formatting issues found. Run 'terraform fmt -recursive' to fix${NC}"
}

# Plan deployment
echo -e "${GREEN}📋 Planning deployment...${NC}"
terraform plan -input=false -out=tfplan

# Prompt for confirmation (skip if --auto-approve flag present)
if [[ "${1:-}" != "--auto-approve" ]]; then
    echo -e "${YELLOW}⚠️  Review the plan above${NC}"
    read -p "Do you want to apply this plan? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        rm -f tfplan
        exit 0
    fi
fi

# Apply deployment
echo -e "${GREEN}🚀 Applying deployment...${NC}"
terraform apply -input=false tfplan

# Export outputs to JSON
echo -e "${GREEN}💾 Exporting outputs...${NC}"
terraform output -json > "${OUTPUT_FILE}"

echo -e "${GREEN}✓ Outputs saved to ${OUTPUT_FILE}${NC}"

# Cleanup
rm -f tfplan

# Display key outputs
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 Deployment Summary${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

SQL_SERVER_NAME=$(terraform output -raw sql_server_name)
SQL_SERVER_FQDN=$(terraform output -raw sql_server_fqdn)
SQL_DATABASE_NAME=$(terraform output -raw sql_database_name)
PRIVATE_ENDPOINT_IP=$(terraform output -raw private_endpoint_ip)

echo -e "SQL Server Name:    ${GREEN}${SQL_SERVER_NAME}${NC}"
echo -e "SQL Server FQDN:    ${GREEN}${SQL_SERVER_FQDN}${NC}"
echo -e "Database Name:      ${GREEN}${SQL_DATABASE_NAME}${NC}"
echo -e "Private IP:         ${GREEN}${PRIVATE_ENDPOINT_IP}${NC}"
echo -e "Authentication:     ${GREEN}Microsoft Entra ID Only${NC}"
echo -e ""

# Post-deployment verification
echo -e "${GREEN}🔍 Running post-deployment verification...${NC}"

# Verify SQL Server exists
if az sql server show --name "${SQL_SERVER_NAME}" --resource-group "$(terraform output -raw resource_group_name)" &>/dev/null; then
    echo -e "${GREEN}✓ SQL Server verified${NC}"
else
    echo -e "${RED}❌ SQL Server verification failed${NC}"
    exit 1
fi

# Verify SQL Database exists
if az sql db show --name "${SQL_DATABASE_NAME}" --server "${SQL_SERVER_NAME}" --resource-group "$(terraform output -raw resource_group_name)" &>/dev/null; then
    echo -e "${GREEN}✓ SQL Database verified${NC}"
else
    echo -e "${RED}❌ SQL Database verification failed${NC}"
    exit 1
fi

# Verify private endpoint connection
PE_STATE=$(az network private-endpoint show \
    --name "pe-sql-${var.project}-${var.environment}-${local.region_short}" \
    --resource-group "$(terraform output -raw resource_group_name)" \
    --query "privateLinkServiceConnections[0].privateLinkServiceConnectionState.status" -o tsv 2>/dev/null || echo "Unknown")

if [[ "$PE_STATE" == "Approved" ]]; then
    echo -e "${GREEN}✓ Private endpoint connection approved${NC}"
else
    echo -e "${YELLOW}⚠️  Private endpoint connection state: ${PE_STATE}${NC}"
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Stage 5 deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "1. Create contained database user for managed identity:"
echo -e "   ${GREEN}sqlcmd -S ${SQL_SERVER_FQDN} -d ${SQL_DATABASE_NAME} -G -Q \"CREATE USER [container-app-name] FROM EXTERNAL PROVIDER; ALTER ROLE db_datareader ADD MEMBER [container-app-name]; ALTER ROLE db_datawriter ADD MEMBER [container-app-name];\"${NC}"
echo -e ""
echo -e "2. Run database schema migrations:"
echo -e "   ${GREEN}cd ../../backend && alembic upgrade head${NC}"
echo -e ""
echo -e "3. Proceed to Stage 6: Cosmos DB deployment"
echo -e ""