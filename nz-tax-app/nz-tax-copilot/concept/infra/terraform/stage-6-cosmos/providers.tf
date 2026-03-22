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

  backend "local" {
    path = "../.terraform-state/stage6-cosmos.tfstate"
  }
}

provider "azapi" {}

provider "azurerm" {
  features {}
}