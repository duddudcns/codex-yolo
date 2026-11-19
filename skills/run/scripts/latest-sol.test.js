// Run: node skills/run/scripts/latest-sol.test.js
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, 'latest-sol.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cy-sol-'));

function pick(slugs) {
  const f = path.join(tmp, `c${Math.random()}.json`);
  fs.writeFileSync(f, JSON.stringify({ models: slugs.map((slug) => ({ slug })) }));
  return execFileSync('node', [SCRIPT, f], { encoding: 'utf8' }).trim();
}

// Highest version wins regardless of list order; other families are ignored.
assert.strictEqual(pick(['gpt-6.1-sol', 'gpt-6.2-astra', 'gpt-6.2-sol', 'gpt-6-luna']), 'gpt-6.2-sol');
// Numeric compare, not string compare: 6.10 > 6.9.
assert.strictEqual(pick(['gpt-6.9-sol', 'gpt-6.10-sol']), 'gpt-6.10-sol');
// A bare major version counts as .0.
assert.strictEqual(pick(['gpt-6-sol', 'gpt-5.6-sol']), 'gpt-6-sol');
assert.strictEqual(pick(['gpt-7-sol', 'gpt-6.2-sol']), 'gpt-7-sol');
// Lookalikes are not sol.
assert.strictEqual(pick(['gpt-6.2-sol-mini', 'gpt-6.1-sol']), 'gpt-6.1-sol');
// No sol in cache, or no cache file: print nothing, exit 0 (run.sh then falls back).
assert.strictEqual(pick(['gpt-6-luna']), '');
assert.strictEqual(execFileSync('node', [SCRIPT, path.join(tmp, 'missing.json')], { encoding: 'utf8' }).trim(), '');

console.log('latest-sol: all passed');
