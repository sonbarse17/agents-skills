import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'Product_and_Business';

const MISFILED = {
  'payment-processing': 'Software_Engineering_and_Other/Backend/payments',
  payments: 'Software_Engineering_and_Other/Backend/payments',
  'changelog-automation': 'ci-cd/common/other',
  'changelog-generator': 'ci-cd/common/other',
  'golden-path-template-design-for-developer-platforms': 'containers-orchestration/common/other',
  'golden-paths': 'containers-orchestration/common/other',
  'internal-developer-platform': 'containers-orchestration/common/other',
  'platform-engineering-team-topology-and-operating-model': 'containers-orchestration/common/other',
  'platform-self-service-api-and-workflow-design': 'containers-orchestration/common/other',
  'service-scorecards-and-maturity-model-design': 'containers-orchestration/common/other',
};

const SUBFOLDER = {
  // product management
  'product-management': 'product-management', pm: 'product-management', 'product-manager': 'product-management',
  'create-prd': 'product-management', 'create-roadmap': 'product-management', roadmapping: 'product-management',
  'okr-kpi': 'product-management', 'kpi-dashboard-design': 'product-management',
  'create-tech-spec': 'product-management', 'spec-miner': 'product-management',
  // planning and team tracking
  'agile-scrum': 'planning-and-tracking', 'agile-scrum-kanban': 'planning-and-tracking',
  'sprint-retro': 'planning-and-tracking', 'jira-ticket-best-practices-and-workflow': 'planning-and-tracking',
  'linear-issue-tracking-best-practices': 'planning-and-tracking', 'manage-project': 'planning-and-tracking',
  'create-project': 'planning-and-tracking', 'create-story': 'planning-and-tracking',
  'team-rules': 'planning-and-tracking', 'team-topology': 'planning-and-tracking',
  'team-composition-analysis': 'planning-and-tracking', 'team-composition-patterns': 'planning-and-tracking',
  'team-communication-protocols': 'planning-and-tracking', 'track-management': 'planning-and-tracking',
  'master-orchestrator': 'planning-and-tracking',
  // research and strategy
  'market-analysis': 'research-and-strategy', 'market-sizing-analysis': 'research-and-strategy',
  'competitive-landscape': 'research-and-strategy', 'user-research': 'research-and-strategy',
  'ux-research': 'research-and-strategy', 'persona-development': 'research-and-strategy',
  'data-storytelling': 'research-and-strategy', 'idea-refine': 'research-and-strategy',
  'startup-business-analyst': 'research-and-strategy', 'startup-financial-modeling': 'research-and-strategy',
  'startup-metrics-framework': 'research-and-strategy', 'growth-engineering': 'research-and-strategy',
  'pricing-strategy': 'research-and-strategy', 'go-to-market': 'research-and-strategy',
  'risk-metrics-calculation': 'research-and-strategy', 'backtesting-frameworks': 'research-and-strategy',
  'ab-testing': 'research-and-strategy', analytics: 'research-and-strategy', ba: 'research-and-strategy',
  // content and docs
  'readme-writer': 'content-and-docs', 'pr-writer': 'content-and-docs', 'blog-manager': 'content-and-docs',
  'social-publishing': 'content-and-docs', 'hermes-tweet': 'content-and-docs',
  'report-generation': 'content-and-docs', 'documentation-and-adrs': 'content-and-docs',
  'create-brief': 'content-and-docs', 'create-pitch-deck': 'content-and-docs',
  'pptx-quality-gates': 'content-and-docs', 'pptx-slide-specification': 'content-and-docs',
  mermaid: 'content-and-docs', 'wiki-ado-convert': 'content-and-docs', 'wiki-agents-md': 'content-and-docs',
  'wiki-architect': 'content-and-docs', 'wiki-changelog': 'content-and-docs', 'wiki-onboarding': 'content-and-docs',
  'wiki-page-writer': 'content-and-docs', 'wiki-vitepress': 'content-and-docs',
  // design and ux
  'brand-identity': 'design-and-ux', 'brand-landingpage': 'design-and-ux', 'customer-journey': 'design-and-ux',
  'information-architecture': 'design-and-ux', 'interaction-design': 'design-and-ux',
  'motion-design': 'design-and-ux', 'onboarding-flow': 'design-and-ux', 'checkout-optimization': 'design-and-ux',
  // ops / hiring / stakeholder management
  hiring: 'ops-and-hiring', 'vendor-management': 'ops-and-hiring', stakeholder: 'ops-and-hiring',
  'support-cases-report': 'ops-and-hiring', 'employment-contract-templates': 'ops-and-hiring',
  'before-you-build': 'ops-and-hiring', 'developer-experience': 'ops-and-hiring',
  'shipping-and-launch': 'ops-and-hiring',
  'technical-roadmap-ownership-and-cross-team-coordination': 'ops-and-hiring',
  'legacy-modernizer': 'ops-and-hiring',
  // seo / marketing
  seo: 'seo-and-marketing', 'programmatic-seo': 'seo-and-marketing', 'structured-data': 'seo-and-marketing',
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

const outPath = path.join(REPO_ROOT, 'scripts', '.pb-reorg-manifest.json');
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
