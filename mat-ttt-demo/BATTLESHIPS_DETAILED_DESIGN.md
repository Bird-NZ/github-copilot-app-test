# Battleships Demo App — Detailed Design

## 1. Overview
This document defines the detailed design for a two-player online Battleships demo app targeting Azure Australia East, with responsive web/mobile UX and low operating cost.

## 2. System Context
- Clients: Mobile and desktop browsers
- Backend: Node.js service exposing HTTP + WebSocket
- Platform: Azure Container Apps
- Container source: Azure Container Registry (Basic)
- Observability: Log Analytics Workspace

## 3. Diagrams

### 3.1 Simple Architecture Diagram
![Simple Architecture](../agents/hal/data/battleships_plan/2026-02-28-11-43-12-battleships-architecture-simple.png)

### 3.2 Technical Architecture Diagram
![Technical Architecture](../agents/hal/data/battleships_plan/2026-02-28-11-43-12-battleships-architecture-technical.png)

## 4. Component Design

### 4.1 Frontend
- Single-page web interface
- Responsive layout for phone and desktop
- Two boards: own fleet board + target board
- Room code create/join flow
- Real-time turn and result updates

### 4.2 Backend API + Realtime
- REST endpoints for room creation/join bootstrap
- WebSocket channel for gameplay actions/events
- In-memory session store for demo rooms
- Server-authoritative game state transitions

### 4.3 Game Engine
- Ship placement validation (bounds/overlap)
- Turn enforcement
- Hit/miss/sunk detection
- Win condition when all ships of opponent are sunk

## 5. Data Model (demo)
- Room { id, createdAt, status, players[] }
- Player { id, name?, board, ready }
- GameState { turn, shots, sunkShips, winner }

## 6. API / Event Contracts (example)
- `createRoom` -> `{ roomCode }`
- `joinRoom(roomCode)` -> `{ playerSlot }`
- `placeShips(layout)` -> `ack | validation error`
- `fire(cell)` -> `{ result: hit|miss|sunk, nextTurn }`
- `stateUpdate` broadcast on each valid move

## 7. Security & Reliability
- TLS/HTTPS ingress only
- Input/schema validation on all actions
- Rate limit room creation attempts
- Basic anti-cheat: authoritative server checks
- Graceful reconnect handling by room token/session

## 8. Deployment Design
- Azure Resource Group: `rg-mat-ttt-demo-aue`
- Container App in Australia East
- CPU/memory minimal for demo
- Min replicas 0, max replicas 1 (or 2 if needed)
- Image builds via ACR build and deploy by image tag

## 9. Testing Strategy
- Unit tests for game rules
- Integration tests for room lifecycle
- Smoke tests for mobile and desktop flows
- Basic latency and reconnect checks

## 10. Operations Runbook (summary)
- Deploy: build image -> update container app image
- Rollback: redeploy prior image tag
- Observe: query app logs in Log Analytics
- Cost control: keep scale-to-zero and low log retention

## 11. Open Issues / Future Enhancements
- Persistent game sessions (Redis/DB)
- Optional auth/player profiles
- Match history and leaderboard
- Bot opponent mode
