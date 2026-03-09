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
