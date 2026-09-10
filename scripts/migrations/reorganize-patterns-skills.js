import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'Software_Engineering_and_Other/Patterns';

const MISFILED = {
  patterns: 'Mobile', // this is "mobile-patterns" content (MVVM/MVI/Clean Architecture)
  'before-you-build': 'Product_and_Business',
  durable: 'cloud/azure/compute',
  'durable-task-scheduler': 'cloud/azure/compute',
};

const SUBFOLDER = {
  // architecture / system design
  architecture: 'architecture', 'architecture-decision-records': 'architecture',
  'architecture-designer': 'architecture', 'architecture-governance': 'architecture',
  'architecture-patterns': 'architecture', 'clean-architecture': 'architecture',
  'design-patterns': 'architecture', 'system-architect': 'architecture', 'system-design': 'architecture',
  'microservices-architect': 'architecture', 'scalability-design': 'architecture',
  'independent-solution-design-and-technical-review': 'architecture',
  'plugin-architecture': 'architecture', 'python-design-patterns': 'architecture',
  // microservices / distributed systems
  microservices: 'distributed-systems', 'microservices-patterns': 'distributed-systems',
  'event-driven': 'distributed-systems', 'event-driven-architecture': 'distributed-systems',
  'event-sourcing': 'distributed-systems', 'event-store-design': 'distributed-systems',
  'cqrs-implementation': 'distributed-systems', 'cqrs-patterns': 'distributed-systems',
  'saga-orchestration': 'distributed-systems', 'projection-patterns': 'distributed-systems',
  'transactional-outbox': 'distributed-systems', 'distributed-locking': 'distributed-systems',
  'message-queue': 'distributed-systems', streams: 'distributed-systems',
  'multi-tenant': 'distributed-systems', 'graphql-federation': 'distributed-systems',
  // API / RPC patterns
  'graphql-patterns': 'api-rpc', 'grpc-patterns': 'api-rpc', 'grpc-service-troubleshooting': 'api-rpc',
  // workflow / scheduling / jobs
  'workflow-automation': 'workflow', 'workflow-orchestration-patterns': 'workflow',
  'workflow-patterns': 'workflow', 'background-jobs': 'workflow', 'scheduled-jobs': 'workflow',
  'scheduling-cron': 'workflow', 'temporal-durable-workflow-orchestration': 'workflow',
  'temporal-python-testing': 'workflow',
  // data / caching / performance
  caching: 'data-performance', cdn: 'data-performance', 'sql-optimization-patterns': 'data-performance',
  'search-patterns': 'data-performance', serverless: 'data-performance',
  // debugging / troubleshooting
  'debugging-and-error-recovery': 'debugging', 'debugging-strategies': 'debugging',
  'debugging-strategy': 'debugging', 'debugging-wizard': 'debugging', 'parallel-debugging': 'debugging',
  'error-handling': 'debugging',
  // dev practice / process
  'code-quality': 'dev-practice', 'code-review-and-quality': 'dev-practice',
  'code-review-excellence': 'dev-practice', 'code-simplification': 'dev-practice',
  'context-driven-development': 'dev-practice', 'context-compressor': 'dev-practice',
  constraints: 'dev-practice', 'deprecation-and-migration': 'dev-practice',
  'doubt-driven-development': 'dev-practice', 'incremental-implementation': 'dev-practice',
  'interview-me': 'dev-practice', 'planning-and-task-breakdown': 'dev-practice',
  'refactor-guide': 'dev-practice', 'source-driven-development': 'dev-practice',
  'spec-driven-development': 'dev-practice', 'tech-debt-tracker': 'dev-practice',
  'test-driven-development': 'dev-practice', 'the-fool': 'dev-practice',
  'network-protocols': 'dev-practice', 'integration-patterns': 'dev-practice',
  'openfeature-vendor-neutral-feature-flag-standard': 'dev-practice',
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

const outPath = path.join(REPO_ROOT, 'scripts', '.patterns-reorg-manifest.json');
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
