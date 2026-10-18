#!/bin/bash
# Run one Codex task with NO sandbox and NO approval prompts (--yolo); everything it prints goes to a log.
# usage: run.sh <prompt-file> <log-file> [model] [effort] [workdir]
#   model  default $CODEX_MODEL or gpt-6-luna    effort default $CODEX_EFFORT or medium
#   workdir default: the current directory
# Start with the Bash tool's run_in_background. Codex has the user's full access (ssh keys, any folder, network),
# so the PROMPT must state what it may touch.
set -u
prompt="${1:?prompt file}"
log="${2:?log file}"
model="${3:-${CODEX_MODEL:-gpt-6-luna}}"
effort="${4:-${CODEX_EFFORT:-medium}}"
dir="${5:-$PWD}"
# --disable hooks: global ~/.codex hooks otherwise block big reads and flood the log with 'hook:' lines
codex exec --yolo --disable hooks -m "$model" -c "model_reasoning_effort=\"$effort\"" -C "$dir" - < "$prompt" > "$log" 2>&1
echo "exit=$? log=$log"
grep -v '^hook:' "$log" | tail -40
