# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Voice reply path

- Edge TTS installed in venv: `/home/mat/.openclaw/tools/edge-tts-venv`
- Edge TTS binary: `/home/mat/.openclaw/tools/edge-tts-venv/bin/edge-tts`
- User-space ffmpeg binary: `/home/mat/.openclaw/tools/edge-tts-venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2`
- Tested working on 2026-03-09: text -> mp3 -> ogg/opus conversion succeeded
- Important follow-up learned on 2026-03-09: `openclaw agent --deliver` can move media back to WhatsApp, but it still runs an agent turn rather than acting like a raw send primitive. So for voice-note delivery, verify not just media generation but the exact delivery behavior/content before treating the loop as finished.
- Observed on 2026-03-11: longer WhatsApp voice replies can get truncated around ~1:30–1:50. Practical mitigation: keep spoken replies to roughly `<= 900 chars / <= 90 sec` and intentionally split longer answers into multiple voice notes.
- Reinforced on 2026-03-13 after repeated truncation complaints: treat chunking as a hard default, not an occasional workaround. If a spoken answer might run long, proactively split it before sending.

## YouTube transcript / video text path

- Video text venv: `/home/mat/.openclaw/tools/video-text-venv`
- Installed tools: `youtube-transcript-api`, `yt-dlp`
- Fast transcript fetch script: `/home/mat/.openclaw/workspace/scripts/youtube_transcript_fetch.py`
- Best current workflow on this machine:
  1. use `youtube_transcript_fetch.py` for direct transcript extraction when captions exist
  2. use `yt-dlp` as fallback for tougher YouTube retrieval cases
  3. if captions are missing, add audio-download + transcription as the next fallback instead of stopping
