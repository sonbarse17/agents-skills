import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'Software_Engineering_and_Other/Miscellaneous';

// Not skills - eval/reference infrastructure, leave untouched.
const SKIP = new Set(['scenarios']);

const MISFILED = {
  // messaging -> Databases/messaging (matches the cluster built in the Databases round)
  'kafka-configuration-validation': 'Software_Engineering_and_Other/Databases/messaging',
  'kafka-schema-registry-and-compatibility-management': 'Software_Engineering_and_Other/Databases/messaging',
  'rabbitmq-configuration-validation': 'Software_Engineering_and_Other/Databases/messaging',
  'rabbitmq-queue-and-dead-letter-troubleshooting': 'Software_Engineering_and_Other/Databases/messaging',
  'nats-and-pulsar-lightweight-messaging-configuration': 'Software_Engineering_and_Other/Databases/messaging',
  servicebus: 'Software_Engineering_and_Other/Databases/messaging',
  eventhubs: 'Software_Engineering_and_Other/Databases/messaging',
  'temporal-configuration-validation': 'Software_Engineering_and_Other/Databases/messaging',
  // config-validation for tools already organized elsewhere
  'consul-configuration-validation': 'containers-orchestration/common/service-mesh',
  'linkerd-configuration-validation': 'containers-orchestration/kubernetes/networking',
  'metallb-configuration-validation': 'containers-orchestration/kubernetes/networking',
  'keda-configuration-validation': 'containers-orchestration/kubernetes/scaling',
  'falco-configuration-validation': 'Security',
  'postgresql-configuration-validation': 'Software_Engineering_and_Other/Databases/relational',
  'pact-contract-testing-configuration': 'Software_Engineering_and_Other/Testing',
  // SRE / platform-engineering / incident practice
  'chaos-engineer': 'observability-monitoring-logging/common/other',
  'devops-sre-engineer': 'observability-monitoring-logging/common/other',
  'incident-management': 'observability-monitoring-logging/common/incident-detection',
  'itil-service-mgmt': 'observability-monitoring-logging/common/incident-detection',
  'on-call-handoff-patterns': 'observability-monitoring-logging/common/alerting',
  'release-readiness': 'ci-cd/common/pipeline-design',
  'sre-practices': 'observability-monitoring-logging/common/other',
  'humanitec-score-workload-specification': 'containers-orchestration/common/other',
  'idp-adoption-rollout-and-change-management-strategy': 'containers-orchestration/common/other',
  'multi-tenancy-and-team-workspace-design-for-idp': 'containers-orchestration/common/other',
  'developer-experience-measurement-and-platform-adoption': 'containers-orchestration/common/other',
  'identity-provider': 'Security',
  // ci-cd related
  'merge-queue-and-trunk-based-development-configuration': 'ci-cd/common/git-workflow',
  'feature-flag-configuration-launchdarkly-and-unleash': 'ci-cd/common/deployment',
  'jfrog-artifactory-configuration': 'ci-cd/common/build',
  'sonatype-nexus-repository-configuration': 'ci-cd/common/build',
  'dev-container': 'containers-orchestration/docker/other',
  'devcontainers-nix': 'containers-orchestration/docker/other',
  reviewdog: 'ci-cd/common/other',
  'multi-reviewer-patterns': 'ci-cd/common/other',
  'code-review': 'ci-cd/common/other',
  'code-reviewer': 'ci-cd/common/other',
  'ci-access-and-credential-lifecycle-management': 'Security',
  // testing / security
  'acceptance-testing': 'Software_Engineering_and_Other/Testing',
  'binary-analysis-patterns': 'Security',
  vault: 'Security',
  // AI / data
  embeddings: 'AI_and_Agents/Models_and_FineTuning',
  'flash-attention': 'AI_and_Agents/Models_and_FineTuning',
  multimodal: 'AI_and_Agents/Models_and_FineTuning',
  'recommendation-systems': 'AI_and_Agents/Models_and_FineTuning',
  // azure
  'logic-apps': 'cloud/azure/other',
  timer: 'cloud/azure/compute',
  customize: 'cloud/azure/ai',
  // frontend
  accessibility: 'Software_Engineering_and_Other/Frontend/ui-ux',
  'offline-first': 'Software_Engineering_and_Other/Frontend/architecture',
  pwa: 'Software_Engineering_and_Other/Frontend/architecture',
  vite: 'Software_Engineering_and_Other/Frontend/build-tools',
  qt: 'Software_Engineering_and_Other/Frontend/desktop',
  // backend
  auth: 'Software_Engineering_and_Other/Backend/auth',
  'user-management': 'Software_Engineering_and_Other/Backend/auth',
  'caching-strategies': 'Software_Engineering_and_Other/Backend/patterns',
  'rate-limiting': 'Software_Engineering_and_Other/Backend/patterns',
  'reverse-proxy': 'Software_Engineering_and_Other/Backend/patterns',
  'graphql-optimization': 'Software_Engineering_and_Other/Backend/api-design',
  pure: 'Software_Engineering_and_Other/Backend/frameworks',
  performance: 'Software_Engineering_and_Other/Backend/patterns',
  'performance-profiler': 'Software_Engineering_and_Other/Backend/patterns',
  // languages
  'bash-defensive-patterns': 'Software_Engineering_and_Other/Languages/shell',
  'shellcheck-configuration': 'Software_Engineering_and_Other/Languages/shell',
  // ci-cd / dev tooling
  'dependency-management': 'ci-cd/common/build',
  'dependency-upgrade': 'ci-cd/common/build',
  'legacy-migration': 'ci-cd/common/pipeline-design',
  'jira-comments-and-tracking-automation': 'ci-cd/common/other',
  'review-agent-setup': 'ci-cd/common/other',
  // observability / SRE
  'change-management': 'observability-monitoring-logging/common/other',
  'crm-production-investigation-guidelines': 'observability-monitoring-logging/common/root-cause-analysis',
  'servicenow-itsm-integration': 'observability-monitoring-logging/common/incident-detection',
  'startup-it-troubleshooting': 'observability-monitoring-logging/common/other',
  // AI/ML
  'deep-research': 'AI_and_Agents/Workflows',
  'feature-store': 'AI_and_Agents/Models_and_FineTuning',
  'gpu-engineer': 'AI_and_Agents/Models_and_FineTuning',
  'meigen-ai-design': 'AI_and_Agents/Models_and_FineTuning',
  // product/business
  'employment-contract-templates': 'Product_and_Business',
  'ab-testing': 'Product_and_Business',
  'backtesting-frameworks': 'Product_and_Business',
  analytics: 'Product_and_Business',
  'brand-landingpage': 'Product_and_Business',
  'programmatic-seo': 'Product_and_Business',
  seo: 'Product_and_Business',
  'structured-data': 'Product_and_Business',
};

