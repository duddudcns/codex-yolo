// Codex jobs must run with run_in_background so they show in the task panel and do not block the session.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { return; }
  const ti = input.tool_input || {};
  const cmd = String(ti.command || '');
  const isCodexJob = /codex-yolo[\/].*run\.sh/.test(cmd) || /\bcodex(\.exe)?\s+exec\b/.test(cmd);
  if (!isCodexJob) return;
  const deny = (reason) => process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
  if (ti.run_in_background !== true)
    return deny('codex-yolo: Codex jobs must run in the background. Re-run the same Bash call with run_in_background: true.');
  // The task panel labels a background job by the first characters of its command, so the command must open with the job name.
  if (!/^\s*codex_job="[^"\s][^"]{2,}"\s+bash\s/.test(cmd))
    return deny('codex-yolo: start the command with a job name the user can read in the task panel, exactly: '
      + 'codex_job="<what this job does, e.g. server-cmd-channel>" bash "<full path>/run.sh" <prompt> <log> ... '
      + '(no S=... or other text before it).');
});
