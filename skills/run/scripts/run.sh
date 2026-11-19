#!/bin/bash
# Run one Codex task with NO sandbox and NO approval prompts (--yolo); everything it prints goes to a log.
# usage: codex_job="<name>" run.sh <prompt-file> <log-file> [model] [effort] [workdir]
#   model  default: the newest gpt-*-sol in ~/.codex/models_cache.json (never a pinned version)    effort default medium
#   workdir default: the current directory
# Start with the Bash tool's run_in_background. Codex has the user's full access (ssh keys, any folder, network),
# so the PROMPT must state what it may touch.
set -u
# The task panel shows a background job by the start of its command: callers start it as codex_job="<name>" bash run.sh ...
if [ -z "${codex_job:-}" ]; then
  echo 'run.sh: set a job name first: codex_job="<what this job does>" bash run.sh <prompt> <log> ...' >&2
  exit 2
fi
prompt="${1:?prompt file}"
log="${2:?log file}"
model="${3:-}"
if [ -z "$model" ]; then
  model="$(node "$(dirname "$0")/latest-sol.js")"
  if [ -z "$model" ]; then
    echo 'run.sh: no gpt-*-sol in ~/.codex/models_cache.json; run `codex` once to refresh it, or pass a model' >&2
    exit 2
  fi
fi
effort="${4:-medium}"
dir="${5:-$PWD}"
# --disable hooks: global ~/.codex hooks otherwise block big reads and flood the log with 'hook:' lines
codex exec --yolo --disable hooks -m "$model" -c "model_reasoning_effort=\"$effort\"" -C "$dir" - < "$prompt" > "$log" 2>&1
echo "exit=$? log=$log"
grep -v '^hook:' "$log" | tail -40