const SUBFOLDER = {
  // quantum computing (README calls out quantum as a Miscellaneous catch-all subject)
  'qiskit-framework': 'quantum-computing', 'quantum-algorithms': 'quantum-computing',
  'quantum-entanglement': 'quantum-computing', 'quantum-error-correction': 'quantum-computing',
  'quantum-scientist': 'quantum-computing', 'qubits-and-gates': 'quantum-computing',
  qc: 'quantum-computing', 'grovers-algorithm': 'quantum-computing', 'shors-algorithm': 'quantum-computing',
  'neuromorphic-computing': 'quantum-computing',
  // low-level / embedded / systems
  'binary-analysis-patterns': 'systems-low-level', 'sass-machine-code': 'systems-low-level',
  'ptx-assembly': 'systems-low-level', rtos: 'systems-low-level', 'rdma-roce': 'systems-low-level',
  'iot-protocols': 'systems-low-level', 'kernel-development': 'systems-low-level',
  // M365 / Teams agent development
  'm365-agent-evaluator': 'm365-teams', 'microsoft-365-agents-toolkit': 'm365-teams',
  'declarative-agent-developer': 'm365-teams', 'teams-app-developer': 'm365-teams',
  'slack-to-teams': 'm365-teams',
  // document / deck generation
  'pptx-deck-context': 'document-generation', 'pptx-deck-creation': 'document-generation',
  'pptx-reference-deck-analysis': 'document-generation', 'pptx-visual-assets': 'document-generation',
  'podcast-generation': 'document-generation',
  // wiki tooling
  'wiki-changelog': 'wiki-tools', 'wiki-llms-txt': 'wiki-tools', 'wiki-qa': 'wiki-tools',
  'wiki-researcher': 'wiki-tools',
  // dev environment / OS admin
  'linux-administration': 'os-admin', 'windows-server': 'os-admin', winforms: 'os-admin',
  'ssh-configuration': 'os-admin', 'systemd-services': 'os-admin', vscode: 'os-admin',
  // generic dev tooling
  git: 'dev-tooling', eslint: 'dev-tooling', prettier: 'dev-tooling', 'skill-creator': 'dev-tooling',
  'skill-template': 'dev-tooling', 'using-agent-skills': 'dev-tooling', commands: 'dev-tooling',
  onboarding: 'dev-tooling', 'fix-issue': 'dev-tooling', 'project-init': 'dev-tooling',
  toolkit: 'dev-tooling',
  hads: 'dev-tooling', experts: 'm365-teams', 'install-atk': 'm365-teams',
  datacenter: 'systems-low-level', 'network-infrastructure': 'systems-low-level',
  'network-netcat': 'systems-low-level', 'core-algorithms': 'algorithms', 'math-foundations': 'algorithms',
  'cap-theorem': 'algorithms', 'camera-media': 'multimedia', web3d: 'multimedia',
  'confluence-page-authoring-and-governance': 'docs-and-collab', 'docs-site': 'docs-and-collab',
  'standard-site': 'docs-and-collab', resources: 'reference',
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

const outPath = path.join(REPO_ROOT, 'scripts', '.misc-reorg-manifest.json');
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
