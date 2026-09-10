import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');

function toPosix(p) { return p.split(path.sep).join('/'); }

// ---------------------------------------------------------------------------
// Load the git rename map (old -> new), produced via:
//   git diff --cached --name-status -M > scripts/.rename-map.tsv
// ---------------------------------------------------------------------------
const mapPath = path.join(REPO_ROOT, 'scripts', '.rename-map.tsv');
const lines = fs.readFileSync(mapPath, 'utf-8').split('\n').filter(Boolean);
const oldToNew = new Map();
const newToOld = new Map();
for (const line of lines) {
  const parts = line.split('\t');
  if (parts[0][0] !== 'R') continue;
  const [, oldP, newP] = parts;
  oldToNew.set(toPosix(oldP), toPosix(newP));
  newToOld.set(toPosix(newP), toPosix(oldP));
}
console.log(`Loaded ${oldToNew.size} renames.`);

// ---------------------------------------------------------------------------
// Walk all .md files currently in the repo
// ---------------------------------------------------------------------------
function walkMd(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(full, out);
    else if (e.isFile() && e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

const allMd = walkMd(REPO_ROOT).map(p => toPosix(path.relative(REPO_ROOT, p)));
console.log(`Scanning ${allMd.length} markdown files for relative links...`);

const LINK_RE = /\]\((\.\.?\/[^)\s#]+)([^)]*)\)/g;

let filesChanged = 0, linksFixed = 0, linksUnresolvable = 0;
const unresolvable = [];

for (const currentRel of allMd) {
  const oldRel = newToOld.get(currentRel) || currentRel; // file's path when the link text was authored
  const oldDir = path.posix.dirname(oldRel);
  const newDir = path.posix.dirname(currentRel);

  const abs = path.join(REPO_ROOT, currentRel);
  let content;
  try { content = fs.readFileSync(abs, 'utf-8'); } catch { continue; }

  let changed = false;
  const newContent = content.replace(LINK_RE, (match, linkPath, rest) => {
    // Resolve what this link pointed to, relative to the file's OLD location
    const resolvedOld = toPosix(path.posix.normalize(path.posix.join(oldDir, linkPath)));

    let resolvedNew = oldToNew.get(resolvedOld);
    if (!resolvedNew) {
      // target didn't move - but confirm it still exists at its original spot
      if (fs.existsSync(path.join(REPO_ROOT, resolvedOld))) {
        resolvedNew = resolvedOld;
      } else {
        linksUnresolvable++;
        unresolvable.push(`${currentRel}: ${linkPath} (resolved old target missing: ${resolvedOld})`);
        return match; // leave untouched, can't safely fix
      }
    }

    let newLinkPath = toPosix(path.posix.relative(newDir, resolvedNew));
    if (!newLinkPath.startsWith('.')) newLinkPath = './' + newLinkPath;

    if (newLinkPath !== linkPath) {
      changed = true;
      linksFixed++;
      return `](${newLinkPath}${rest})`;
    }
    return match;
  });

  if (changed) {
    filesChanged++;
    if (!DRY_RUN) fs.writeFileSync(abs, newContent, 'utf-8');
  }
}

console.log(`\nFiles changed: ${filesChanged}`);
console.log(`Links fixed: ${linksFixed}`);
console.log(`Links left unresolved (target missing, not touched): ${linksUnresolvable}`);
if (unresolvable.length) {
  fs.writeFileSync(path.join(REPO_ROOT, 'scripts', '.unresolvable-links.txt'), unresolvable.join('\n'), 'utf-8');
  console.log('Details written to scripts/.unresolvable-links.txt');
}
if (DRY_RUN) console.log('\nDry run - no files written.');
