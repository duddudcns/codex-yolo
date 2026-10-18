#!/bin/bash
# Prints Codex usage (5h and 7d windows) from the newest session log's last rate_limits event.
f=$(ls -t ~/.codex/sessions/*/*/*/*.jsonl 2>/dev/null | head -1)
grep -o '"rate_limits":{.*"credits"' "$f" | tail -1 | python -c "
import sys,re,datetime
s=sys.stdin.read()
for name,w in (('primary','5h'),('secondary','7d')):
    m=re.search(name+r'\":\{\"used_percent\":([\d.]+),\"window_minutes\":\d+,\"resets_at\":(\d+)',s)
    if m: print(w, m.group(1)+'%', 'resets', datetime.datetime.fromtimestamp(int(m.group(2))).strftime('%m-%d %H:%M'))
"
