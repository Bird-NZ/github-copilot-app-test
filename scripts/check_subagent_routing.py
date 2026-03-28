#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path

CONFIG_PATH = Path('/home/mat/.openclaw/openclaw.json')
DEFAULT_CALLER = 'main'


def norm(value: str) -> str:
    return (value or '').strip().lower()


def load_config(path: Path):
    return json.loads(path.read_text())


def resolve_agent_map(cfg):
    agents = cfg.get('agents', {}).get('list', []) or []
    result = {}
    for entry in agents:
        agent_id = norm(entry.get('id'))
        if agent_id:
            result[agent_id] = entry
    if 'main' not in result:
        result['main'] = {'id': 'main'}
    return result


def allowed_targets(agent_entry):
    sub = agent_entry.get('subagents', {}) if isinstance(agent_entry, dict) else {}
    raw = sub.get('allowAgents', []) or []
    out = []
    for item in raw:
        text = norm(item)
        if text:
            out.append(text)
    return out


def main():
    parser = argparse.ArgumentParser(description='Validate OpenClaw named subagent routing policy.')
    parser.add_argument('--config', default=str(CONFIG_PATH))
    parser.add_argument('--caller', default=DEFAULT_CALLER, help='Agent ID expected to spawn named subagents')
    parser.add_argument('--targets', nargs='*', help='Specific target agent IDs to require; default is all configured non-caller agents')
    parser.add_argument('--json', action='store_true', help='Emit machine-readable JSON summary')
    args = parser.parse_args()

    cfg = load_config(Path(args.config))
    agent_map = resolve_agent_map(cfg)
    caller = norm(args.caller)
    caller_entry = agent_map.get(caller)
    if caller_entry is None:
        print(f'ERROR: caller agent "{caller}" is not configured', file=sys.stderr)
        return 2

    configured = sorted(agent_map.keys())
    targets = [norm(t) for t in (args.targets or []) if norm(t)]
    if not targets:
        targets = [a for a in configured if a != caller]

    allow = allowed_targets(caller_entry)
    allow_any = '*' in allow
    missing = []
    for target in targets:
        if target not in agent_map:
            missing.append({'target': target, 'reason': 'not-configured'})
        elif not allow_any and target not in allow:
            missing.append({'target': target, 'reason': 'not-allowed'})

    summary = {
        'config': str(Path(args.config)),
        'caller': caller,
        'configuredAgents': configured,
        'targetsChecked': targets,
        'allowAgents': allow,
        'allowAny': allow_any,
        'ok': not missing,
        'missing': missing,
        'recommendedConfig': {
            'agents': {
                'list': [
                    {
                        'id': caller,
                        'subagents': {
                            'allowAgents': ['*']
                        }
                    }
                ]
            }
        }
    }

    if args.json:
        print(json.dumps(summary, indent=2))
    else:
        print('Subagent routing check')
        print(f'- config: {summary["config"]}')
        print(f'- caller: {caller}')
        print(f'- configured agents: {", ".join(configured)}')
        print(f'- allowAgents: {allow if allow else "(default same-agent only)"}')
        print(f'- targets checked: {", ".join(targets) if targets else "(none)"}')
        if summary['ok']:
            print('- result: OK')
        else:
            print('- result: FAIL')
            for item in missing:
                print(f"  - {item['target']}: {item['reason']}")
            print('- fix: add per-agent config under agents.list for the caller agent, e.g. main.subagents.allowAgents=["*"]')
    return 0 if summary['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
