#!/bin/bash
# Show what a running Codex job is doing right now: size, last-write age, and the last lines of its log.
# usage: status.sh <log-file> [lines]
log="${1:?log file}"; n="${2:-25}"
[ -f "$log" ] || { echo "no log yet: $log"; exit 1; }
age=$(( $(date +%s) - $(stat -c %Y "$log") ))
echo "log=$log bytes=$(stat -c %s "$log") last_write=${age}s ago codex_procs=$(ps -W 2>/dev/null | grep -ci 'codex')"
grep -v '^hook:' "$log" | tail -"$n"
