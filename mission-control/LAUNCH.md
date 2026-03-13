# Mission Control Launch Notes

## Current build status
- Stage 1 (build local app): complete
- Stage 2 (open on same Windows machine): complete in principle; app is running on `http://localhost:3210`
- Stage 3 (LAN access from other PCs/phones): prepared, but Windows host-side port forwarding requires administrator rights
- Stage 4 (mobile access on home Wi‑Fi): depends on Stage 3 host-side forwarding/firewall allowance

## Run inside WSL
```bash
cd /home/mat/.openclaw/workspace/mission-control/app
npm run dev:lan
```

## Open on the same PC
- `http://localhost:3210`

## Current host/LAN details
- WSL app IP: `172.21.66.48`
- Likely Windows LAN IP: `10.0.0.36`
- Intended LAN URL after Windows host rule is applied: `http://10.0.0.36:3210`

## Required Windows admin step for LAN/mobile
Run PowerShell as Administrator and execute:
```powershell
powershell -ExecutionPolicy Bypass -File "\\wsl.localhost\Ubuntu\home\mat\.openclaw\workspace\mission-control\windows-enable-lan.ps1"
```

This will:
- create a Windows portproxy from `0.0.0.0:3210` -> `172.21.66.48:3210`
- add an inbound firewall rule for TCP 3210

## Test order
1. On the Windows machine running WSL: open `http://localhost:3210`
2. On another PC in the house: open `http://10.0.0.36:3210`
3. On phone connected to home Wi‑Fi: open `http://10.0.0.36:3210`

## Turn LAN exposure off later
Run as Administrator:
```powershell
powershell -ExecutionPolicy Bypass -File "\\wsl.localhost\Ubuntu\home\mat\.openclaw\workspace\mission-control\windows-disable-lan.ps1"
```
