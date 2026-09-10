import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'Software_Engineering_and_Other/Backend';

const MISFILED = {
  alpinejs: 'Software_Engineering_and_Other/Frontend/frameworks',
  'vue-expert': 'Software_Engineering_and_Other/Frontend/frameworks',
  'design-system': 'Software_Engineering_and_Other/Frontend/ui-ux',
  'rendering-strategies': 'Software_Engineering_and_Other/Frontend/architecture',
  'data-fetching': 'Software_Engineering_and_Other/Frontend/state-management',
  'form-handling': 'Software_Engineering_and_Other/Frontend/ui-ux',
  'browser-caching': 'Software_Engineering_and_Other/Frontend/performance',
  animation: 'Software_Engineering_and_Other/Frontend/ui-ux',
  'product-management': 'Product_and_Business',
  mongodb: 'Software_Engineering_and_Other/Databases',
  mysql: 'Software_Engineering_and_Other/Databases',
  postgresql: 'Software_Engineering_and_Other/Databases',
  'backstage-plugin-development': 'containers-orchestration/common/other',
  'ui-widget-developer': 'AI_and_Agents/Infrastructure',
};

const SUBFOLDER = {
  // frameworks
  django: 'frameworks', 'django-expert': 'frameworks', express: 'frameworks',
  fastapi: 'frameworks', 'fastapi-expert': 'frameworks', 'fastapi-templates': 'frameworks',
  'fastapi-router-py': 'frameworks', flask: 'frameworks', laravel: 'frameworks',
  'laravel-specialist': 'frameworks', rails: 'frameworks', 'rails-expert': 'frameworks',
  'spring-boot-engineer': 'frameworks', 'nestjs-expert': 'frameworks', hono: 'frameworks',
  fastify: 'frameworks', quarkus: 'frameworks', micronaut: 'frameworks', symfony: 'frameworks',
  play: 'frameworks', vapor: 'frameworks', oak: 'frameworks', bun: 'frameworks',
  'convex-backend': 'frameworks', 'medusajs-developer': 'frameworks', 'shopify-expert': 'frameworks',
  'wordpress-pro': 'frameworks', 'dotnet-backend-patterns': 'frameworks',
  'dotnet-core-expert': 'frameworks', 'csharp-developer': 'frameworks',
  'dotnet-contribution': 'frameworks', 'salesforce-developer': 'frameworks', zend: 'frameworks',
  htmx: 'frameworks',
  // api design
  'api-and-interface-design': 'api-design', 'api-client-generator': 'api-design',
  'api-design': 'api-design', 'api-design-principles': 'api-design',
  'api-documentation': 'api-design', 'api-response': 'api-design', 'api-spectral': 'api-design',
  'api-versioning': 'api-design', apis: 'api-design', 'openapi-documentation': 'api-design',
  'openapi-spec-generation': 'api-design', 'data-api': 'api-design',
  // api gateway
  'api-gateway': 'api-gateway', 'api-gateway-rate-limiting-and-quota-management': 'api-gateway',
  'apigee-api-management-and-governance': 'api-gateway', 'kong-api-gateway-configuration': 'api-gateway',
  gateway: 'api-gateway', 'bff-pattern': 'api-gateway',
  // data access (ORM / BaaS - distinct from pure database administration, which lives in Databases/)
  prisma: 'data-access', drizzle: 'data-access', supabase: 'data-access',
  'supabase-developer': 'data-access',
  // patterns
  idempotency: 'patterns', concurrency: 'patterns', 'error-handling-patterns': 'patterns',
  'load-balancing': 'patterns', autoscaling: 'patterns', 'performance-optimization': 'patterns',
  'websocket-patterns': 'patterns', 'web-real-time': 'patterns', webhooks: 'patterns',
  'nodejs-backend-patterns': 'patterns',
  'transactional-email': 'patterns', 'sms-messaging': 'patterns', 'file-conversion': 'patterns',
  headless: 'patterns',
  // auth
  'auth-implementation-patterns': 'auth', authorization: 'auth',
  // payments
  'billing-automation': 'payments', 'stripe-integration': 'payments',
  'paypal-integration': 'payments', 'checkout-cart': 'payments',
  // common
  'backend-engineer': 'common', internals: 'common', 'map-location': 'common',
  templates: 'common', server: 'common', cli: 'common', 'code-documenter': 'common',
  'bulk-import': 'common', 'pydantic-models-py': 'common',
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
    // self-collision guard: if the target subfolder name equals the skill name,
    // route through a two-step temp path to avoid git mv "dir into itself" failures.
    if (SUBFOLDER[s.name]) { manifest.push({ ...s, action: 'MOVE', newPath: `${PRIMARY_ROOT}/${SUBFOLDER[s.name]}/${s.name}` }); continue; }
    manifest.push({ ...s, action: 'NEEDS_REVIEW', newPath: null });
  }
  return manifest;
}

const manifest = buildManifest();
const counts = {};
for (const m of manifest) counts[m.action] = (counts[m.action] || 0) + 1;
console.log('=== Manifest summary ===', counts);

const outPath = path.join(REPO_ROOT, 'scripts', '.backend-reorg-manifest.json');
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
  // self-collision: skill name === target subfolder name (e.g. Backend/server -> Backend/common/server is fine,
  // but Backend/<name> -> Backend/<name>/<name> needs the two-step dance)
  const destParent = path.dirname(destAbs);
  if (path.resolve(destParent) === path.resolve(srcAbs)) {
    const tmp = destAbs + '.tmp-reorg';
    try {
      execSync(`git mv "${m.relPath}" "${path.relative(REPO_ROOT, tmp)}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
      fs.mkdirSync(destParent, { recursive: true });
      execSync(`git mv "${path.relative(REPO_ROOT, tmp)}" "${m.newPath}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
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
