import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const GR_ROOT = 'Global_References';

// Top-level category roots a referencing skill can belong to. Order matters -
// first match on the skill's own path wins.
const CATEGORY_ROOTS = [
  'cloud', 'ci-cd', 'containers-orchestration', 'infrastructure-as-code',
  'observability-monitoring-logging', 'Security', 'AI_and_Agents',
  'Software_Engineering_and_Other', 'Data_Engineering', 'Blockchain_and_Web3',
  'Mobile', 'Product_and_Business',
];

function categoryOf(skillPath) {
  const posixPath = skillPath.split(path.sep).join('/');
  for (const root of CATEGORY_ROOTS) {
    if (posixPath === root || posixPath.startsWith(root + '/')) return root;
  }
  return 'other';
}

function walkMd(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(full, out);
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

// Step 1: for every Global_References file, find which skill files reference it,
// and tally which category those referencing skills belong to.
const allMd = walkMd(REPO_ROOT, []).map(f => path.relative(REPO_ROOT, f).split(path.sep).join('/'))
  .filter(f => !f.startsWith(GR_ROOT + '/'));

const fileVotes = new Map(); // grFileName -> Map(category -> count)
const re = /Global_References\/([^)\s\]]+\.(md|ts|json|bicep|yaml))/g;

for (const f of allMd) {
  const abs = path.join(REPO_ROOT, f);
  const content = fs.readFileSync(abs, 'utf-8');
  const cat = categoryOf(f);
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(content))) {
    const grFile = m[1];
    if (!fileVotes.has(grFile)) fileVotes.set(grFile, new Map());
    const votes = fileVotes.get(grFile);
    votes.set(cat, (votes.get(cat) || 0) + 1);
  }
}

// Step 2: pick winning category per file (most votes; ties broken by first-seen order)
const grFiles = fs.readdirSync(path.join(REPO_ROOT, GR_ROOT))
  .filter(f => fs.statSync(path.join(REPO_ROOT, GR_ROOT, f)).isFile());

const assignment = new Map(); // filename -> category
for (const f of grFiles) {
  const votes = fileVotes.get(f);
  if (!votes || votes.size === 0) { assignment.set(f, 'unclassified'); continue; }
  let best = null, bestCount = -1;
  for (const [cat, count] of votes) {
    if (count > bestCount) { best = cat; bestCount = count; }
  }
  assignment.set(f, best);
}

const counts = {};
for (const cat of assignment.values()) counts[cat] = (counts[cat] || 0) + 1;
console.log('=== Category distribution ===');
for (const [cat, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(` ${n}\t${cat}`);

const manifestPath = path.join(REPO_ROOT, 'scripts', '.gr-reorg-manifest.json');
const manifest = grFiles.map(f => ({
  name: f,
  relPath: `${GR_ROOT}/${f}`,
  newPath: `${GR_ROOT}/${assignment.get(f)}/${f}`,
}));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`\nManifest written to ${path.relative(REPO_ROOT, manifestPath)}`);

if (DRY_RUN) { console.log('\nDry run - no files moved.'); process.exit(0); }

let moved = 0, failed = 0;
for (const m of manifest) {
  const destAbs = path.join(REPO_ROOT, m.newPath);
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  try {
    execSync(`git mv "${m.relPath}" "${m.newPath}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
    moved++;
  } catch (e) {
    console.error(`[FAIL] git mv "${m.relPath}" -> "${m.newPath}": ${e.message.split('\n')[0]}`);
    failed++;
  }
}
console.log(`\nMoved: ${moved}, Failed: ${failed}`);
