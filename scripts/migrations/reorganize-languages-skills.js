import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'Software_Engineering_and_Other/Languages';

const MISFILED = {
  'python-appservice-deploy': 'cloud/azure/compute',
};

const SUBFOLDER = {
  // python
  python: 'python', 'python-pro': 'python', 'python-anti-patterns': 'python',
  'python-automation-scripting-for-ops': 'python', 'python-code-style': 'python',
  'python-configuration': 'python', 'python-error-handling': 'python', 'python-packaging': 'python',
  'python-performance-optimization': 'python', 'python-resilience': 'python',
  'python-resource-management': 'python', 'python-testing-patterns': 'python',
  'python-type-safety': 'python', 'async-python-patterns': 'python', 'uv-package-manager': 'python',
  // javascript / typescript
  'javascript-pro': 'javascript-typescript', 'javascript-testing-patterns': 'javascript-typescript',
  'modern-javascript-patterns': 'javascript-typescript', 'typescript-advanced-types': 'javascript-typescript',
  'typescript-code-quality': 'javascript-typescript', 'typescript-patterns': 'javascript-typescript',
  'typescript-pro': 'javascript-typescript', deno: 'javascript-typescript',
  // go
  go: 'go', 'go-concurrency-patterns': 'go', 'golang-pro': 'go',
  // rust
  'rust-async-patterns': 'rust', 'rust-engineer': 'rust',
  // jvm
  java: 'jvm', 'java-architect': 'jvm', kotlin: 'jvm', 'kotlin-multiplatform': 'jvm', 'kotlin-specialist': 'jvm',
  // other languages
  'php-pro': 'other-languages', 'swift-expert': 'other-languages', elixir: 'other-languages',
  // c / c++ / systems
  'c-cpp-patterns': 'systems', 'cpp-pro': 'systems', 'embedded-systems': 'systems',
  'kernel-development': 'systems', 'compiler-design': 'systems', 'memory-safety-patterns': 'systems',
  // shell / scripting
  'scripting-automation': 'shell', 'shell-scripting-best-practices': 'shell',
};

function isSkillDir(dir) {
  return fs.existsSync(path.join(dir, 'SKILL.md')) ? 'SKILL.md'
       : fs.existsSync(path.join(dir, 'README.md')) ? 'README.md'
       : null;
}

function findSkills(root, depth = 0) {
  const abs = path.join(REPO_ROOT, root);
  if (!fs.existsSync(abs)) return [];
  const entryType = isSkillDir(abs);
  const results = [];

  if (entryType === 'SKILL.md') {
    results.push({ relPath: root, entryFile: 'SKILL.md', name: path.basename(root) });
    return results;
  }
  if (entryType === 'README.md' && depth <= 1) {
    results.push({ relPath: root, entryFile: 'README.md', name: path.basename(root) });
    return results;
  }

  let entries;
  try { entries = fs.readdirSync(abs, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules') continue;
    results.push(...findSkills(path.join(root, e.name), depth + 1));
  }
  return results;
}

function buildManifest() {
  const all = findSkills(PRIMARY_ROOT, 0).map(s => ({ ...s, root: PRIMARY_ROOT }));
  const manifest = [];
  for (const s of all) {
    if (MISFILED[s.name]) { manifest.push({ ...s, action: 'RELOCATE', newPath: path.join(MISFILED[s.name], s.name).replace(/\\/g, '/') }); continue; }
    if (SUBFOLDER[s.name]) { manifest.push({ ...s, action: 'MOVE', newPath: `${PRIMARY_ROOT}/${SUBFOLDER[s.name]}/${s.name}` }); continue; }
    manifest.push({ ...s, action: 'NEEDS_REVIEW', newPath: null });
  }
  return manifest;
}

const manifest = buildManifest();
const counts = {};
for (const m of manifest) counts[m.action] = (counts[m.action] || 0) + 1;
console.log('=== Manifest summary ===', counts);

const outPath = path.join(REPO_ROOT, 'scripts', '.languages-reorg-manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`Manifest written to ${path.relative(REPO_ROOT, outPath)}`);

const review = manifest.filter(m => m.action === 'NEEDS_REVIEW');
if (review.length) {
  console.log('\n=== NEEDS_REVIEW ===');
  for (const m of review) console.log(' -', m.relPath);
}

if (DRY_RUN) { console.log('\nDry run - no files moved.'); process.exit(0); }

let moved = 0, failed = 0;
for (const m of manifest) {
  if (m.action !== 'MOVE' && m.action !== 'RELOCATE') continue;
  const destAbs = path.join(REPO_ROOT, m.newPath);
  const srcAbs = path.join(REPO_ROOT, m.relPath);
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  const destParent = path.dirname(destAbs);
  if (path.resolve(destParent) === path.resolve(srcAbs)) {
    const tmpSibling = path.join(REPO_ROOT, path.dirname(m.relPath), `.tmp-${m.name}`);
    try {
      execSync(`git mv "${m.relPath}" "${path.relative(REPO_ROOT, tmpSibling)}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
      fs.mkdirSync(destParent, { recursive: true });
      execSync(`git mv "${path.relative(REPO_ROOT, tmpSibling)}" "${m.newPath}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
      moved++;
    } catch (e) {
      console.error(`[FAIL-SELFCOLLISION] "${m.relPath}" -> "${m.newPath}": ${e.message.split('\n')[0]}`);
      failed++;
    }
    continue;
  }
  try {
    execSync(`git mv "${m.relPath}" "${m.newPath}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
    moved++;
  } catch (e) {
    console.error(`[FAIL] git mv "${m.relPath}" -> "${m.newPath}": ${e.message.split('\n')[0]}`);
    failed++;
  }
}
console.log(`\nMoved: ${moved}, Failed: ${failed}`);
