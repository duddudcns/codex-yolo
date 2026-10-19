#!/bin/bash
# Run one Codex task with NO sandbox and NO approval prompts (--yolo); everything it prints goes to a log.
# usage: codex_job="<name>" run.sh <prompt-file> <log-file> [model] [effort] [workdir]
#   model  default $CODEX_MODEL or gpt-6-luna    effort default $CODEX_EFFORT or medium
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
model="${3:-${CODEX_MODEL:-gpt-6-luna}}"
effort="${4:-${CODEX_EFFORT:-medium}}"
dir="${5:-$PWD}"
# --disable hooks: global ~/.codex hooks otherwise block big reads and flood the log with 'hook:' lines
codex exec --yolo --disable hooks -m "$model" -c "model_reasoning_effort=\"$effort\"" -C "$dir" - < "$prompt" > "$log" 2>&1
echo "exit=$? log=$log"
grep -v '^hook:' "$log" | tail -40
