// Link-fixer for dissolving Global_References/ (see dissolve-global-references.sh).
// Each old "Global_References/<cat>/<rest>" occurrence is rewritten to its new
// location under <targetCategory>/references/<rest>. Matches markdown links,
// backtick spans, and bare prose mentions alike (most Global_References refs
// are backtick-wrapped, not markdown links - same finding as the earlier
// Global_References clustering round). Existence-on-disk is the safety gate,
// same as every other link-fixer this session: most non-matches are the
// well-documented pre-existing nested-bracket link corruption, or dead links
// into the now-deleted Blockchain_and_Web3 references (expected, left as-is).
import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../');
const DRY_RUN = process.argv.includes('--dry-run');

const TARGET = {
  'AI_and_Agents': 'AI_and_Agents/references',
  'Data_Engineering': 'Data_Engineering/references',
  'Mobile': 'Mobile/references',
  'Product_and_Business': 'Product_and_Business/references',
  'Security': 'Security/references',
  'Software_Engineering_and_Other': 'Software_Engineering_and_Other/references',
  'ci-cd': 'DevOps_and_Cloud/ci-cd/references',
  'cloud': 'DevOps_and_Cloud/cloud/references',
  'containers-orchestration': 'DevOps_and_Cloud/containers-orchestration/references',
  'infrastructure-as-code': 'DevOps_and_Cloud/infrastructure-as-code/references',
  'observability-monitoring-logging': 'DevOps_and_Cloud/observability-monitoring-logging/references',
};

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
let filesChanged = 0, linksFixed = 0, skippedUnresolved = 0;

const catAlt = Object.keys(TARGET).map(c => c.replace(/[-]/g, '\\-')).join('|');
// "(../)*Global_References/<cat>/<rest>" - stop at whitespace, ), ], (, or
// backtick. Excluding ] and ( (not just the earlier session's ")\s`") matters
// here: several links use the raw path as their own link text, e.g.
// "[../../Global_References/x/y.md](../../Global_References/x/y.md)" - without
// stopping at "]" the greedy capture swallows through to the second
// occurrence's closing paren and never resolves.
const pathRe = new RegExp(
  `((?:\\.\\./)*|\\./)?Global_References/(${catAlt})/([^)\\]\\(\\s\`]+)`,
  'g'
);

for (const f of allMd) {
  const currentRel = path.relative(REPO_ROOT, f).split(path.sep).join('/');
  const newDirPosix = path.posix.dirname(currentRel);

  let content = fs.readFileSync(f, 'utf-8');
  let changed = false;

  content = content.replace(pathRe, (full, _prefixDots, cat, rest) => {
    // Strip a trailing #anchor (section link into the target file) - it's not
    // part of the filename, so it must not be part of the existence check.
    const hashIdx = rest.indexOf('#');
    let restPath = hashIdx === -1 ? rest : rest.slice(0, hashIdx);
    const suffix = hashIdx === -1 ? '' : rest.slice(hashIdx);
    let resolvedNew = `${TARGET[cat]}/${restPath}`;
    // Bare-prose mentions (no backticks/brackets) can pull in a trailing
    // sentence-ending "." that isn't part of the filename - retry once
    // without it before giving up.
    let trailingDot = '';
    if (!fs.existsSync(path.join(REPO_ROOT, resolvedNew)) && restPath.endsWith('.')) {
      restPath = restPath.slice(0, -1);
      trailingDot = '.';
      resolvedNew = `${TARGET[cat]}/${restPath}`;
    }
    if (!fs.existsSync(path.join(REPO_ROOT, resolvedNew))) {
      skippedUnresolved++;
      return full;
    }
    let relPath = path.posix.relative(newDirPosix, resolvedNew);
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    relPath += suffix + trailingDot;
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

console.log('Files changed:', filesChanged, 'Links fixed:', linksFixed, 'Skipped (target does not exist):', skippedUnresolved);
if (DRY_RUN) console.log('Dry run - no files written.');
