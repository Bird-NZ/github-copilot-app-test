# Retail Insights Demo Requirements

## Executive summary

Build a prototype for a retailer that wants an internal AI assistant for store operations and performance insights.

## Goals

- Let store managers ask natural-language questions about sales, stock, and operations
- Provide a web-based internal interface for staff
- Expose a secure API for future integrations
- Capture audit-friendly activity for key actions
- Keep prototype cost reasonable
- Make the design easy to evolve after the proof-of-concept

## Users

- Store manager
- Operations analyst
- Support/admin user

## Functional requirements

- Dashboard for store KPIs and alerts
- Conversational assistant for operations questions
- Read-only sales/stock summary views in prototype phase
- Basic admin workflow for tracking issues or requests
- Authentication should be designed in, even if prototype posture is lightweight
- Logging and monitoring should be included

## Non-functional requirements

- Azure-native architecture
- Good security defaults
- Observable and supportable
- Reasonable cost for dev/prototype use
- Simple deployment story

## In scope

- Architecture design
- Azure infrastructure definition
- Prototype app scaffolding
- Deployment approach
- Documentation
- Cost estimation

## Out of scope

- ERP integration production hardening
- Real payment systems
- Full enterprise IAM rollout
- Production-grade BI ingestion pipelines

## Nice to have

- Suggested backlog for next phase
- Recommended production hardening items
- Monitoring dashboard ideas

## Prompting context for design stage

Please design this as a realistic Azure prototype that balances speed and good architecture. Prefer pragmatic choices that are demo-friendly, easy to explain, and credible for a next-phase production roadmap.
