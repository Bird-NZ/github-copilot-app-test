#!/bin/bash
set -euo pipefail

# Stage 11: Container Apps Environment Deployment
# Purpose: Deploy Azure Container Apps Environment with VNET integration

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Stage 11: Container Apps Environment Deployment ===${NC}"

# Trap for error handling
trap 'echo -e "${RED}❌ Deployment failed at line $LINENO${NC}"; exit 1' ERR

# Check Azure CLI login
echo "Checking Azure CLI authentication..."
if ! az account show &>/dev/null; then
    echo -e "${RED}❌ Not logged in to Azure CLI. Run 'az login' first.${NC}"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✓ Authenticated to Azure subscription: ${SUBSCRIPTION_ID}${NC}"

# Load outputs from prior stages
echo "Loading outputs from prior stages..."

# Stage 1: Foundation (resource group, managed identity, Log Analytics)
STAGE1_DIR="../stage-1-foundation"
if [ ! -f "${STAGE1_DIR}/stage-1-outputs.json" ]; then
    echo -e "${RED}❌ Stage 1 outputs not found. Deploy Stage 1 first.${NC}"
    exit 1
fi

RESOURCE_GROUP_NAME=$(jq -r '.resource_group_name.value' "${STAGE1_DIR}/stage-1-outputs.json")
MANAGED_IDENTITY_ID=$(jq -r '.managed_identity_id.value' "${STAGE1_DIR}/stage-1-outputs.json")
MANAGED_IDENTITY_PRINCIPAL_ID=$(jq -r '.managed_identity_principal_id.value' "${STAGE1_DIR}/stage-1-outputs.json")
LOG_ANALYTICS_WORKSPACE_ID=$(jq -r '.log_analytics_workspace_id.value' "${STAGE1_DIR}/stage-1-outputs.json")
LOG_ANALYTICS_WORKSPACE_NAME=$(jq -r '.log_analytics_workspace_name.value' "${STAGE1_DIR}/stage-1-outputs.json")

echo -e "${GREEN}✓ Loaded Stage 1 outputs (Foundation)${NC}"

# Stage 2: Networking (VNET, subnets)
STAGE2_DIR="../stage-2-networking"
if [ ! -f "${STAGE2_DIR}/stage-2-outputs.json" ]; then
    echo -e "${RED}❌ Stage 2 outputs not found. Deploy Stage 2 first.${NC}"
    exit 1
fi

SUBNET_APPS_ID=$(jq -r '.subnet_apps_id.value' "${STAGE2_DIR}/stage-2-outputs.json")

echo -e "${GREEN}✓ Loaded Stage 2 outputs (Networking)${NC}"

# Validate prerequisites
echo "Validating prerequisites..."

# Check resource group exists
if ! az group show --name "${RESOURCE_GROUP_NAME}" &>/dev/null; then
    echo -e "${RED}❌ Resource group ${RESOURCE_GROUP_NAME} not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Resource group exists: ${RESOURCE_GROUP_NAME}${NC}"

# Check subnet exists
VNET_NAME=$(az network vnet subnet show --ids "${SUBNET_APPS_ID}" --query "{vnet:split(id, '/')[8]}" -o tsv)
SUBNET_NAME=$(az network vnet subnet show --ids "${SUBNET_APPS_ID}" --query name -o tsv)

if [ -z "${VNET_NAME}" ] || [ -z "${SUBNET_NAME}" ]; then
    echo -e "${RED}❌ Subnet ${SUBNET_APPS_ID} not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Subnet exists: ${VNET_NAME}/${SUBNET_NAME}${NC}"

# Initialize Terraform
echo "Initializing Terraform..."
terraform init -input=false

# Validate Terraform configuration
echo "Validating Terraform configuration..."
terraform validate

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
resource_group_name          = "${RESOURCE_GROUP_NAME}"
subnet_apps_id               = "${SUBNET_APPS_ID}"
log_analytics_workspace_id   = "${LOG_ANALYTICS_WORKSPACE_ID}"
log_analytics_workspace_name = "${LOG_ANALYTICS_WORKSPACE_NAME}"
managed_identity_id          = "${MANAGED_IDENTITY_ID}"
managed_identity_principal_id = "${MANAGED_IDENTITY_PRINCIPAL_ID}"
EOF

echo -e "${GREEN}✓ Created terraform.tfvars with Stage 1 and Stage 2 outputs${NC}"

# Plan deployment
echo "Planning Terraform deployment..."
terraform plan -input=false -var-file=terraform.tfvars -out=tfplan

# Apply deployment
echo -e "${YELLOW}Applying Terraform deployment...${NC}"
terraform apply -input=false tfplan

# Clean up plan file
rm -f tfplan

# Export outputs
echo "Exporting stage outputs..."
terraform output -json > stage-11-outputs.json

# Display outputs
echo -e "${GREEN}=== Stage 11 Deployment Complete ===${NC}"
echo ""
echo "Container Apps Environment:"
CAE_NAME=$(jq -r '.container_apps_environment_name.value' stage-11-outputs.json)
CAE_DOMAIN=$(jq -r '.container_apps_environment_default_domain.value' stage-11-outputs.json)
CAE_STATIC_IP=$(jq -r '.container_apps_environment_static_ip.value' stage-11-outputs.json)

echo -e "  Name: ${GREEN}${CAE_NAME}${NC}"
echo -e "  Default Domain: ${GREEN}${CAE_DOMAIN}${NC}"
echo -e "  Static IP: ${GREEN}${CAE_STATIC_IP}${NC}"
echo ""

# Verify deployment
echo "Verifying deployment..."

# Check Container Apps Environment exists
if az containerapp env show --name "${CAE_NAME}" --resource-group "${RESOURCE_GROUP_NAME}" &>/dev/null; then
    echo -e "${GREEN}✓ Container Apps Environment deployed successfully${NC}"
else
    echo -e "${RED}❌ Container Apps Environment verification failed${NC}"
    exit 1
fi

# Check VNET integration
CAE_SUBNET=$(az containerapp env show \
    --name "${CAE_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --query "properties.vnetConfiguration.infrastructureSubnetId" -o tsv)

if [ "${CAE_SUBNET}" == "${SUBNET_APPS_ID}" ]; then
    echo -e "${GREEN}✓ VNET integration configured correctly${NC}"
else
    echo -e "${YELLOW}⚠ VNET integration mismatch. Expected: ${SUBNET_APPS_ID}, Got: ${CAE_SUBNET}${NC}"
fi

# Check Log Analytics integration
CAE_LOG_WORKSPACE=$(az containerapp env show \
    --name "${CAE_NAME}" \
    --resource-group "${RESOURCE_GROUP_NAME}" \
    --query "properties.appLogsConfiguration.logAnalyticsConfiguration.customerId" -o tsv)

if [ -n "${CAE_LOG_WORKSPACE}" ]; then
    echo -e "${GREEN}✓ Log Analytics integration configured${NC}"
else
    echo -e "${YELLOW}⚠ Log Analytics integration not configured${NC}"
fi

echo ""
echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo "Stage: Container Apps Environment"
echo "Status: Complete"
echo "Resources Deployed:"
echo "  - Container Apps Environment (Consumption plan)"
echo "  - Diagnostic settings (system logs)"
echo ""
echo "Next Steps:"
echo "  1. Deploy Stage 12: Backend API Container App"
echo "  2. Configure container app secrets from Key Vault"
echo "  3. Enable health probes and autoscaling rules"
echo ""
echo -e "${GREEN}Outputs saved to: stage-11-outputs.json${NC}"