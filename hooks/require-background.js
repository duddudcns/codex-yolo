// Codex jobs must run with run_in_background so they show in the task panel and do not block the session.
let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { return; }
  const ti = input.tool_input || {};
  const cmd = String(ti.command || '');
  const isCodexJob = /codex-yolo[\/].*run\.sh/.test(cmd) || /\bcodex(\.exe)?\s+exec\b/.test(cmd);
  if (!isCodexJob || ti.run_in_background === true) return;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'codex-yolo: Codex jobs must run in the background. Re-run the same Bash call with run_in_background: true.',
    },
  }));
});
