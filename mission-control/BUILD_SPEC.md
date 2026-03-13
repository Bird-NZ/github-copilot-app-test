# Mission Control V1 Build Spec

## Goal
Build a private web dashboard for HAL that runs inside WSL, opens in the Windows browser on the same machine, and can also be reached by other PCs and phones on the same home LAN.

## Access model
- Runtime: Next.js app inside WSL
- Local access: Windows browser via `http://localhost:<port>`
- LAN access: bind server to `0.0.0.0` and expose on a fixed port
- Cross-device access: use the Windows host LAN IP + port from other PCs/phones on the same Wi‑Fi/LAN
- Security posture: LAN-only, low-friction, basic app-level protection optional in V1

## V1 sections
1. Today
   - urgent items
   - waiting approvals count
   - blocked workflows count
   - recommended next actions
2. Approvals
   - queue of actions/outputs waiting on Mat
   - status: pending / approved / rejected
3. Workflows
   - kanban-style columns: queued / working / blocked / waiting on Mat / done
4. Monitors
   - recurring feeds: AI updates, costs, weather, World Mobile, socials
5. Outputs
   - recent generated work: reports, drafts, diagrams, summaries
6. Agent Status
   - HAL status
   - sub-agent/background status
   - last heartbeat / active tasks

## Data model for V1
Use local JSON seed files first, then upgrade later.

- `data/today.json`
- `data/approvals.json`
- `data/workflows.json`
- `data/monitors.json`
- `data/outputs.json`
- `data/agents.json`

## UI requirements
- responsive desktop + mobile layout
- fast, clean, operational style
- no auth wall initially unless needed later
- readable cards with simple status colors
- mobile-friendly stacked sections

## Technical stack
- Next.js (App Router)
- TypeScript
- simple CSS module / global CSS styling
- local JSON-backed server-side loading for V1

## Runtime requirements
- fixed port: `3210`
- host binding: `0.0.0.0`
- local command: `npm run dev -- --hostname 0.0.0.0 --port 3210`

## Stage plan
### Stage 1 — Build local app
- scaffold app
- build sections/pages/components
- seed realistic sample data
- verify local render in WSL

### Stage 2 — Windows access on same machine
- verify Windows browser can load `http://localhost:3210`
- if localhost bridging is unreliable, use WSL IP temporarily

### Stage 3 — LAN access
- server already bound to `0.0.0.0`
- identify Windows LAN IP
- allow inbound TCP 3210 on Windows firewall if needed
- verify from another PC on same LAN

### Stage 4 — Mobile access
- verify phone on same Wi‑Fi can open `http://<windows-lan-ip>:3210`
- tune responsive layout where needed

## Completion criteria
V1 is complete when:
- app runs in WSL
- app opens in Windows browser on same machine
- app is configured for LAN access
- app has all 6 core sections
- mobile layout is usable
- build/run instructions are documented

## Known likely blocker
Actual cross-device verification may require a Windows firewall rule or router/Wi‑Fi topology that cannot be fully controlled from inside this WSL session. If that happens, the app build is still complete, but LAN/mobile verification remains blocked pending host-side network allowance.
