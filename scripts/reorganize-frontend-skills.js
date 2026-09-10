import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');

const PRIMARY_ROOT = 'Software_Engineering_and_Other/Frontend';

// Not skills at all - eval/test harness infrastructure, leave in place untouched.
const SKIP = new Set(['tests', 'plugin-eval']);

// Genuinely not frontend content - relocate to the correct existing category.
const MISFILED = {
  // generic dev-workflow meta-skills (duplicate the built-in agent-skills plugin names)
  'interview-me': 'Software_Engineering_and_Other/Patterns',
  'spec-driven-development': 'Software_Engineering_and_Other/Patterns',
  'source-driven-development': 'Software_Engineering_and_Other/Patterns',
  'planning-and-task-breakdown': 'Software_Engineering_and_Other/Patterns',
  'refactor-guide': 'Software_Engineering_and_Other/Patterns',
  // languages / game dev
  'cpp-pro': 'Software_Engineering_and_Other/Languages',
  go: 'Software_Engineering_and_Other/Languages',
  'go-concurrency-patterns': 'Software_Engineering_and_Other/Languages',
  'unity-ecs-patterns': 'Game_Development',
  'godot-gdscript-patterns': 'Game_Development',
  // blockchain
  'defi-protocol-templates': 'Blockchain_and_Web3',
  // observability / SecOps (matches observability-monitoring-logging/ taxonomy from the prior round)
  'elasticsearch-https-required': 'observability-monitoring-logging/elasticsearch/other',
  'elasticsearch-onboarding': 'observability-monitoring-logging/elasticsearch/other',
  'chaos-engineering-and-resilience-testing': 'observability-monitoring-logging/common/other',
  'incident-response-and-on-call-management': 'observability-monitoring-logging/common/incident-detection',
  'blameless-postmortem-and-root-cause-analysis': 'observability-monitoring-logging/common/root-cause-analysis',
  'error-budgets': 'observability-monitoring-logging/common/sli-slo-sla',
  'slo-sli-and-error-budget-design': 'observability-monitoring-logging/common/sli-slo-sla',
  'toil-reduction-and-operational-automation': 'observability-monitoring-logging/common/other',
  'chatops-runbook-automation': 'observability-monitoring-logging/common/incident-detection',
  'runbook-creation': 'observability-monitoring-logging/common/incident-detection',
  // ci-cd
  'environment-promotion-strategy': 'ci-cd/common/pipeline-design',
  // containers-orchestration (service mesh / platform runtime)
  'linkerd-service-mesh-configuration': 'containers-orchestration/common/service-mesh',
  'service-mesh-istio': 'containers-orchestration/common/service-mesh',
  'ingress-nginx-configuration': 'containers-orchestration/kubernetes/networking',
  'dapr-distributed-runtime-configuration': 'containers-orchestration/common/other',
  'backup-and-restore': 'containers-orchestration/common/other',
  'backup-dr': 'containers-orchestration/common/other',
  'business-continuity': 'containers-orchestration/common/other',
  // security
  'ssl-tls-management': 'Security',
  'critical-vulnerability-emergency-response': 'Security',
  'fortify-static-analysis': 'Security',
  'owasp-zap-dast-configuration': 'Security',
  'software-composition-analysis-sca': 'Security',
  // backend / payments
  'billing-automation': 'Software_Engineering_and_Other/Backend',
  'stripe-integration': 'Software_Engineering_and_Other/Backend',
  // product / business
  ba: 'Product_and_Business',
  'create-roadmap': 'Product_and_Business',
  'team-composition-analysis': 'Product_and_Business',
  'data-storytelling': 'Product_and_Business',
  // testing
  qa: 'Software_Engineering_and_Other/Testing',
  // misc / docs / generic
  onboarding: 'Software_Engineering_and_Other/Miscellaneous',
  commands: 'Software_Engineering_and_Other/Miscellaneous',
  'standard-site': 'Software_Engineering_and_Other/Miscellaneous',
  'confluence-page-authoring-and-governance': 'Software_Engineering_and_Other/Miscellaneous',
  'tech-debt-tracker': 'Software_Engineering_and_Other/Patterns',
  'gdpr-compliance': 'Security',
  'gdpr-data-handling': 'Security',
  'platform-engineering': 'containers-orchestration/common/other',
  'opentelemetry-instrumentation-and-collector-configuration': 'observability-monitoring-logging/opentelemetry/instrumentation',
};

// Confirmed duplicate of infrastructure-as-code/packer/other/packer/skills/push-to-registry
// (byte-identical apart from the usual cosmetic tag/link-depth artifacts).
const DUPLICATES = new Set(['push-to-registry']);

