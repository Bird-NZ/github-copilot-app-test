#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from pathlib import Path

WORKSPACE = Path('/home/mat/.openclaw/workspace')
BOOTSTRAP = ['AGENTS.md', 'SOUL.md', 'USER.md', 'MEMORY.md', 'TOOLS.md', 'HEARTBEAT.md']
PER_FILE_WARN = 19500
TOTAL_WARN = 120000


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=False)


def file_stats():
    stats = []
    total = 0
    for name in BOOTSTRAP:
        path = WORKSPACE / name
        size = path.stat().st_size if path.exists() else 0
        total += size
        stats.append({"name": name, "bytes": size, "exists": path.exists()})
    return stats, total


def memory_status():
    proc = run(['openclaw', 'memory', 'status', '--agent', 'main', '--deep', '--json'])
    if proc.returncode != 0:
        return {"ok": False, "error": proc.stderr.strip() or proc.stdout.strip()}
    try:
        data = json.loads(proc.stdout)
        entry = data[0]['status']
        probe = data[0].get('embeddingProbe', {})
        scan = data[0].get('scan', {})
        return {
            "ok": True,
            "backend": entry.get('backend'),
            "provider": entry.get('provider'),
            "model": entry.get('model'),
            "files": entry.get('files'),
            "chunks": entry.get('chunks'),
            "searchMode": entry.get('custom', {}).get('searchMode'),
            "vector": entry.get('vector', {}).get('available'),
            "fts": entry.get('fts', {}).get('available'),
            "embeddingProbe": probe.get('ok'),
            "scanIssues": scan.get('issues', []),
            "extraPaths": entry.get('extraPaths', []),
        }
    except Exception as e:
        return {"ok": False, "error": f'parse error: {e}'}


def config_status():
    cfg = json.loads((Path('/home/mat/.openclaw/openclaw.json')).read_text())
    defaults = cfg.get('agents', {}).get('defaults', {})
    compaction = defaults.get('compaction', {})
    pruning = defaults.get('contextPruning', {})
    mem = defaults.get('memorySearch', {})
    return {
        'reserveTokensFloor': compaction.get('reserveTokensFloor'),
        'memoryFlushEnabled': compaction.get('memoryFlush', {}).get('enabled'),
        'memoryFlushSoftThreshold': compaction.get('memoryFlush', {}).get('softThresholdTokens'),
        'contextPruningMode': pruning.get('mode'),
        'memoryExtraPaths': mem.get('extraPaths', []),
    }


def main():
    stats, total = file_stats()
    mem = memory_status()
    cfg = config_status()

    issues = []
    for item in stats:
        if item['exists'] and item['bytes'] >= PER_FILE_WARN:
            issues.append(f"{item['name']} is large ({item['bytes']} bytes)")
    if total >= TOTAL_WARN:
        issues.append(f"bootstrap files total is high ({total} bytes)")
    if not mem.get('ok'):
        issues.append(f"memory status failed: {mem.get('error', 'unknown error')}")
    else:
        if not mem.get('embeddingProbe'):
            issues.append('embedding probe failed')
        if not mem.get('vector'):
            issues.append('vector index unavailable')
        if not mem.get('fts'):
            issues.append('fts unavailable')
        if mem.get('scanIssues'):
            issues.append(f"scan issues present: {mem['scanIssues']}")

    report = {
        'ok': not issues,
        'bootstrapFiles': stats,
        'bootstrapTotalBytes': total,
        'memory': mem,
        'config': cfg,
        'issues': issues,
    }
    json.dump(report, sys.stdout, indent=2)
    sys.stdout.write('\n')


if __name__ == '__main__':
    main()
