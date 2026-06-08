#!/usr/bin/env bash
set -euo pipefail
cd /srv/rn-3303
printf 'Project dir: %s\n' "$PWD"
printf 'Port 3303 listeners:\n'
(ss -ltnup || ss -ltnp) 2>/dev/null | grep ':3303\b' || echo 'none'
printf '\nFiles:\n'
find . -maxdepth 3 -type f | sort
