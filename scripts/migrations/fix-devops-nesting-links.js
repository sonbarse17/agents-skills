// Dedicated link-fixer for nesting cloud/, ci-cd/, containers-orchestration/,
// infrastructure-as-code/, and observability-monitoring-logging/ under a new
// DevOps_and_Cloud/ parent. Doesn't rely on git rename detection (proven
// unreliable at this scale throughout the session) - resolves every relative
// path occurrence (markdown link, backtick span, or bare mention) against
// each file's OLD conceptual location, and rewrites it if the target fell
// under one of the 5 moved prefixes.
import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../');
const DRY_RUN = process.argv.includes('--dry-run');

const MOVED_PREFIXES = [
  'cloud', 'ci-cd', 'containers-orchestration', 'infrastructure-as-code',
  'observability-monitoring-logging',
];

function oldRelOf(currentRel) {
  // If this file itself lives under DevOps_and_Cloud/<prefix>/..., its old
  // location (before today's move) was just <prefix>/...
  for (const p of MOVED_PREFIXES) {
    if (currentRel === `DevOps_and_Cloud/${p}` || currentRel.startsWith(`DevOps_and_Cloud/${p}/`)) {
      return currentRel.slice('DevOps_and_Cloud/'.length);
    }
  }
  return currentRel;
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

const allMd = walkMd(REPO_ROOT, []);
let filesChanged = 0, linksFixed = 0;

// Matches "(../)*<prefix>/rest/of/path" for any of the 5 moved prefixes,
// stopping at whitespace, closing paren, or backtick - covers markdown
// links, backtick code spans, and bare prose mentions uniformly.
const prefixAlt = MOVED_PREFIXES.map(p => p.replace(/[-]/g, '\\-')).join('|');
const pathRe = new RegExp(
  `((?:\\.\\./)*|\\./)?(${prefixAlt})/([^)\\s\`]+)`,
  'g'
);

for (const f of allMd) {
  const currentRel = path.relative(REPO_ROOT, f).split(path.sep).join('/');
  const oldRel = oldRelOf(currentRel);
  const oldDirPosix = path.posix.dirname(oldRel);
  const newDirPosix = path.posix.dirname(currentRel);

  let content = fs.readFileSync(f, 'utf-8');
  let changed = false;

  content = content.replace(pathRe, (full, prefixDots, prefixName, rest) => {
    // Resolve what this occurrence pointed at, relative to the file's OLD dir.
    const oldTargetRel = `${prefixName}/${rest}`;
    const resolvedOld = path.posix.normalize(path.posix.join(oldDirPosix, prefixDots || '', oldTargetRel));
    // Only rewrite if the resolved target actually falls under one of the
    // moved prefixes at repo-root level (avoids touching unrelated text that
    // merely contains e.g. "cloud/" as a substring elsewhere).
    const matchesMovedPrefix = MOVED_PREFIXES.some(
      p => resolvedOld === p || resolvedOld.startsWith(p + '/')
    );
    if (!matchesMovedPrefix) return full;
    const resolvedNew = `DevOps_and_Cloud/${resolvedOld}`;
    let relPath = path.posix.relative(newDirPosix, resolvedNew);
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    if (relPath === full) return full;
    changed = true;
    linksFixed++;
    return relPath;
  });

  if (changed) {
    filesChanged++;
    if (!DRY_RUN) fs.writeFileSync(f, content, 'utf-8');
  }
}

console.log('Files changed:', filesChanged, 'Links fixed:', linksFixed);
if (DRY_RUN) console.log('Dry run - no files written.');
