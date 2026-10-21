// A Codex job may only start after the skills that hold its rules were loaded in this session: the plugin's
// `codex-yolo:run` skill always, plus a project `codex-yolo` skill when the project has one (it carries the lane and
// safety rules the prompt must paste, since --yolo has no sandbox).
const fs = require('fs');
const path = require('path');

const RUN_SKILL = 'codex-yolo:run';
const PROJECT_SKILL = 'codex-yolo';

function isCodexJob(cmd) {
  return /\bbash\s+["']?[^"'\s]*codex-yolo[^"'\s]*run\.sh\b/.test(cmd)
    || /(^|[;&|(]\s*)codex(\.exe)?\s+exec\b/.test(cmd);
}

function loadedSkills(transcriptPath) {
  const found = new Set();
  let text;
  try { text = fs.readFileSync(transcriptPath, 'utf8'); } catch { return found; }
  for (const line of text.split('\n')) {
    // A compaction drops the skill text from context, so only skills loaded after the last one count.
    if (line.includes('"compact_boundary"')) { found.clear(); continue; }
    if (!line.includes('"Skill"')) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    const content = entry && entry.message && entry.message.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && part.type === 'tool_use' && part.name === 'Skill' && part.input && part.input.skill)
        found.add(String(part.input.skill).replace(/^\//, ''));
    }
  }
  return found;
}

function projectHasSkill(cwd) {
  let dir = cwd;
  for (let i = 0; dir && i < 30; i++) {
    if (fs.existsSync(path.join(dir, '.claude', 'skills', PROJECT_SKILL, 'SKILL.md'))) return true;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return false;
}

function missingSkills(input) {
  const loaded = loadedSkills(input.transcript_path || '');
  const missing = [];
  if (!loaded.has(RUN_SKILL)) missing.push(RUN_SKILL);
  if (projectHasSkill(input.cwd || process.cwd()) && !loaded.has(PROJECT_SKILL)) missing.push(PROJECT_SKILL);
  return missing;
}

module.exports = { isCodexJob, loadedSkills, projectHasSkill, missingSkills };

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (c) => (raw += c));
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw); } catch { return; }
    const cmd = String((input.tool_input || {}).command || '');
    if (!isCodexJob(cmd)) return;
    const missing = missingSkills(input);
    if (missing.length === 0) return;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `codex-yolo: load the skill(s) ${missing.join(', ')} with the Skill tool first, `
          + 'then rewrite the prompt with their rules (lane, safety, report language) before starting the job.',
      },
    }));
  });
}
