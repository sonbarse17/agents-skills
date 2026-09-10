import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'Software_Engineering_and_Other/Databases';

// Azure-specific despite sitting in the generic Databases folder (bicep/managed-identity content)
const MISFILED = {
  'cosmos-db': 'cloud/azure/database',
  cosmosdb: 'cloud/azure/database',
  'elasticsearch-authn': 'observability-monitoring-logging/elasticsearch/other',
  'elasticsearch-encrypted-at-rest': 'observability-monitoring-logging/elasticsearch/other',
  'elasticsearch-file-ingest': 'observability-monitoring-logging/elasticsearch/other',
  'elasticsearch-in-vpc-only': 'observability-monitoring-logging/elasticsearch/other',
  'elasticsearch-opensearch-configuration-validation': 'observability-monitoring-logging/elasticsearch/other',
  'elasticsearch-security-troubleshooting': 'observability-monitoring-logging/elasticsearch/other',
};

const SUBFOLDER = {
  // relational
  postgresql: 'relational', 'postgres-pro': 'relational', 'postgresql-operations-and-performance-tuning': 'relational',
  mysql: 'relational', 'mysql-mariadb-configuration-validation': 'relational',
  'mysql-mariadb-high-availability-and-replication': 'relational', 'mysql-mariadb-operations-and-performance-tuning': 'relational',
  sql: 'relational', 'sql-database': 'relational', 'relational-database': 'relational',
  // nosql / document / multi-model
  mongodb: 'nosql', 'mongodb-configuration-validation': 'nosql', 'mongodb-operations-and-scaling': 'nosql',
  'nosql-database': 'nosql', firebase: 'nosql', planetscale: 'nosql',
  'arangodb-multi-model-database-operations': 'nosql', 'cassandra-wide-column-database-operations': 'nosql',
  // graph
  'neo4j-graph-database-operations': 'graph', 'graph-database': 'graph',
  // analytical / time-series
  'clickhouse-analytical-database-operations': 'analytical', 'timescaledb-time-series-operations-and-configuration': 'analytical',
  'data-lake': 'analytical', 'search-engine': 'analytical',
  // caching
  'redis-caching-strategy-and-invalidation-patterns': 'caching', 'redis-configuration-validation': 'caching',
  'redis-operations-and-cluster-management': 'caching', 'distributed-caching': 'caching',
  // messaging (queue tech that lives alongside DB infra in this repo's taxonomy)
  'rabbitmq-configuration': 'messaging',
  // common - cross-database concepts
  'database-backup-and-restore-strategies': 'common', 'database-backups': 'common',
  'database-connection-pooling-strategies': 'common', 'database-internals': 'common',
  'database-migration': 'common', 'database-operations': 'common', 'database-optimizer': 'common',
  'database-patterns': 'common', 'database-sharding': 'common',
  'database-schema-migration-with-liquibase-and-flyway': 'common',
  'liquibase-advanced-changelog-management-and-rollback-strategies': 'common',
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

const outPath = path.join(REPO_ROOT, 'scripts', '.databases-reorg-manifest.json');
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
