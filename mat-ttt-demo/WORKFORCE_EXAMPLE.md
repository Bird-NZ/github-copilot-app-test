# Example: Using the Agent Workforce (MAT TTT Demo V2)

## 1) Planner output (example)

### Option A — Cheapest
- **Components:** Container App (0.25 vCPU / 0.5Gi, min replicas 0), ACR Basic, Log Analytics
- **Cost:** ~$5–$10/mo
- **Pros:** Lowest cost, simple
- **Cons:** Slower cold start, basic resilience

### Option B — Balanced (recommended)
- **Components:** Same as A + small tuning (warm window during peak hours, capped logs)
- **Cost:** ~$8–$15/mo
- **Pros:** Better responsiveness, still cheap
- **Cons:** Slightly higher spend

### Option C — Production-lite
- **Components:** A + custom domain + managed cert + higher min scale + stricter monitoring
- **Cost:** ~$20–$40/mo
- **Pros:** Better UX and ops readiness
- **Cons:** Higher cost and complexity

**Recommendation:** Option B.

---

## 2) Scaffolder task (example)
- Add lobby polish, move history, rematch button, and share-room CTA.

## 3) Security task (example)
- Verify no secrets in repo, enforce HTTPS ingress only, minimize exposed config.

## 4) Cost task (example)
- Confirm scale-to-zero, 7-day log retention, and max replica cap.

## 5) Deploy task (example)
- Build image, push to ACR, update Container App revision.

## 6) QA task (example)
- Test create/join room, one-screen mode, reset, mobile layout.

## 7) Ops handover (example)
- Provide `deploy.sh`, `rollback.sh`, and teardown command list.

---

## Real-run note
A live sub-agent run was attempted from this session, but current gateway state returned `pairing required`.
Once gateway pairing is restored, the same workforce can be executed as true parallel sub-agents.
