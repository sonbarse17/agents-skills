import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');

const PRIMARY_ROOT = 'DevOps_and_Cloud/CI_CD';
const EXTRA_ROOTS = [
  // Argo family - GitOps CD tooling, currently filed under Containers_and_Orchestration
  'DevOps_and_Cloud/Containers_and_Orchestration/argo-cd',
  'DevOps_and_Cloud/Containers_and_Orchestration/argo-events-and-event-driven-automation',
  'DevOps_and_Cloud/Containers_and_Orchestration/argo-rollouts-progressive-delivery',
  'DevOps_and_Cloud/Containers_and_Orchestration/argo-workflows-pipeline-design',
  'DevOps_and_Cloud/Containers_and_Orchestration/argocd',
  'DevOps_and_Cloud/Containers_and_Orchestration/argocd-application-configuration',
  'DevOps_and_Cloud/Containers_and_Orchestration/argocd-applicationset-patterns',
  'DevOps_and_Cloud/Containers_and_Orchestration/argocd-gitops',
  'DevOps_and_Cloud/Containers_and_Orchestration/argocd-sync-failure-and-drift-investigation',
  'DevOps_and_Cloud/Containers_and_Orchestration/complete-gitops-argocd-deployment-on-aks-from-scratch',
  'DevOps_and_Cloud/Containers_and_Orchestration/complete-gitops-argocd-deployment-on-eks-from-scratch',
  'DevOps_and_Cloud/Containers_and_Orchestration/complete-gitops-argocd-deployment-on-gke-from-scratch',
  'DevOps_and_Cloud/Containers_and_Orchestration/complete-gitops-argocd-deployment-on-prem-from-scratch',
  'DevOps_and_Cloud/Observability_and_SecOps/argocd-operations',
  // Flux CD - the other major GitOps CD tool
  'DevOps_and_Cloud/Containers_and_Orchestration/flux-cd-configuration-and-reconciliation',
  'DevOps_and_Cloud/Containers_and_Orchestration/flux-cd-configuration-validation',
];

// Items sitting inside DevOps_and_Cloud/CI_CD that are NOT CI/CD-tool skills at
// all - leftover mis-filing. Relocate to their real home instead of ci-cd/.
const MISFILED = {
  cdn: 'Software_Engineering_and_Other/Patterns',
  'bats-testing-patterns': 'Software_Engineering_and_Other/Testing',
  'bundler-tools': 'Software_Engineering_and_Other/Frontend',
  'bulk-import': 'Software_Engineering_and_Other/Backend',
  'batch-processing': 'Data_Engineering',
  'complete-idp-deployment-on-k3s-from-scratch': 'DevOps_and_Cloud/Containers_and_Orchestration',
  'github-issue-creator': 'AI_and_Agents/Workflows',
  'istio-traffic-management': 'DevOps_and_Cloud/Containers_and_Orchestration',
  'linkerd-patterns': 'DevOps_and_Cloud/Containers_and_Orchestration',
  'dapr-configuration-validation': 'DevOps_and_Cloud/Containers_and_Orchestration',
  'humanitec-score-configuration-validation': 'DevOps_and_Cloud/Containers_and_Orchestration',
  'golden-path-template-validation-and-testing': 'DevOps_and_Cloud/Containers_and_Orchestration',
  'openfeature-vendor-neutral-feature-flag-standard': 'Software_Engineering_and_Other/Patterns',
  'falco-runtime-threat-detection-configuration': 'DevOps_and_Cloud/Observability_and_SecOps',
  'pact-configuration-validation': 'Software_Engineering_and_Other/Testing',
  'operational-runbook-execution-and-escalation': 'DevOps_and_Cloud/Observability_and_SecOps',
  'opentelemetry-configuration-validation': 'DevOps_and_Cloud/Observability_and_SecOps',
  bicep: 'DevOps_and_Cloud/Infrastructure_as_Code',
  deployment: 'Mobile', // this is "mobile-deployment" content (App Store/Play Store/Fastlane)
};

