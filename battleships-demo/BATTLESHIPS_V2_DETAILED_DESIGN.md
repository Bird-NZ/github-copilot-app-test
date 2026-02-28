# Battleships Mobile Demo — Detailed Design (Stage 2)

## 1) System Components
- **Client UI (mobile-first web app):** two boards, placement UI, event feed, timer
- **Realtime backend (Node.js + Socket.IO):** room management, turn validation, game state transitions
- **Container runtime:** Azure Container Apps
- **Image registry:** Azure Container Registry (Basic)
- **Observability:** Log Analytics Workspace

## 2) Data/State Model
- Room: code, players, phase, turn, timer, createdAt
- Player: id, nickname, board, shots, ready
- Game: ship config, hits/misses, sunk status, winner

## 3) Key Flows
1. Create room -> code generated
2. Join room -> both players place ships
3. Ready -> battle starts
4. Fire shot -> server validates + emits result
5. Win -> rematch/new room

## 4) Security + Reliability Baseline
- HTTPS ingress only
- Validate all client moves server-side
- Rate limit room creation attempts
- Session reconnect token for returning player (demo-safe)

## 5) Performance Targets
- Turn update propagation: usually < 300ms
- Concurrent rooms target (demo): 10–50 small games

## 6) Manual Implementation Guide (summary)
- `az login`
- Build container image via ACR
- Deploy/update Container App in Australia East
- Smoke-test mobile + desktop flows
- Roll back by redeploying prior image tag

## 7) Diagrams
- Simple: `../../agents/hal/data/battleships_v2_plan/2026-02-28-21-35-45-battleships-v2-architecture-simple.png`
- Technical: `../../agents/hal/data/battleships_v2_plan/2026-02-28-21-35-45-battleships-v2-architecture-technical.png`
