#!/home/mat/.openclaw/tools/video-text-venv/bin/python
import json
import re
import sys
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(s: str) -> str:
    s = s.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", s):
        return s
    u = urlparse(s)
    if u.netloc in {"youtu.be", "www.youtu.be"}:
        return u.path.strip("/")[:11]
    if "youtube.com" in u.netloc:
        qs = parse_qs(u.query)
        if "v" in qs:
            return qs["v"][0][:11]
        parts = [p for p in u.path.split("/") if p]
        if len(parts) >= 2 and parts[0] in {"embed", "shorts", "live"}:
            return parts[1][:11]
    raise SystemExit("Could not extract YouTube video id")


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage: youtube_transcript_fetch.py <youtube-url-or-id> [--json]")
    video_id = extract_video_id(sys.argv[1])
    want_json = "--json" in sys.argv[2:]
    fetched = YouTubeTranscriptApi().fetch(video_id)
    items = [{"start": sn.start, "duration": sn.duration, "text": sn.text} for sn in fetched]
    if want_json:
        print(json.dumps({"video_id": video_id, "segments": items}, ensure_ascii=False, indent=2))
    else:
        for sn in items:
            print(f"[{sn['start']:.1f}] {sn['text']}")


if __name__ == "__main__":
    main()
