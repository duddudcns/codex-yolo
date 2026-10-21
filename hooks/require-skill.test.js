// Run: node hooks/require-skill.test.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HOOK = path.join(__dirname, 'require-skill.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cy-skill-'));
const CMD = 'codex_job="x-job" bash "/p/codex-yolo/0.4.2/skills/run/scripts/run.sh" p.md p.log';

function skillLine(name) {
  if (name === '|compact|') return JSON.stringify({ type: 'system', subtype: 'compact_boundary' });
  return JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Skill', input: { skill: name } }] } });
}
function run(skills, cwd, command = CMD) {
  const t = path.join(tmp, `t${Math.random()}.jsonl`);
  fs.writeFileSync(t, skills.map(skillLine).join('\n') + '\n');
  const out = execFileSync('node', [HOOK], {
    input: JSON.stringify({ transcript_path: t, cwd, tool_input: { command, run_in_background: true } }),
  }).toString();
  return out ? JSON.parse(out).hookSpecificOutput.permissionDecisionReason : '';
}

const plain = fs.mkdtempSync(path.join(tmp, 'plain-'));
const proj = fs.mkdtempSync(path.join(tmp, 'proj-'));
fs.mkdirSync(path.join(proj, '.claude', 'skills', 'codex-yolo'), { recursive: true });
fs.writeFileSync(path.join(proj, '.claude', 'skills', 'codex-yolo', 'SKILL.md'), '# rules');
const sub = path.join(proj, 'work', 'x');
fs.mkdirSync(sub, { recursive: true });

assert.match(run([], plain), /codex-yolo:run/);
assert.strictEqual(run(['codex-yolo:run'], plain), '');
assert.match(run(['codex-yolo:run'], sub), /load the skill\(s\) codex-yolo /);
assert.strictEqual(run(['codex-yolo:run', 'codex-yolo'], sub), '');
assert.match(run(['codex-yolo:run', 'codex-yolo', '|compact|'], sub), /codex-yolo:run, codex-yolo/);
assert.strictEqual(run(['codex-yolo:run', '|compact|', 'codex-yolo:run'], plain), '');
assert.strictEqual(run([], plain, 'grep run.sh notes.txt'), '');
assert.match(run([], plain, 'codex exec --yolo hi'), /codex-yolo:run/);
console.log('require-skill: all passed');
