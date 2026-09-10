import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');

const PRIMARY_ROOT = 'DevOps_and_Cloud/Infrastructure_as_Code';
const EXTRA_ROOTS = [
  'containers-orchestration/kubernetes/other/crossplane-kubernetes-native-provisioning',
];

// Not IaC at all - leftover mis-filing.
const MISFILED = {
  'kibana-alerting-rules': 'DevOps_and_Cloud/Observability_and_SecOps',
  'kibana-connectors': 'DevOps_and_Cloud/Observability_and_SecOps',
};

const EXPLICIT = {
  ansible: 'ansible/other',
  'ansible-playbook-and-role-design': 'ansible/other',
  bicep: 'bicep/other',
  cloudformation: 'cloudformation/other',
  'crossplane-configuration-validation': 'crossplane/other',
  'crossplane-kubernetes-native-provisioning': 'crossplane/other',
  'checkov-and-tfsec-iac-security-scanning': 'common/security',
  'iac-checkov': 'common/security',
  'immutable-infrastructure': 'common/patterns',
  'infrastructure-as-code': 'common/other',
  'infrastructure-as-code-terraform': 'terraform/other',
  'infrastructure-post-deployment-validation-and-smoke-testing': 'common/testing',
  'infrastructure-testing': 'common/testing',
  'new-terraform-provider': 'terraform/providers',
  'opentofu-migration': 'opentofu/other',
  'provider-actions': 'terraform/providers',
  'provider-configuration': 'terraform/providers',
  'provider-docs': 'terraform/providers',
  'provider-ephemeral-resources': 'terraform/providers',
  'provider-framework-migration': 'terraform/providers',
  'provider-resources': 'terraform/providers',
  'provider-test-patterns': 'terraform/providers',
  pulumi: 'pulumi/other',
  terraform: 'terraform/other',
  'terraform-cloud-and-spacelift-iac-orchestration-platforms': 'terraform/other',
  'terraform-engineer': 'terraform/best-practices',
  'terraform-module-library': 'terraform/modules',
  'terraform-modules': 'terraform/modules',
  'terraform-policy': 'terraform/best-practices',
  'terraform-review': 'terraform/troubleshooting',
  'terraform-search-import': 'terraform/state',
  'terraform-stacks': 'terraform/workspaces',
  'terraform-style-guide': 'terraform/best-practices',
  'terraform-test': 'terraform/best-practices',
  'terragrunt-configuration-and-dry-run-validation': 'terraform/workspaces',
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
    if (EXPLICIT[s.name]) {
      manifest.push({ ...s, action: 'MOVE', newPath: `infrastructure-as-code/${EXPLICIT[s.name]}/${s.name}` });
      continue;
    }
    manifest.push({ ...s, action: 'NEEDS_REVIEW', newPath: null });
  }
  for (const s of extras) {
    if (!EXPLICIT[s.name]) { manifest.push({ ...s, action: 'NEEDS_REVIEW', newPath: null }); continue; }
    manifest.push({ ...s, action: 'MOVE', newPath: `infrastructure-as-code/${EXPLICIT[s.name]}/${s.name}` });
  }
  return manifest;
}

const manifest = buildManifest();
const counts = {};
for (const m of manifest) counts[m.action] = (counts[m.action] || 0) + 1;
console.log('=== Manifest summary ===', counts);

const outPath = path.join(REPO_ROOT, 'scripts', '.iac-reorg-manifest.json');
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
