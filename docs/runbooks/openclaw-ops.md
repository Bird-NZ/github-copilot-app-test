# OpenClaw Ops Runbook

Purpose: reduce repeated troubleshooting and make OpenClaw/runtime/channel recovery more deterministic.

## 1) Quick health baseline
Run these first before deeper debugging:

```bash
openclaw status
openclaw gateway status
openclaw channels status --probe --json
```

Check for:
- gateway running / probe ok
- WhatsApp linked and healthy
- active model/runtime availability
- obvious auth, pairing, or quota failures

## 2) Gateway recovery sequence
When the gateway or delivery path is flaky:

```bash
openclaw gateway status
openclaw gateway restart
openclaw gateway status
openclaw channels status --probe --json
```

Rules:
- Do not claim recovery after restart alone.
- Recovery is only complete after post-restart status/probe succeeds.
- If restart output is interrupted, re-run status checks and continue until post-restart health is verified.

## 3) WhatsApp delivery diagnostics
Use this sequence when messages/media seem broken:

1. Confirm channel health:
   ```bash
   openclaw channels status --probe --json
   ```
2. Determine whether failure is:
   - generation failure
   - routing/delivery failure
   - media-type/playback failure
3. Verify target-surface behavior, not just local artifact creation.
4. Only call it fixed after WhatsApp-side usability is confirmed.

### Voice-note specific notes
Known failure pattern:
- local/desktop playback works
- mobile WhatsApp playback fails

Interpretation:
- synthesis may be fine
- likely problem is media packaging / container / WhatsApp message type

Current mitigation direction:
- prefer Ogg/Opus over MP3 for voice-note compatibility
- verify whether send path marks media as proper voice note vs generic audio
- do not treat “audio file exists” as success

## 4) ACP / ClawDev delegation fallback ladder
Preferred path:
1. delegate coding to ClawDev
2. request progress updates every 10 minutes
3. report handoff + interim + completion to Mat

If ACP/subagent route fails, stalls, or cannot actually execute:
1. confirm the failure mode
2. attempt one direct recovery if low-friction
3. immediately fall back to local direct workspace execution if needed
4. continue the build instead of pausing

Never let delegation failure become a fake blocker.

## 5) Build/update communication contract
For active build work:
- acknowledge immediately
- send handoff update when delegated
- send interim updates during longer work
- send terminal proof-of-work update
- after any milestone update, continue automatically unless a real blocker exists

Proof-of-work fields:
- agent
- slice
- stage
- files touched
- tests run
- commit
- what's next

## 6) Fix verification rule
For operational/tool/runtime fixes, completion requires all of:
1. root cause narrowed credibly
2. chosen fix applied
3. target surface retested
4. user-facing usability verified
5. durable note/runbook update if the issue is likely to recur

## 7) Common anti-patterns to avoid
- claiming “likely fixed” without target-surface verification
- reporting status instead of executing next step
- treating a restart as complete without re-checking probes
- treating generated media as success when delivery/playback is the real requirement
- stopping after diagnosis when the issue is fixable in-session
