terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azapi = {
      source  = "azure/azapi"
      version = "~> 2.8.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0, < 5.0"
    }
  }

  # Local state for POC (no remote backend required)
  # Production: Configure backend "azurerm" with actual storage account
  backend "local" {
    path = "../.terraform-state/stage-1-foundation.tfstate"
  }
}

provider "azapi" {
  # No additional configuration needed
}

provider "azurerm" {
  features {}
  
  # Subscription set via az account or environment variables
  # override with var.subscription_id when explicitly provided
  subscription_id = var.subscription_id
}