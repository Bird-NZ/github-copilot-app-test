# IRD Guidance Documents

This directory should contain IRD guidance PDF documents for indexing.

## Required Documents (examples)

Place IRD guidance PDFs here before running the population script:

- `IR3-Guide-2024.pdf` — Individual income tax return guide
- `Crypto-Tax-Guidance-2024.pdf` — Tax on cryptocurrency transactions
- `Self-Employment-Guide-2024.pdf` — Self-employment income and expenses
- `Rental-Income-Guide-2024.pdf` — Rental property income and deductions
- `Investment-Income-Guide-2024.pdf` — Dividends and interest income

## Download Sources

Download official IRD guidance from:
- https://www.ird.govt.nz/income-tax/income-tax-for-individuals
- https://www.ird.govt.nz/property/renting-out-residential-property
- https://www.ird.govt.nz/crypto
- https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations

## File Naming Convention

Use descriptive names with hyphens (not underscores):
- `Topic-Name-Tax-Year.pdf`
- Example: `Capital-Gains-Crypto-2024.pdf`

## Population

After adding documents, run:
```bash
cd ../../../concept/db/ai-search
python scripts/populate_index.py \
  --search-service zd-search-tax-dev-aue \
  --index-name ird-guidance \
  --documents-path data/ird-guidance/*.pdf \
  --openai-endpoint https://zd-openai-tax-dev-aue.openai.azure.com