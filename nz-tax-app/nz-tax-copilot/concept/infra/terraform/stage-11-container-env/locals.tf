locals {
  # Naming convention: microsoft-alz pattern
  # {zoneid}-{type}-{service}-{env}-{region_short}
  region_short = "aue" # australiaeast

  # Container Apps Environment name
  cae_name = "zd-cae-${var.project}-${var.environment}-${local.region_short}"
}