// Explicit per-skill destination overrides (tool + optional subfolder), applied
// before the generic keyword classifier. Used for the handful of items whose
// name alone doesn't carry the tool/category signal cleanly.
const EXPLICIT = {
  'github-actions-centralized-reusable-workflows': 'github-actions/workflows',
  'github-actions-single-repo-workflows': 'github-actions/workflows',
  'github-actions-templates': 'github-actions/workflows',
  github: 'github-actions/other',
  'github-ci': 'github-actions/other',
  'github-actions': 'github-actions/other',
  'gitlab-ci': 'gitlab-ci/pipelines',
  'gitlab-ci-patterns': 'gitlab-ci/pipelines',
  'gitlab-cicd-pipeline-design': 'gitlab-ci/pipelines',
  jenkins: 'jenkins/other',
  'jenkins-declarative-pipeline-per-repo': 'jenkins/pipelines',
  'jenkins-groovy-scripting-best-practices': 'jenkins/pipelines',
  'jenkins-centralized-shared-library': 'jenkins/shared-libraries',
  circleci: 'circleci/other',
  'bamboo-pipeline-yaml-and-java-specs': 'bamboo/other',
  'gitea-actions-and-ci': 'gitea/other',
};

// Argo/Flux extra-root items all go flat under their tool folder.
const EXTRA_ROOT_TOOL = (name) =>
  /^flux-cd/.test(name) ? 'fluxcd/other' : 'argocd/other';

// Common/shared sub-bucket keyword rules (checked in order)
const COMMON_RULES = [
  ['deployment', /blue-green|canary|progressive-delivery|release-management|emergency-hotfix|^deploy$/i],
  ['pipeline-design', /pipeline-design|ci-pipelines|cicd-pipeline|pipeline-review|pipeline-security|pipeline-failure|deployment-pipeline|complete-cicd-pipeline|complete-devsecops-pipeline|continuous-delivery|ci-cd-and-automation/i],
  ['git-workflow', /git-workflow|git-advanced-workflows|^commit$|block-no-verify-hook/i],
  ['build', /artifact-management|build-optimization|turborepo-caching/i],
  ['data-pipeline', /data-pipeline-cicd/i],
];

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

function classify(name) {
  if (EXPLICIT[name]) return `ci-cd/${EXPLICIT[name]}/${name}`;
  for (const [sub, re] of COMMON_RULES) {
    if (re.test(name)) return `ci-cd/common/${sub}/${name}`;
  }
  return `ci-cd/common/other/${name}`;
}

function buildManifest() {
  const all = findSkills(PRIMARY_ROOT, 0).map(s => ({ ...s, root: PRIMARY_ROOT }));
  const extras = [];
  for (const extra of EXTRA_ROOTS) {
    extras.push(...findSkills(extra, 0).map(s => ({ ...s, root: extra })));
  }

  const manifest = [];
  for (const s of all) {
    if (MISFILED[s.name]) {
      manifest.push({ ...s, action: 'RELOCATE', newPath: path.join(MISFILED[s.name], s.name).replace(/\\/g, '/') });
      continue;
    }
    manifest.push({ ...s, action: 'MOVE', newPath: classify(s.name) });
  }
  for (const s of extras) {
    manifest.push({ ...s, action: 'MOVE', newPath: `ci-cd/${EXTRA_ROOT_TOOL(s.name)}/${s.name}` });
  }
  return manifest;
}

const manifest = buildManifest();
const counts = {};
for (const m of manifest) counts[m.action] = (counts[m.action] || 0) + 1;
console.log('=== Manifest summary ===', counts);

const outPath = path.join(REPO_ROOT, 'scripts', '.cicd-reorg-manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`Manifest written to ${path.relative(REPO_ROOT, outPath)}`);

if (DRY_RUN) { console.log('\nDry run - no files moved.'); process.exit(0); }

let moved = 0, failed = 0;
for (const m of manifest) {
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
console.log(`\nMoved: ${moved}, Failed: ${failed}`);
