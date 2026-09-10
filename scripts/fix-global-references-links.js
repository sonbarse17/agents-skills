// Dedicated link-fixer for the Global_References reorganization. The standard
// git-rename-detection-based fixer doesn't reliably pair 2,782 simultaneous
// single-file moves, so this uses the authoritative manifest this script's
// own move step produced instead of trusting git diff -M.
import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../');
const DRY_RUN = process.argv.includes('--dry-run');

const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'scripts', '.gr-reorg-manifest.json'), 'utf-8'));
const nameToNew = new Map(manifest.map(m => [m.name, m.newPath])); // e.g. "ab-testing-advanced.md" -> "Global_References/Product_and_Business/ab-testing-advanced.md"

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

const allMd = walkMd(REPO_ROOT, []);
let filesChanged = 0, linksFixed = 0, alreadyCorrect = 0;

// Matches the bare relative path fragment "(../)*Global_References/<filename>"
// regardless of surrounding syntax - markdown link, backtick code span, or
// plain prose all contain this same literal substring, so replacing just the
// path fragment (not the wrapper) is style-agnostic and safe.
const pathRe = /((?:\.\.\/)*|\.\/)?Global_References\/([^\/)\s`\]]+\.(?:md|ts|json|bicep|yaml))/g;

for (const f of allMd) {
  const rel = path.relative(REPO_ROOT, f).split(path.sep).join('/');
  let content = fs.readFileSync(f, 'utf-8');
  const fileDirPosix = path.dirname(rel);
  let changed = false;
  content = content.replace(pathRe, (full, prefix, filename) => {
    const newPath = nameToNew.get(filename);
    if (!newPath) return full; // not one of ours (already fixed, or genuinely missing - leave alone)
    let relPath = path.posix.relative(fileDirPosix, newPath);
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    if (relPath === full) { alreadyCorrect++; return full; }
    changed = true;
    linksFixed++;
    return relPath;
  });
  if (changed) {
    filesChanged++;
    if (!DRY_RUN) fs.writeFileSync(f, content, 'utf-8');
  }
}

console.log('Files changed:', filesChanged, 'Links fixed:', linksFixed, 'Already correct (untouched):', alreadyCorrect);
if (DRY_RUN) console.log('Dry run - no files written.');
