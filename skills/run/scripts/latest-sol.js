// Print the newest gpt-<version>-sol slug from Codex's model cache, or nothing if none is found.
// usage: node latest-sol.js [models_cache.json]   (default ~/.codex/models_cache.json, refreshed by the codex CLI)
// Why: the user wants "latest sol" always, so the version must not be pinned in run.sh.
const fs = require('fs');
const os = require('os');
const path = require('path');

const file = process.argv[2] || path.join(os.homedir(), '.codex', 'models_cache.json');
let models = [];
try {
  models = JSON.parse(fs.readFileSync(file, 'utf8')).models || [];
} catch {
  process.exit(0);
}

const SOL = /^gpt-(\d+(?:\.\d+)*)-sol$/;
const ver = (s) => s.split('.').map(Number);
// Compare part by part as numbers ("6.10" > "6.9"); a missing part counts as 0 ("6" == "6.0").
function cmp(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
}

let best = null;
for (const m of models) {
  const hit = SOL.exec((m && m.slug) || '');
  if (hit && (!best || cmp(ver(hit[1]), best.v) > 0)) best = { slug: m.slug, v: ver(hit[1]) };
}
if (best) process.stdout.write(best.slug + '\n');
