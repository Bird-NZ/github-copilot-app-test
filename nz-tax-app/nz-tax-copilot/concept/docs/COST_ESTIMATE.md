# NZ Tax Copilot - Azure Cost Estimation

## Cost Summary

| Service | Small ($/mo) | Medium ($/mo) | Large ($/mo) |
|---------|--------------|---------------|--------------|
| **Compute** |
| Container Apps Environment | $0 | $0 | $0 |
| Container Apps (API) | $30 | $100 | $300 |
| Container Registry | $5 | $20 | $100 |
| **Data Services** |
| Azure SQL Database | $15 | $200 | $1,200 |
| Cosmos DB | $25 | $100 | $400 |
| Blob Storage | $10 | $30 | $100 |
| **AI Services** |
| Azure OpenAI | $30 | $150 | $500 |
| AI Search | $75 | $250 | $1,000 |
| **Networking** |
| Virtual Network | $0 | $0 | $0 |
| Private Endpoints (6) | $10 | $10 | $10 |
| NSG Flow Logs | $5 | $10 | $20 |
| **Security & Monitoring** |
| Key Vault | $5 | $5 | $5 |
| Log Analytics | $75 | $200 | $500 |
| Application Insights | Included in Log Analytics | Included | Included |
| **TOTAL** | **$285** | **$1,075** | **$4,135** |

---

## T-Shirt Size Definitions

### Compute Services

#### Container Apps Environment
- **Small**: Consumption plan, 1-3 replicas, external ingress only
- **Medium**: Consumption plan, 5-10 replicas, basic health probes
- **Large**: Dedicated (Workload Profiles) plan, 10-20 replicas, zone redundancy

#### Container Apps (Backend API)
- **Small**: 0.5 vCPU, 1 GB RAM, 1 replica always-on (~730 hours/month)
- **Medium**: 1 vCPU, 2 GB RAM, 5 replicas average (~3,650 vCPU-hours/month)
- **Large**: 2 vCPU, 4 GB RAM, 15 replicas average (~21,900 vCPU-hours/month)

**Pricing**: $0.000012/vCPU-second + $0.000003/GB-second

#### Container Registry
- **Small**: Basic SKU (10 GB storage, 100 GB bandwidth)
- **Medium**: Standard SKU (100 GB storage, 500 GB bandwidth)
- **Large**: Premium SKU (500 GB storage, geo-replication)

---

### Data Services

#### Azure SQL Database
- **Small**: Serverless, 0.5-2 vCores, 32 GB storage, auto-pause enabled
- **Medium**: Business Critical, 2 vCores, 128 GB storage, zone-redundant
- **Large**: Business Critical, 8 vCores, 512 GB storage, geo-replicated

**Pricing Notes**: 
- Small assumes 50% idle time (auto-pause)
- Medium/Large are provisioned compute (24/7 availability)

#### Cosmos DB
- **Small**: Serverless, session consistency, 150K RU/month consumption
- **Medium**: Provisioned 400 RU/s autoscale, session consistency
- **Large**: Provisioned 2,000 RU/s autoscale, strong consistency, multi-region

**Pricing**: 
- Serverless: $0.28 per million RU
- Provisioned: ~$0.07/hour per 100 RU/s

#### Blob Storage
- **Small**: LRS Hot tier, 50 GB storage, 100 GB egress
- **Medium**: ZRS Hot tier, 200 GB storage, 500 GB egress
- **Large**: GZRS Hot tier, 1 TB storage, 2 TB egress

**Pricing**: Storage ($0.0184/GB-month) + egress ($0.087/GB after first 100 GB free)

---

### AI Services

#### Azure OpenAI
- **Small**: 10K TPM quota, 100K tokens/day usage (~3M tokens/month)
  - GPT-4o: $0.005/1K input, $0.015/1K output
  - Embeddings: $0.0001/1K tokens
- **Medium**: 60K TPM quota, 500K tokens/day usage (~15M tokens/month)
- **Large**: 240K TPM quota (Provisioned Throughput Units), 2M tokens/day usage (~60M tokens/month)

**Usage Assumptions**:
- Small: 50 guidance queries/day × 2K tokens/query
- Medium: 250 queries/day × 2K tokens/query
- Large: 1,000 queries/day × 2K tokens/query

#### AI Search
- **Small**: Basic SKU, 1 replica, 1 partition, 2 GB index size
- **Medium**: Standard S1, 2 replicas, 2 partitions, 25 GB per partition
- **Large**: Standard S2, 3 replicas, 4 partitions, 100 GB per partition, semantic ranking enabled

**Pricing**: 
- Basic: $75/month fixed
- Standard S1: $250/month + semantic ranking queries ($2/1000 queries)
- Standard S2: $1,000/month + semantic ranking queries

---

### Networking

