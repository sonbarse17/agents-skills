// Link-fixer for moving Frontend/desktop/* -> Desktop/* (one level shallower)
// and Frontend/mobile/swiftui -> Desktop/swiftui. Recomputes every relative
// link against its OLD location, then re-expresses it from the NEW location -
// same approach as every other move this session, existence-gated.
import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../');
const DRY_RUN = process.argv.includes('--dry-run');

// old relative dir (from repo root) -> new relative dir
const MOVED = {
  'Software_Engineering_and_Other/Frontend/desktop/appkit': 'Software_Engineering_and_Other/Desktop/appkit',
  'Software_Engineering_and_Other/Frontend/desktop/dotnet-maui': 'Software_Engineering_and_Other/Desktop/dotnet-maui',
  'Software_Engineering_and_Other/Frontend/desktop/electron': 'Software_Engineering_and_Other/Desktop/electron',
  'Software_Engineering_and_Other/Frontend/desktop/gnome': 'Software_Engineering_and_Other/Desktop/gnome',
  'Software_Engineering_and_Other/Frontend/desktop/gtk': 'Software_Engineering_and_Other/Desktop/gtk',
  'Software_Engineering_and_Other/Frontend/desktop/qt': 'Software_Engineering_and_Other/Desktop/qt',
  'Software_Engineering_and_Other/Frontend/desktop/tauri': 'Software_Engineering_and_Other/Desktop/tauri',
  'Software_Engineering_and_Other/Frontend/desktop/uwp': 'Software_Engineering_and_Other/Desktop/uwp',
  'Software_Engineering_and_Other/Frontend/desktop/wpf': 'Software_Engineering_and_Other/Desktop/wpf',
  'Software_Engineering_and_Other/Frontend/mobile/swiftui': 'Software_Engineering_and_Other/Desktop/swiftui',
};

let filesChanged = 0, linksFixed = 0, skippedUnresolved = 0;

for (const [oldDir, newDir] of Object.entries(MOVED)) {
  const f = path.join(REPO_ROOT, newDir, 'SKILL.md');
  if (!fs.existsSync(f)) { console.log('MISSING FILE (skip):', f); continue; }

  let content = fs.readFileSync(f, 'utf-8');
  let changed = false;

  // Match "](../relative/path)" links, capturing the path.
  content = content.replace(/\]\((\.\.[^)\s`]+)\)/g, (full, rel) => {
    const hashIdx = rel.indexOf('#');
    const relPath = hashIdx === -1 ? rel : rel.slice(0, hashIdx);
    const suffix = hashIdx === -1 ? '' : rel.slice(hashIdx);

    // Resolve against the OLD location.
    const resolvedAbs = path.posix.normalize(path.posix.join(oldDir, relPath));
    if (!fs.existsSync(path.join(REPO_ROOT, resolvedAbs))) {
      skippedUnresolved++;
      return full;
    }

    // Re-express from the NEW location.
    let newRel = path.posix.relative(newDir, resolvedAbs);
    if (!newRel.startsWith('.')) newRel = './' + newRel;
    newRel += suffix;
    const newFull = `](${newRel})`;
    if (newFull === full) return full;
    changed = true;
    linksFixed++;
    return newFull;
  });

  if (changed) {
    filesChanged++;
    if (!DRY_RUN) fs.writeFileSync(f, content, 'utf-8');
  }
}

console.log('Files changed:', filesChanged, 'Links fixed:', linksFixed, 'Skipped (unresolved):', skippedUnresolved);
if (DRY_RUN) console.log('Dry run - no files written.');