// Genuine frontend content, organized into subfolders under Frontend/ itself.
const SUBFOLDER = {
  // ui-ux - design systems, visual/responsive design, accessibility, theming, i18n
  'design-system-patterns': 'ui-ux',
  'design-systems': 'ui-ux',
  'frontend-design-review': 'ui-ux',
  'mobile-android-design': 'ui-ux',
  'mobile-ios-design': 'ui-ux',
  'react-native-design': 'ui-ux',
  'responsive-design': 'ui-ux',
  theming: 'ui-ux',
  'ui-design': 'ui-ux',
  'visual-design': 'ui-ux',
  'visual-design-foundations': 'ui-ux',
  'visual-edit-precision': 'ui-ux',
  'web-component-design': 'ui-ux',
  'css-strategy': 'ui-ux',
  'tailwind-css': 'ui-ux',
  'tailwind-design-system': 'ui-ux',
  'accessibility-compliance': 'ui-ux',
  'wcag-audit-patterns': 'ui-ux',
  'screen-reader-testing': 'ui-ux',
  'image-optimization': 'ui-ux',
  internationalization: 'ui-ux',
  astryx: 'ui-ux',
  // frameworks
  'angular-architect': 'frameworks',
  'angular-migration': 'frameworks',
  'react-expert': 'frameworks',
  'react-fiber': 'frameworks',
  'react-modernization': 'frameworks',
  'vue-expert-js': 'frameworks',
  nextjs: 'frameworks',
  'nextjs-app-router-patterns': 'frameworks',
  'nextjs-developer': 'frameworks',
  'nextjs-server-components': 'frameworks',
  nuxt: 'frameworks',
  sveltekit: 'frameworks',
  ember: 'frameworks',
  preact: 'frameworks',
  lit: 'frameworks',
  stencil: 'frameworks',
  'react-flow-node-ts': 'frameworks',
  'frontend-ui-dark-ts': 'frameworks',
  // state management
  'state-management': 'state-management',
  'react-state-management': 'state-management',
  'zustand-store-ts': 'state-management',
  // mobile / cross-platform
  'react-native': 'mobile',
  'react-native-expert': 'mobile',
  'ionic-capacitor': 'mobile',
  swiftui: 'mobile',
  // web components
  'web-components': 'web-components',
  // testing
  'browser-testing-with-devtools': 'testing',
  'playwright-expert': 'testing',
  'property-based-testing': 'testing',
  // build tooling
  'bundler-tools': 'build-tools',
  monorepo: 'build-tools',
  'monorepo-management': 'build-tools',
  'nx-workspace-patterns': 'build-tools',
  'bazel-build-optimization': 'build-tools',
  'makefile-authoring-and-validation': 'build-tools',
  'artifact-and-dependency-management': 'build-tools',
  'ci-tools': 'build-tools',
  // performance
  'performance-tuning': 'performance',
  profiling: 'performance',
  'webgpu-webgl': 'performance',
  // architecture
  'micro-frontends': 'architecture',
  microfrontend: 'architecture',
  'graphql-architect': 'architecture',
  'frontend-engineer': 'architecture',
  'frontend-ui-engineering': 'architecture',
  'high-scale-ecommerce': 'architecture',
  'websocket-engineer': 'architecture',
  storybook: 'architecture',
  // desktop / native shells
  electron: 'desktop',
  tauri: 'desktop',
  wpf: 'desktop',
  uwp: 'desktop',
  'dotnet-maui': 'desktop',
  gnome: 'desktop',
  gtk: 'desktop',
  // common
  typescript: 'common',
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
    if (SKIP.has(s.name)) { manifest.push({ ...s, action: 'SKIP_NOT_A_SKILL', newPath: null }); continue; }
    if (DUPLICATES.has(s.name)) { manifest.push({ ...s, action: 'DELETE_DUPLICATE', newPath: null }); continue; }
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

const outPath = path.join(REPO_ROOT, 'scripts', '.frontend-reorg-manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`Manifest written to ${path.relative(REPO_ROOT, outPath)}`);

const review = manifest.filter(m => m.action === 'NEEDS_REVIEW');
if (review.length) {
  console.log('\n=== NEEDS_REVIEW ===');
  for (const m of review) console.log(' -', m.relPath);
}

if (DRY_RUN) { console.log('\nDry run - no files moved.'); process.exit(0); }

let moved = 0, failed = 0, deleted = 0;
for (const m of manifest) {
  if (m.action === 'DELETE_DUPLICATE') {
    try {
      execSync(`git rm -r -q -f "${m.relPath}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
      deleted++;
    } catch (e) {
      console.error(`[FAIL] git rm "${m.relPath}": ${e.message.split('\n')[0]}`);
      failed++;
    }
    continue;
  }
  if (m.action !== 'MOVE' && m.action !== 'RELOCATE') continue;
  const destAbs = path.join(REPO_ROOT, m.newPath);
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  try {
    execSync(`git mv "${m.relPath}" "${m.newPath}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
    moved++;
  } catch (e) {
    console.error(`[FAIL] git mv "${m.relPath}" -> "${m.newPath}": ${e.message.split('\n')[0]}`);
    failed++;
  }
}
console.log(`\nMoved: ${moved}, Deleted duplicates: ${deleted}, Failed: ${failed}`);
