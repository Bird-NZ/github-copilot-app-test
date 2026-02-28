# Battleships Mobile Demo — High-Level Design (Stage 2)

## Objective
Build a low-cost, two-player online Battleships demo app for mobile + web, hosted in Azure Australia East.

## Scope (Approved)
- Room-code multiplayer
- 8x8 board with ships [2,3,3,4]
- Turn-based shots + hit/miss/sunk/win
- Auto-place + manual place
- Reconnect handling
- Turn timer (optional toggle)
- Event feed + rematch

## Architecture Options

### Option A — Cheapest (Recommended for demo)
- Azure Container Apps (single container, min replicas 0, max 1)
- Azure Container Registry (Basic)
- Log Analytics Workspace
- In-memory game state in app process
- **Estimated cost:** USD $5–$12 / month
- **Tradeoff:** if app restarts, active game rooms reset

### Option B — Balanced
- Option A + Azure Cache for Redis (Basic)
- Session/game state in Redis
- **Estimated cost:** USD $20–$40 / month
- **Tradeoff:** higher cost, much better room continuity

### Option C — Robust-lite
- Option B + 2 replicas + stricter monitoring/alerts
- **Estimated cost:** USD $35–$70 / month
- **Tradeoff:** best reliability for demo events, not needed for simple testing

## Recommendation
Use **Option A** now (lowest cost, fastest delivery), and design code so Redis can be added later without major rewrite.

## Hosting Target
- Region: `Australia East`
- Resource Group: existing `rg-mat-ttt-demo-aue` (or dedicated RG if preferred)
