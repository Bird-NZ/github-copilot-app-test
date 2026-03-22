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

  # Local backend for POC multi-stage deployment
  backend "local" {
    path = "../.terraform-state/stage3-keyvault.tfstate"
  }
}

provider "azapi" {
  # Subscription set via az account or environment variable
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# Current Azure context
data "azurerm_client_config" "current" {}