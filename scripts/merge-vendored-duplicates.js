import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const VENDOR_ROOT = 'DevOps_and_Cloud/Cloud_Providers';
const CLOUD_ROOT = 'cloud';

function toPosix(p) { return p.split(path.sep).join('/'); }

// ---------------------------------------------------------------------------
// Step 1: find every remaining vendored skill dir (contains SKILL.md) under
// the 7 wrapper folders left behind by the cloud reorg.
// ---------------------------------------------------------------------------
function findSkillDirs(root) {
  const abs = path.join(REPO_ROOT, root);
  const out = [];
  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(path.join(REPO_ROOT, dir), { withFileTypes: true }); } catch { return; }
    if (entries.some(e => e.name === 'SKILL.md')) {
      out.push(dir);
      return; // leaf skill - don't recurse into its own subfolders
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      walk(path.join(dir, e.name));
    }
  }
  walk(root);
  return out;
}

const vendored = findSkillDirs(VENDOR_ROOT).map(toPosix);
console.log(`Found ${vendored.length} remaining vendored skill dirs.`);

// ---------------------------------------------------------------------------
// Step 2: index every skill dir under cloud/ by basename
// ---------------------------------------------------------------------------
const cloudIndex = new Map(); // name -> [dirs]
function indexCloud(root) {
  const entries = fs.readdirSync(path.join(REPO_ROOT, root), { withFileTypes: true });
  if (entries.some(e => e.name === 'SKILL.md')) {
    const name = path.basename(root);
    if (!cloudIndex.has(name)) cloudIndex.set(name, []);
    cloudIndex.get(name).push(root);
    return;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    indexCloud(path.join(root, e.name));
  }
}
indexCloud(CLOUD_ROOT);
console.log(`Indexed ${cloudIndex.size} distinct skill names under cloud/.`);

// ---------------------------------------------------------------------------
// Step 3: list all files under a dir (relative to that dir)
// ---------------------------------------------------------------------------
function listFiles(dir) {
  const abs = path.join(REPO_ROOT, dir);
  const out = [];
  function walk(sub) {
    for (const e of fs.readdirSync(path.join(abs, sub), { withFileTypes: true })) {
      const rel = path.join(sub, e.name);
      if (e.isDirectory()) walk(rel);
      else out.push(toPosix(rel));
    }
  }
  walk('.');
  return out;
}

function fileHash(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

// ---------------------------------------------------------------------------
// Step 4: for each vendored dir, find canonical match and merge/promote
// ---------------------------------------------------------------------------
const report = { merged: [], addedFiles: [], conflicts: [], promoted: [], removed: [] };

for (const vDir of vendored) {
  const name = path.basename(vDir);
  const candidates = cloudIndex.get(name);

  if (!candidates || candidates.length === 0) {
    report.promoted.push(vDir); // no canonical - needs manual promotion, listed separately
    continue;
  }

  const canonical = candidates[0]; // should be exactly one
  const vFiles = listFiles(vDir);
  const cFiles = new Set(listFiles(canonical));

  let addedAny = false;
  for (const relFile of vFiles) {
    const vAbs = path.join(REPO_ROOT, vDir, relFile);
    const cAbs = path.join(REPO_ROOT, canonical, relFile);
    if (!cFiles.has(relFile)) {
      // file exists only in vendored copy - copy it into canonical
      report.addedFiles.push(`${vDir}/${relFile} -> ${canonical}/${relFile}`);
      addedAny = true;
      if (!DRY_RUN) {
        fs.mkdirSync(path.dirname(cAbs), { recursive: true });
        fs.copyFileSync(vAbs, cAbs);
      }
    } else {
      // file exists in both - compare content
      if (fileHash(vAbs) !== fileHash(cAbs)) {
        report.conflicts.push(`${vDir}/${relFile} differs from ${canonical}/${relFile} (kept canonical, vendored left unmerged)`);
      }
    }
  }

  report.merged.push(`${vDir} -> ${canonical}${addedAny ? ' (files added)' : ' (identical, nothing to add)'}`);

  // remove the vendored copy now that anything unique has been merged
  if (!DRY_RUN) {
    execSync(`git rm -r -q -f "${vDir}"`, { cwd: REPO_ROOT });
  }
  report.removed.push(vDir);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`\nMerged (canonical found): ${report.merged.length}`);
console.log(`Files added into canonical copies: ${report.addedFiles.length}`);
console.log(`Content conflicts (same filename, different content - canonical kept as-is): ${report.conflicts.length}`);
console.log(`No canonical match found (needs manual promotion): ${report.promoted.length}`);

const outPath = path.join(REPO_ROOT, 'scripts', '.merge-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
console.log(`\nFull report: ${path.relative(REPO_ROOT, outPath)}`);

if (report.promoted.length) {
  console.log('\n=== NO CANONICAL MATCH (left in place) ===');
  for (const p of report.promoted) console.log(' -', p);
}

if (DRY_RUN) console.log('\nDry run - no files changed.');
