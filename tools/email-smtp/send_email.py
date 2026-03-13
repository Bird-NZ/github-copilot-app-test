#!/usr/bin/env python3
import argparse
import mimetypes
import os
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path


def env(name: str, required: bool = True, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    if required and not value:
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def build_message(sender: str, to: str, subject: str, body: str, cc: str | None, bcc: str | None, attachments: list[str]) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = sender
    msg["To"] = to
    if cc:
        msg["Cc"] = cc
    msg["Subject"] = subject
    msg.set_content(body)

    for path_str in attachments:
        path = Path(path_str)
        data = path.read_bytes()
        ctype, _ = mimetypes.guess_type(path.name)
        if not ctype:
            ctype = "application/octet-stream"
        maintype, subtype = ctype.split("/", 1)
        msg.add_attachment(data, maintype=maintype, subtype=subtype, filename=path.name)

    if bcc:
        msg["Bcc"] = bcc
    return msg


def main() -> None:
    parser = argparse.ArgumentParser(description="Send email via SMTP using env-configured credentials")
    parser.add_argument("--to", required=True)
    parser.add_argument("--subject", required=True)
    parser.add_argument("--body")
    parser.add_argument("--body-file")
    parser.add_argument("--cc")
    parser.add_argument("--bcc")
    parser.add_argument("--attach", action="append", default=[])
    args = parser.parse_args()

    if not args.body and not args.body_file:
        raise SystemExit("Provide --body or --body-file")

    body = args.body if args.body is not None else Path(args.body_file).read_text()

    host = env("SMTP_HOST")
    port = int(env("SMTP_PORT", default="587") or "587")
    username = env("SMTP_USERNAME")
    password = env("SMTP_PASSWORD")
    sender = env("SMTP_FROM") or username
    use_tls = (env("SMTP_STARTTLS", required=False, default="true") or "true").lower() in {"1", "true", "yes", "on"}

    msg = build_message(sender, args.to, args.subject, body, args.cc, args.bcc, args.attach)
    recipients = [r.strip() for r in (args.to + ("," + args.cc if args.cc else "") + ("," + args.bcc if args.bcc else "")).split(",") if r.strip()]

    if use_tls:
        with smtplib.SMTP(host, port, timeout=30) as server:
            server.ehlo()
            server.starttls(context=ssl.create_default_context())
            server.ehlo()
            server.login(username, password)
            server.send_message(msg, from_addr=sender, to_addrs=recipients)
    else:
        with smtplib.SMTP_SSL(host, port, timeout=30, context=ssl.create_default_context()) as server:
            server.login(username, password)
            server.send_message(msg, from_addr=sender, to_addrs=recipients)

    print(f"Sent email to {', '.join(recipients)} via {host}:{port}")


if __name__ == "__main__":
    main()
