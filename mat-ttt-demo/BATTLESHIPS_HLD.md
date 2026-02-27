# Battleships Demo App — High-Level Design (HLD)

## 1. Objective
Deliver a low-cost, online, two-player Battleships demo that works on web and mobile browsers.

## 2. Scope (MVP)
- Two-player online gameplay via room code
- Turn-based Battleships mechanics
- Ship placement (manual + random)
- Hit/miss/sunk logic and win detection
- Responsive UI for mobile + desktop

## 3. Users
- Player A: creates room and places ships
- Player B: joins room and places ships
- Both play alternating turns until one fleet is sunk

## 4. Functional Features
- Create/join room
- Real-time game updates (WebSocket)
- Board rendering for own grid + target grid
- Status feed: hit/miss/sunk/turn/win
- Rematch option

## 5. Non-Functional Requirements
- Low cost for demo usage
- Fast enough gameplay interactions (<300ms typical update latency)
- Simple deployment and rollback
- Basic observability

## 6. Proposed Architecture (Azure)
- Azure Container Apps: hosts Node.js app (frontend + API/WebSocket)
- Azure Container Registry (Basic): image storage
- Log Analytics: logs/diagnostics
- Optional Redis (future): persistent session state

## 7. Security Baseline
- HTTPS external ingress only
- No secrets in source code
- Minimal privileged identities
- Input validation on room/game actions

## 8. Estimated Cost (Demo)
- Container Apps (scale-to-zero): low, usage-driven
- ACR Basic: fixed low monthly baseline
- Log Analytics: minimal at demo volume
- Typical demo total: low single-digit to low double-digit USD per month

## 9. Delivery Plan
1) Approve feature scope and architecture
2) Build UI + game engine + realtime room flow
3) Deploy to Azure Australia East
4) Smoke-test mobile + desktop multiplayer
5) Handover with runbook