#### Virtual Network
- **All Sizes**: Free (no charge for VNET itself)
- **NSGs**: Free
- **Private Endpoints**: $0.01/hour per endpoint × 6 endpoints × 730 hours = ~$44/month

**Note**: Private endpoint pricing simplified to $10/month for estimates (actual: ~$7.30/endpoint/month)

#### NSG Flow Logs
- **Small**: 30-day retention, 10 GB/month ingestion
- **Medium**: 30-day retention, 30 GB/month ingestion
- **Large**: 90-day retention, 100 GB/month ingestion

**Pricing**: Storage ($0.02/GB-month) + Traffic Analytics processing ($0.10/GB)

---

### Security & Monitoring

#### Key Vault
- **All Sizes**: Standard SKU ($0.03 per 10K operations)
- Small/Medium/Large same cost (operation count negligible for prototype)

#### Log Analytics
- **Small**: 30-day retention, 30 GB/month ingestion (~1 GB/day)
- **Medium**: 90-day retention, 200 GB/month ingestion (~6.5 GB/day)
- **Large**: 90-day retention, 500 GB/month ingestion (~16 GB/day)

**Pricing**: $2.30/GB ingestion + $0.10/GB-month retention (first 31 days free)

#### Application Insights
- **Workspace-based model**: Included in Log Analytics ingestion costs
- No additional charge (telemetry counted toward Log Analytics GB/month)

---

## Assumptions and Notes

### Consumption-Based Services

**Azure OpenAI**:
- Actual cost depends on query volume and token usage
- Small estimate: 50 queries/day × 30 days × 2K tokens/query × $0.005 (input) + $0.015 (output) = ~$30/month
- Large workloads may benefit from Provisioned Throughput Units (PTU) for predictable costs

**Container Apps**:
- Consumption plan charges per vCPU-second and GB-second consumed
- Small estimate assumes 1 replica always-on (730 hours/month) × 0.5 vCPU × 1 GB
- Actual costs scale linearly with replica count and resource allocation

**Cosmos DB Serverless**:
- Charged per Request Unit (RU) consumed
- Small estimate: 150K RU/month × $0.28 per million RU = ~$42/month
- Actual cost depends on query complexity and frequency

**Blob Storage**:
- Charges for storage (GB-month) + transactions (per 10K operations) + egress (GB transferred out)
- Small estimate: 50 GB storage + 100 GB egress
- Large file uploads or frequent downloads increase costs

**AI Search**:
- Basic/Standard tiers are fixed monthly costs
- Semantic ranking queries add $2 per 1,000 queries (only for Standard SKU)
- Large deployments may need multiple search units (replicas × partitions)

---

## Cost Optimization Tips

### Reserved Instances & Savings Plans
- **SQL Database**: 1-year reserved instance saves ~40% (Business Critical tier)
- **Cosmos DB**: 1-year reserved capacity saves ~30% (provisioned throughput only)
- **Container Apps**: Workload Profiles plan supports reserved capacity (Large only)

### Scaling Adjustments
- **SQL Database**: Use serverless tier for dev/test (auto-pause reduces idle costs)
- **Cosmos DB**: Start with serverless, migrate to provisioned when consistent load exceeds break-even (~400 RU/s sustained)
- **Container Apps**: Consumption plan scales to zero when idle (Small/Medium recommended for variable workloads)

### Storage Optimization
- **Blob Storage**: Implement lifecycle management (move to Cool tier after 90 days, Archive after 1 year)
- **Log Analytics**: Set daily cap (5 GB/day for Small, 50 GB/day for Medium) to prevent runaway ingestion costs
- **NSG Flow Logs**: Use Traffic Analytics sampling (10% sample rate reduces processing costs)

### AI Services
- **Azure OpenAI**: Implement query result caching to avoid duplicate API calls (save ~30% on repeated questions)
- **AI Search**: Use Basic tier for prototype, upgrade to Standard only when semantic ranking or high availability required

---

## Regional Pricing Notes
All estimates based on **Australia East** region pricing (February 2024). Costs may vary by region:
- Australia regions: ~10-15% higher than US East
- New Zealand: No Azure regions; closest = Australia East/Southeast

---

## Disclaimer
These are **estimates based on Azure Retail Prices API data** (where available) and published Azure pricing pages. Actual costs will vary based on:
- Usage patterns (API call volume, data storage growth, query frequency)
- Committed use discounts (reserved instances, savings plans)
- Enterprise Agreement pricing (negotiated discounts)
- Regional pricing differences
- Currency exchange rates (estimates in USD)

For production deployments, use the **Azure Pricing Calculator** (https://azure.microsoft.com/pricing/calculator/) to model specific usage patterns and receive detailed cost breakdowns.

**Prototype Recommendation**: Start with **Small** configuration ($285/month) to validate architecture and user experience. Scale to Medium/Large based on actual usage metrics after 1-2 months of operation.