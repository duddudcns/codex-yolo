---
name: run
description: Run a task on Codex (GPT) directly with the codex CLI, with no sandbox and no approvals (`codex exec --yolo`), in the background, and watch its progress from the log file. Use whenever work should go to Codex (code edits, file review, bulk work, anything needing ssh/network/any folder). Replaces the openai codex plugin's codex-rescue agent, which forces a sandbox and shows no progress.
---

# Codex with full access (`--yolo`)

**Why this exists.** The official codex plugin (`codex:codex-rescue`) hard-codes the `workspace-write` sandbox (no
network to ssh targets, `~/.ssh` unreadable) and its background jobs show no live progress. This skill calls the
`codex` CLI itself: `codex exec --yolo` (no sandbox, no approval prompts), output streamed to a log you can read at
any time.

Scripts live next to this file: `${CLAUDE_PLUGIN_ROOT}/skills/run/scripts/`. Below, `$S` means that folder.

Defaults: model `gpt-6-luna`, effort `medium` (override per call, or with env `CODEX_MODEL` / `CODEX_EFFORT`).
Use another model/effort only when the user says so. `gpt-6.1-sol` burns quota fast.

## Run it
1. Write the task into a prompt file in the session scratchpad (never in the project).
2. Start it with the Bash tool, `run_in_background: true`, one call per parallel job (even a one-line test).
   A plugin hook denies any `run.sh` / `codex exec` Bash call without `run_in_background: true`: a foreground
   run blocks the session and never shows in the task panel.

```bash
bash "$S/run.sh" <prompt-file> <log-file> [model] [effort] [workdir]
```

3. While it runs, check progress whenever useful (and when the user asks):

```bash
bash "$S/status.sh" <log-file> [lines]
```

   It prints log size, seconds since the last write, and the last lines. A log that has not grown for many minutes
   with no codex process means the job died: read the log and report.
4. When the background notification arrives, the wrapper has printed the log tail. The final answer follows the last
   `codex` line. Check what Codex actually changed (`git status`, the files it was told to write) before trusting
   its report.

Direct form: `codex exec --yolo --disable hooks -m gpt-6-luna -c 'model_reasoning_effort="medium"' -C <dir> - < prompt.txt > log 2>&1`
(`-` reads the prompt from stdin, which avoids Windows quoting problems with long prompts).

## The prompt must carry the safety rules
There is no sandbox, so the rules live in the prompt. Always state: which folders it may write, what it must never
do (start/stop servers, run git commands, touch config, etc. — adapt per task), and ask for a short final report in
the user's language. State premises it should VERIFY instead of inherit, and point it at the files/tools to use.
Codex cannot see Claude's context: write the prompt as for a stranger. Parallel jobs must not share output files.

## Usage check
`bash "$S/usage.sh"` prints the 5h and 7d used % and reset times (from the newest `~/.codex/sessions` log). Before
starting more jobs, spread the remaining % over the time left before reset.

## Traps
- `run.sh` passes `--disable hooks`: global hooks in `~/.codex/hooks.json` otherwise block Codex from reading big
  files and fill the log with `hook:` lines. Do not edit `~/.codex/hooks.json` (user's global config).
- Test a new setup with a one-line prompt first.
- After every job, run `git status` and revert anything written outside the allowed folders.
