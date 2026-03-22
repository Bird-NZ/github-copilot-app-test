# Stage 16: IRD Guidance Data Ingestion
#
# This stage does NOT create Azure resources via Terraform.
# It provides a Python script for ingesting IRD guidance documents into AI Search.
#
# The script uses managed identity from Stage 1 to authenticate to:
# - Azure OpenAI (for embedding generation)
# - AI Search (for document upload)
#
# Execute the script via deploy.sh or manually after all prior stages are deployed.

# No azapi_resource blocks required.
# All necessary Azure resources (OpenAI, AI Search, index) are created in prior stages.