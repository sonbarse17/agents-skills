// Generic fixer for leftover old-path references that git's rename detection
// missed (see the observability/languages/misc rounds - this gap recurs whenever
// a self-collision two-step move or a bulk move confuses git's -M pairing).
// Usage: node scripts/fix-leftover-refs.js <manifest.json> <old-category-name>
import fs from 'fs';
import path from 'path';

const [, , manifestPath, categoryName] = process.argv;
if (!manifestPath || !categoryName) {
  console.error('Usage: node scripts/fix-leftover-refs.js <manifest.json> <old-category-name>');
  process.exit(1);
}

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../');
const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const moved = m.filter(x => x.action === 'MOVE' || x.action === 'RELOCATE');
const nameToNew = new Map(moved.map(x => [x.name, x.newPath.split(path.sep).join('/')]));

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
let filesChanged = 0, linksFixed = 0;
const escapedCategory = categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const linkRe = new RegExp(`\\]\\(([^)\\s]*${escapedCategory}\\/([a-zA-Z0-9-]+)\\/(SKILL|README)\\.md)\\)`, 'g');

for (const f of allMd) {
  const rel = path.relative(REPO_ROOT, f).split(path.sep).join('/');
  let content = fs.readFileSync(f, 'utf-8');
  const fileDirPosix = path.dirname(rel);
  let changed = false;
  content = content.replace(linkRe, (full, linkPath, name, fileType) => {
    const newPath = nameToNew.get(name);
    if (!newPath) return full;
    let relPath = path.posix.relative(fileDirPosix, newPath + '/' + fileType + '.md');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    changed = true;
    linksFixed++;
    return '](' + relPath + ')';
  });
  if (changed) {
    fs.writeFileSync(f, content, 'utf-8');
    filesChanged++;
  }
}
console.log('Files changed:', filesChanged, 'Links fixed:', linksFixed);
