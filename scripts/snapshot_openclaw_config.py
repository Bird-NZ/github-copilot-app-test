#!/usr/bin/env python3
import json
import shutil
from pathlib import Path

WORKSPACE = Path('/home/mat/.openclaw/workspace')
OUTDIR = WORKSPACE / 'backups' / 'openclaw-config'
OUTDIR.mkdir(parents=True, exist_ok=True)

ALLOWLIST = {
    Path('/home/mat/.openclaw/openclaw.json'): OUTDIR / 'openclaw.json',
    Path('/home/mat/.openclaw/cron/jobs.json'): OUTDIR / 'cron-jobs.json',
}

# Top-level keys allowed in openclaw.json snapshot.
OPENCLAW_JSON_KEYS = {
    'meta', 'wizard', 'models', 'agents', 'tools', 'bindings', 'messages',
    'commands', 'session', 'hooks', 'channels', 'gateway', 'plugins'
}

# Sensitive keys to remove recursively from snapshot payloads.
SENSITIVE_KEYS = {
    'apiKey', 'token', 'accessToken', 'refreshToken', 'password', 'secret',
    'clientSecret', 'authorization', 'authToken'
}

REDACTED = 'REDACTED'


def scrub(value):
    if isinstance(value, dict):
        out = {}
        for k, v in value.items():
            if k in SENSITIVE_KEYS:
                out[k] = REDACTED
            else:
                out[k] = scrub(v)
        return out
    if isinstance(value, list):
        return [scrub(v) for v in value]
    return value


def snapshot_openclaw_json(src: Path, dest: Path):
    data = json.loads(src.read_text())
    filtered = {k: data[k] for k in data.keys() if k in OPENCLAW_JSON_KEYS}
    dest.write_text(json.dumps(scrub(filtered), indent=2) + '\n')


def snapshot_json(src: Path, dest: Path):
    data = json.loads(src.read_text())
    dest.write_text(json.dumps(scrub(data), indent=2) + '\n')


def main():
    results = []
    for src, dest in ALLOWLIST.items():
        if not src.exists():
            results.append({'source': str(src), 'status': 'missing'})
            continue
        if src.name == 'openclaw.json':
            snapshot_openclaw_json(src, dest)
        else:
            snapshot_json(src, dest)
        results.append({'source': str(src), 'dest': str(dest), 'status': 'ok'})

    manifest = {
        'note': 'Allowlisted OpenClaw config snapshot for Git backup. Secrets are redacted.',
        'files': results,
    }
    (OUTDIR / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()
