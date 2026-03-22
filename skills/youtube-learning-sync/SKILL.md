---
name: youtube-learning-sync
description: Ingest YouTube videos/watch-history items, extract transcripts, summarize learning, and produce daily/weekly learning briefs with actions. Use when Mat asks to process YouTube links/history, create learning summaries, compare ideas across videos, or build a recurring YouTube-learning workflow.
---

# youtube-learning-sync

Use this skill to turn YouTube consumption into structured learning outputs.

## Core workflow

1. Collect input
- Single URL(s), playlist URLs, or exported history files.

2. Extract transcript
- First try `scripts/youtube_transcript_fetch.py`.
- If captions are unavailable, use `yt-dlp` fallback to fetch metadata/captions where possible.
- If no captions exist, mark the item as `transcript_unavailable` and continue.

3. Summarize
- Produce: key ideas, notable claims, practical takeaways, open questions, and action items.
- Keep summaries decision-oriented.

4. Deliver briefs
- Daily brief: what was watched, what mattered, what to do next.
- Weekly brief: recurring themes, contradictions, changing beliefs, recommended experiments.

## Commands

Transcript extraction:

```bash
python3 scripts/youtube_transcript_fetch.py <youtube-url-or-id>
python3 scripts/youtube_transcript_fetch.py <youtube-url-or-id> --json
```

Optional metadata/caption fallback:

```bash
yt-dlp --skip-download --write-auto-subs --sub-langs en --print "%(id)s\t%(title)s\t%(channel)s\t%(upload_date)s" <youtube-url>
```

## Output format (default)

For each video:
- Title / URL
- 5 bullet summary
- 3 key takeaways
- 1 action for Mat
- Confidence (high/medium/low) based on transcript quality

Daily brief:
- What changed today
- Why it matters
- Recommended next action
- What HAL can do next

## Notes

- Prefer transcript-backed summaries over title-only summaries.
- Flag weak evidence explicitly.
- Keep output concise and useful for decisions.
