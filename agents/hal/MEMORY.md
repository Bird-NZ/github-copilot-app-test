# MEMORY.md — HAL

Long-term curated memory for the HAL agent.

## Durable notes
- User lives in New Zealand.
- Default to New Zealand context (dates/times, seasons, holidays, local framing) unless the user asks otherwise.
- Stock Report v2 is locked at /home/mat/.openclaw/workspace/stock_report_v2/generate_report.py. Trigger when user asks to analyze a stock/ticker.
- For stock reports: if market is not explicit (US/AU/NZ) and ticker lacks .AX/.NZ (or ASX:/NZX:), ask user which market before running.
- User preference: As Bender in group chats, do not use the term "meatbag".
- User preference: As Bender, use the term "Cockwomble" from time to time (sparingly).
- CCIS (continuous improvement system) is active. Track learnings and adaptations in OPERATING_PROTOCOL.md, IMPROVEMENT_QUEUE.md, WEEKLY_REVIEW.md, CHANGELOG.md, LEARNINGS_LOG.md.
- User preference: do not over-index on stock reports; only discuss stock reports when explicitly asked.
- User preference: do not send raw media links/paths in chat; send playable/openable media directly when possible.
- User preference: when asking for a Battleships link, provide a globally accessible public URL (not LAN/local IP).
- User preference: always communicate with the user in English unless they specifically ask for a different language.
- User preference: app-building conversations should use adaptive mixed-mode by phase (Founder + Product + CTO + Hands-off), not a single fixed style.
- User preference: use each app build as a process-learning loop; adapt and update the process together based on what we learn.
- User preference: in normal app-build flow, always provide a direct link/reference to the produced design doc.
- User preference: for each app build, create a Google Drive folder named with app + build date and upload all build artifacts there.
- User preference: for the daily World Mobile update, send the update directly (no "Reminder: it’s time..." phrasing).
- User preference: complete requested implementation tasks fully in one pass (start-to-finish) and only pause/ask when there is a high-security issue.
- User preference: do not stop after recoverable errors; keep iterating autonomously until the requested outcome is complete, and only return early for true hard blockers or explicit user stop.
- User preference: when restarting a previously internet-accessible service, restart the full stack (app + public exposure/tunnel/proxy), not just the local component.
- User preference: if blocked/stuck, report the blocker immediately (do not wait) so the user can unblock quickly.
- Messaging incident rule: if outbound send fails with `gateway closed (1008): pairing required`, check and approve pending device pairing (`openclaw devices list/approve`) before asking user to re-pair WhatsApp.
- Global reliability preference: avoid repeated user loops. After a failed attempt, stop, re-diagnose, and use a materially different approach before asking the user to retry the same step.
- User preference: in group chats, HAL and Bender should behave more human-like and may reply without explicit mention when contextually appropriate and high-confidence.
- F1 API mode integration active from repo at /home/mat/.openclaw/workspace/agents/hal/f1-app, served locally on http://127.0.0.1:8010. For F1 questions, use POST /api/query with JSON {"query":"..."} first, then summarize answer naturally.
