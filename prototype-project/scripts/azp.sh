#!/usr/bin/env bash
set -euo pipefail

AZ="${AZ:-$HOME/.local/bin/az}"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <prototype-subcommand> [args...]"
  echo "Example: $0 deploy"
  exit 1
fi

subcmd="$1"
shift || true

# Pull canonical help text for this subcommand
help_text="$($AZ prototype "$subcmd" -h 2>&1 || true)"
if grep -qiE "is misspelled|not recognized|unrecognized" <<<"$help_text"; then
  echo "Error: unknown prototype subcommand: $subcmd"
  exit 2
fi

# Validate flags are actually supported for this subcommand
for arg in "$@"; do
  if [[ "$arg" == --* ]]; then
    flag="${arg%%=*}"
    if ! grep -q -- "$flag" <<<"$help_text"; then
      echo "Error: unsupported flag for 'az prototype $subcmd': $flag"
      echo "Run: $AZ prototype $subcmd -h"
      exit 3
    fi
  fi
done

exec "$AZ" prototype "$subcmd" "$@"
