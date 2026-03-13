#!/usr/bin/env bash
set -euo pipefail

REPO="/home/mat/.openclaw/workspace"
cd "$REPO"

echo "BACKUP HEALTH CHECK"
echo "repo: $REPO"
echo

echo "1) Remote"
git remote -v | sed -n '1,4p'
echo

echo "2) Recent commits"
git log --oneline -n 5

echo

echo "3) Working tree status"
STATUS=$(git status --short)
if [[ -z "$STATUS" ]]; then
  echo "clean"
else
  echo "$STATUS"
fi

echo

echo "4) Key files tracked"
KEYS=(
  "AGENTS.md"
  "USER.md"
  "MEMORY.md"
  "memory/2026-03-12.md"
  "CODING_FACTORY.md"
  "CODING_FACTORY_PLAYBOOK.md"
  "mission-control/BUILD_SPEC.md"
  "skills/spec-kit/SKILL.md"
  "skills/az-prototype/SKILL.md"
)
for f in "${KEYS[@]}"; do
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    echo "tracked: $f"
  else
    echo "MISSING_FROM_GIT: $f"
  fi
done

echo
if [[ -z "$STATUS" ]]; then
  echo "RESULT: GOOD - workspace clean and key files tracked."
else
  echo "RESULT: ATTENTION - uncommitted or untracked changes exist."
  echo "NEXT STEP: commit/push or confirm intentional exclusions."
fi
