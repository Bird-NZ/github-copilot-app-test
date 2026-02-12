#!/usr/bin/env python3
"""Fetch recent Gmail messages for halclawdbot and emit JSON details."""
from __future__ import annotations

import base64
import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover
    from backports.zoneinfo import ZoneInfo  # type: ignore

SCOPES = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/calendar",
]
SECRETS_DIR = Path("secrets/gmail-full")
TOKEN_PATH = SECRETS_DIR / "token.json"
STATE_PATH = Path("tmp/halclawdbot_gmail_state.json")
NZ_TZ = ZoneInfo("Pacific/Auckland")

NEWSLETTER_HINTS = (
    "list-unsubscribe",
    "list-id",
    "x-mailing-list",
    "x-mailgun-variables",
)

BULK_VALUES = {"bulk", "list", "junk", "auto_reply"}
AUTOMATED_SENDERS = ("noreply", "no-reply", "do-not-reply", "notification", "alerts", "newsletter")


def load_state() -> Dict[str, Any]:
    if not STATE_PATH.exists():
        return {"last_internal_date": 0}
    try:
        return json.loads(STATE_PATH.read_text())
    except Exception:
        return {"last_internal_date": 0}


def save_state(last_internal_date: int) -> None:
    STATE_PATH.write_text(json.dumps({"last_internal_date": last_internal_date}))


def load_creds() -> Credentials:
    if not TOKEN_PATH.exists():
        raise FileNotFoundError(f"Missing token file: {TOKEN_PATH}")
    return Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)


def build_service(creds: Credentials):
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def headers_to_dict(headers: List[Dict[str, str]]) -> Dict[str, str]:
    return {h["name"].lower(): h["value"] for h in headers}


def extract_plain_text(payload: Dict[str, Any]) -> str:
    mime_type = payload.get("mimeType", "").lower()
    body = payload.get("body", {})
    data = body.get("data")

    if payload.get("parts"):
        texts = [extract_plain_text(part) for part in payload["parts"]]
        return "\n".join(filter(None, texts))

    if not data:
        return ""

    decoded = base64.urlsafe_b64decode(data + "==").decode("utf-8", "ignore")
    if mime_type == "text/plain":
        return decoded
    if mime_type == "text/html":
        # Strip HTML tags very simply
        text = re.sub(r"<[^>]+>", " ", decoded)
        text = re.sub(r"\s+", " ", text)
        return text.strip()
    return decoded


def detect_newsletter(header_map: Dict[str, str]) -> bool:
    for hint in NEWSLETTER_HINTS:
        if hint in header_map:
            return True

    precedence = header_map.get("precedence", "").strip().lower()
    if precedence in BULK_VALUES:
        return True

    auto_submitted = header_map.get("auto-submitted", "").strip().lower()
    if auto_submitted and auto_submitted != "no":
        return True

    from_header = header_map.get("from", "").lower()
    if any(tag in from_header for tag in AUTOMATED_SENDERS):
        return True

    subject = header_map.get("subject", "").lower()
    if "newsletter" in subject:
        return True

    return False


def main() -> None:
    state = load_state()
    last_internal_date = int(state.get("last_internal_date", 0))
    creds = load_creds()
    service = build_service(creds)

    after_seconds = max(0, (last_internal_date // 1000) - 5)

    messages: List[Dict[str, Any]] = []
    page_token: Optional[str] = None

    while True:
        resp = (
            service.users()
            .messages()
            .list(userId="me", q=f"after:{after_seconds}", pageToken=page_token, maxResults=50)
            .execute()
        )
        ids = resp.get("messages", [])
        for item in ids:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=item["id"], format="full")
                .execute()
            )
            internal_date = int(msg.get("internalDate", 0))
            if internal_date <= last_internal_date:
                continue
            headers = headers_to_dict(msg.get("payload", {}).get("headers", []))
            body_text = extract_plain_text(msg.get("payload", {}))
            messages.append(
                {
                    "id": msg["id"],
                    "threadId": msg.get("threadId"),
                    "internalDate": internal_date,
                    "from": headers.get("from", "Unknown"),
                    "subject": headers.get("subject", "(No subject)"),
                    "snippet": msg.get("snippet", ""),
                    "date_iso": datetime.fromtimestamp(internal_date / 1000, tz=NZ_TZ).isoformat(),
                    "is_newsletter": detect_newsletter(headers),
                    "body": body_text,
                }
            )

        page_token = resp.get("nextPageToken")
        if not page_token:
            break

    if messages:
        newest_date = max(msg["internalDate"] for msg in messages)
        save_state(newest_date)
    else:
        save_state(last_internal_date)

    messages.sort(key=lambda m: m["internalDate"])  # oldest first
    print(json.dumps({"messages": messages}, ensure_ascii=False))


if __name__ == "__main__":
    main()
