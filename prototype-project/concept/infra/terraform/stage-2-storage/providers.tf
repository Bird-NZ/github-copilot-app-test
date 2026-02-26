terraform {
  required_version = ">= 1.9.0"
  
  required_providers {
    azapi = {
      source  = "azure/azapi"
      version = "~> 2.8.0"
    }
  }
  
  # Local backend for POC/prototype deployments
  # State file: terraform.tfstate in this directory
  # For production, migrate to remote backend (Azure Storage)
}

provider "azapi" {
  subscription_id = var.subscription_id
}