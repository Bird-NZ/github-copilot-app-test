# WhatsApp Voice-Note Runbook

Purpose: diagnose and fix WhatsApp voice-reply failures end-to-end.

## Definition of done
Voice-note path is only fixed when all are true:
1. audio generation succeeds
2. outbound delivery succeeds
3. WhatsApp mobile can play the message
4. Mat confirms playback or equivalent target-surface verification exists

Local/desktop playback alone is not enough.

## Failure split
When voice fails, classify the issue into one of these buckets:

### A) generation failure
Symptoms:
- no audio artifact
- TTS/tool error

### B) delivery/routing failure
Symptoms:
- message/media not delivered
- gateway/channel failure

### C) playback/media-type failure
Symptoms:
- audio exists and may play locally
- WhatsApp mobile shows unplayable audio / generic file issue

This runbook is especially for class C.

## High-probability causes for playback/media-type failure
1. wrong codec/container for WhatsApp voice-note expectations
2. sent as generic audio/media instead of proper voice-note style payload
3. incorrect MIME type or metadata
4. runtime/config drift from previously working path

## Recovery ladder

### Step 1: verify channel/gateway health
```bash
openclaw status
openclaw gateway status
openclaw channels status --probe --json
```

### Step 2: inspect current TTS config
Check:
- provider
- output format
- whether a recent config change altered the path

Current best direction:
- prefer Ogg/Opus over MP3 for WhatsApp voice-note compatibility

### Step 3: determine whether problem is generation or packaging
Questions:
- does audio exist?
- does it play locally?
- does it fail only on phone/WhatsApp?

If yes, assume packaging/media-type issue until proven otherwise.

### Step 4: compare multiple fixes
Possible fix paths:
- change output format (e.g. Ogg/Opus)
- restore last known-good pipeline
- patch send path to mark/send as proper voice note
- adjust MIME/container metadata

Do not stop after trying only one hypothesis if the issue is still reproducible.

### Step 5: restart + reverify carefully
If config/runtime changes are applied:
```bash
openclaw gateway restart
openclaw gateway status
openclaw channels status --probe --json
```

Rule:
- restart is not success
- post-restart health + end-to-end playback test is required

### Step 6: live test rule
When testing after a fix:
- tell Mat that the next voice message is a live test
- do not claim success before the playback result is known
- if the test fails, continue troubleshooting without pretending the fix is done

## Durable lessons already known
- a previously working playable voice-note path existed
- later regressions showed that local playback is not enough to prove WhatsApp mobile compatibility
- MP3 default output is suspicious for WhatsApp voice-note compatibility
- target-surface verification is mandatory for media fixes

## Anti-patterns
- calling it fixed because TTS generated audio
- calling it fixed because desktop playback works
- changing one format setting and stopping without replay test
- treating likely-fix as done-fix
