import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const APPLY_LINKS = process.argv.includes('--fix-links');

// ---------------------------------------------------------------------------
// Roots to scan for cloud skills
// ---------------------------------------------------------------------------
const PRIMARY_ROOT = 'DevOps_and_Cloud/Cloud_Providers';
const EXTRA_ROOTS = [
  'DevOps_and_Cloud/Containers_and_Orchestration/azure-aks',
  'DevOps_and_Cloud/Containers_and_Orchestration/azure-kubernetes',
  'DevOps_and_Cloud/Containers_and_Orchestration/azure-kubernetes-app-deploy',
  'DevOps_and_Cloud/Containers_and_Orchestration/azure-kubernetes-automatic-readiness',
  'DevOps_and_Cloud/Containers_and_Orchestration/azure-app-onboard-prereq',
  'DevOps_and_Cloud/Containers_and_Orchestration/gcp-gke',
  'DevOps_and_Cloud/Containers_and_Orchestration/complete-idp-deployment-on-aws-from-scratch',
  'DevOps_and_Cloud/Containers_and_Orchestration/complete-idp-deployment-on-azure-from-scratch',
  'DevOps_and_Cloud/Containers_and_Orchestration/complete-idp-deployment-on-gcp-from-scratch',
  'DevOps_and_Cloud/Infrastructure_as_Code/terraform-aws',
  'DevOps_and_Cloud/Infrastructure_as_Code/terraform-azure',
  'DevOps_and_Cloud/Infrastructure_as_Code/terraform-gcp',
  'DevOps_and_Cloud/Infrastructure_as_Code/azure-deploy',
  'DevOps_and_Cloud/Infrastructure_as_Code/azure-verified-modules',
  'DevOps_and_Cloud/Infrastructure_as_Code/aws-cloudformation-templates',
  'Data_Engineering/cloud-data-warehouse-operations-snowflake-bigquery-redshift',
  'Security/enrich-with-aws-security-agent',
  'AI_and_Agents/Workflows/microsoft-azure-webjobs-extensions-authentication-events-dotnet',
];

// Items inside Cloud_Providers that are NOT cloud-provider skills at all -
// relocate to their real home instead of moving into cloud/.
const MISFILED = {
  'owasp-top-10-secure-coding-standards': 'Security',
  'sonarqube-code-quality-and-security': 'DevOps_and_Cloud/Observability_and_SecOps',
  'prometheus-grafana': 'DevOps_and_Cloud/Observability_and_SecOps',
  'kibana-dashboards': 'DevOps_and_Cloud/Observability_and_SecOps',
  'kibana-vega': 'DevOps_and_Cloud/Observability_and_SecOps',
  'consul-service-mesh-and-discovery-configuration': 'DevOps_and_Cloud/Containers_and_Orchestration',
  'knative-eventing-configuration': 'DevOps_and_Cloud/Containers_and_Orchestration',
  'secrets-gitleaks': 'Security',
  'secure-code-guardian': 'Security',
  'security-reviewer': 'Security',
  'generate-security-sample-data': 'Security',
  'python-automation-scripting-for-ops': 'DevOps_and_Cloud/Observability_and_SecOps',
  'dashboards': 'DevOps_and_Cloud/Observability_and_SecOps',
  'copilot-sdk': 'AI_and_Agents/Workflows',
};

// Explicit provider override for folders with no provider prefix in the name.
const PROVIDER_OVERRIDE = {
  storage: 'azure', 'key-vault': 'azure', functions: 'azure', azcli: 'azure', azd: 'azure',
  'app-service': 'azure', 'app-insights': 'azure', cosmos: 'azure', 'static-web-apps': 'azure',
  'blob-eventgrid': 'azure', 'service-bus': 'azure', messaging: 'azure', 'microsoft-foundry': 'azure',
  'entra-app-registration': 'azure', 'arm-templates': 'azure', redis: 'azure', cicd: 'azure',
  'key-vault-secrets': 'azure',
  's3-block-public-access-bucket-level': 'aws', 's3-bucket-should-have-object-lock-enabled': 'aws',
  'cloudfront-associated-with-waf': 'aws', 'rds-aidba': 'aws', 'service-quotas-monitor': 'aws',
  'django-storages-s3': 'aws',
  'oracle-cloud': 'oracle', 'complete-idp-deployment-on-oci-from-scratch': 'oracle',
  'complete-kubernetes-deployment-on-oke-oci-from-scratch': 'oracle', 'oci-landing-zone-setup': 'oracle',
  'alibaba-cloud': 'alibaba', digitalocean: 'digitalocean', 'ibm-cloud': 'ibm',
  hetzner: 'other', 'firebase-app-platform': 'other', 'vercel-deployments': 'other',
  'agent-framework-azure-ai-py': 'azure', 'airunway-aks-setup': 'azure',
  'appinsights-instrumentation': 'azure', 'applicationinsights-web-ts': 'azure',
  'm365-agents-dotnet': 'azure', 'entra-agent-id': 'azure', 'python-appservice-deploy': 'azure',
  'microsoft-azure-webjobs-extensions-authentication-events-dotnet': 'azure',
  'microsoft-docs': 'azure', 'service-quota-check': 'aws',
  'complete-mlops-platform-deployment-on-aws-from-scratch': 'aws',
  'complete-mlops-platform-deployment-on-azure-from-scratch': 'azure',
  'complete-mlops-platform-deployment-on-gcp-from-scratch': 'gcp',
  'complete-idp-deployment-on-aws-from-scratch': 'aws',
  'complete-idp-deployment-on-azure-from-scratch': 'azure',
  'complete-idp-deployment-on-gcp-from-scratch': 'gcp',
  'terraform-aws': 'aws', 'terraform-azure': 'azure', 'terraform-gcp': 'gcp',
  'enrich-with-aws-security-agent': 'aws',
};

// Skills bundled inside a vendored wrapper (azure-sdk-*) that are NOT actually
// cloud-provider content - generic language/framework skills that hitched a
// ride in the same upstream repo. Relocate to their real home, not cloud/.
const NOT_CLOUD_AT_ALL = {
  'fastapi-router-py': 'Software_Engineering_and_Other/Backend',
  'pydantic-models-py': 'Software_Engineering_and_Other/Backend',
  'm365-agents-py': 'AI_and_Agents/Workflows',
  'm365-agents-ts': 'AI_and_Agents/Workflows',
  'frontend-ui-dark-ts': 'Software_Engineering_and_Other/Frontend',
  'react-flow-node-ts': 'Software_Engineering_and_Other/Frontend',
  'zustand-store-ts': 'Software_Engineering_and_Other/Frontend',
};
Object.assign(MISFILED, NOT_CLOUD_AT_ALL);

// Generic / multi-cloud names -> common/
const COMMON_NAMES = new Set([
  'multi-cloud', 'multi-cloud-architecture', 'multi-cloud-networking-patterns',
  'hybrid-cloud', 'hybrid-cloud-networking', 'finops', 'cloud-budgeting',
  'cloud-cost-anomaly-investigation', 'cloud-cost-finops-optimization', 'cloud-cost-optimization',
  'cloud-migration', 'cloud-well-architected-framework-review', 'cloud-architecture',
  'cloud-architect', 'cloud-solution-architect', 'cloud-networking', 'cloud-native-storage-strategy',
  'cloud-iam-hardening', 'cloud-access-request-and-iam-lifecycle-management', 'iam-access-management',
  'access-management', 'fedramp-compliance', 'pci-dss-compliance', 'disaster-recovery-and-backup-strategy',
  'on-prem-infrastructure-patterns', 'resource-tagging', 'rightsizing', 'cost', 'cost-optimization',
  'cost-governance', 'cost-benefit', 'data-cost-optimization', 'investigation-cost-guardrail',
  'kubecost-cost-visibility', 'orphaned-cloud-resource-cleanup', 'saas-security-posture',
  'prisma-cloud-cspm-and-workload-protection', 'secrets-management', 'configuration-management',
  'container-registries', 'backup-recovery', 'block-storage', 'distributed-storage', 'file-storage',
  'nfs-storage', 'object-storage', 'storage-infrastructure', 'storage-s3-resiliency-expertise',
  'environment-management', 'self-service-infrastructure', 'support-cases', 'setup', 'gpu-accelerator-infrastructure-for-ml-training',
  'gpu-accelerator-configuration-validation', 'database-rds-devops', 'cdn-edge', 'cdn-setup', 'vpn-setup',
  'firewall-config', 'enterprise-sso-and-idp-federation-configuration', 'feature-forge',
  'complete-ai-agent-stack-deployment-cloud-managed-from-scratch', 'complete-ai-agent-stack-deployment-self-hosted-from-scratch',
  'complete-cicd-pipeline-deployment-for-kubernetes-from-scratch', 'complete-cicd-pipeline-deployment-for-serverless-from-scratch',
  'complete-devsecops-pipeline-for-kubernetes-from-scratch', 'complete-devsecops-pipeline-for-serverless-from-scratch',
  'complete-idp-deployment-on-prem-from-scratch',
  'cloud-data-warehouse-operations-snowflake-bigquery-redshift',
]);

// ---------------------------------------------------------------------------
// Category keyword rules (checked in order, first match wins) per provider
// ---------------------------------------------------------------------------
const CATEGORY_RULES = [
  ['containers', /aks|gke|eks|kubernetes/i],
  ['ai', /\bai\b|-ai-|cognitive|foundry|\bml-|contentsafety|contentunderstanding|translation|voicelive|formrecognizer|document-intelligence|botservice|anomalydetector|textanalytics|language-conversations|search-documents|bigquery|mlops/i],
  ['messaging', /eventgrid|eventhub|service-?bus|webpubsub|communication|messaging|blob-eventgrid/i],
  ['database', /\brds\b|\bsql\b|cosmos|postgres|mysql|redis|kusto|cloud-sql|data-tables|mongodbatlas|fabric/i],
  ['identity', /\biam\b|identity|entra|access-management/i],
  ['security', /key-?vault|secrets|security|compliance|waf|cloudtrail/i],
  ['storage', /\bs3\b|blob|storage|file-share|datalake|queue/i],
  ['networking', /vpc|networking|vnet|\bcdn\b|\bdns\b|firewall/i],
  ['api', /apimanagement|apicenter|aigateway/i],
  ['iac', /arm-templates|bicep|terraform-|cloudformation|verified-modules|landing-zone|image-builder|ami-builder/i],
  ['monitoring', /monitor|diagnostics|\baudit\b|health|app-?insights|application-?insights/i],
  ['cost', /\bcost\b|budget|rightsizing|quota|finops/i],
  ['architecture', /well-architected|solution-architect|\barchitect\b|\barchitecture\b/i],
  ['migration', /migrat|disaster-recovery|backup-recovery/i],
  ['devops', /devops|pipeline|\bcicd\b|\bazd\b|\bazcli\b|codepipeline|codedeploy|resource-manager|resource-visualizer|resource-lookup|idp-deployment|self-service-infrastructure/i],
  ['compute', /ec2|lambda|functions|\bvms?\b|compute|app-?service|ecs|fargate|serverless|batch/i],
];

const LANG_SUFFIX = [
  [/-py$/, 'python'], [/-dotnet$/, 'dotnet'], [/-java$/, 'java'],
  [/-ts$/, 'typescript'], [/-typescript$/, 'typescript'], [/-rust$/, 'rust'],
];

// ---------------------------------------------------------------------------
// Step 1: find all skill folders under a root
// ---------------------------------------------------------------------------
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
    return results; // leaf - don't recurse into a skill's own subfolders
  }
  if (entryType === 'README.md' && depth <= 1) {
    results.push({ relPath: root, entryFile: 'README.md', name: path.basename(root) });
    return results; // leaf - templates/ etc under it are assets, not skills
  }

  // wrapper dir (e.g. azure-sdk-python/, azure-skills/skills/...) - recurse
  let entries;
  try { entries = fs.readdirSync(abs, { withFileTypes: true }); } catch { return results; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    results.push(...findSkills(path.join(root, e.name), depth + 1));
  }
  return results;
}

function classifyProvider(name) {
  if (/^azure-|^azure$/i.test(name)) return 'azure';
  if (/^aws-|^aws$/i.test(name)) return 'aws';
  if (/^gcp-|^gcp$/i.test(name) || /^google-cloud/i.test(name)) return 'gcp';
  if (/^cloudflare-/i.test(name)) return 'cloudflare';
  if (PROVIDER_OVERRIDE[name]) return PROVIDER_OVERRIDE[name];
  if (COMMON_NAMES.has(name)) return 'common';
  return null; // unclassified
}

function classifyCategory(name, provider) {
  let stripped = name.replace(new RegExp(`^${provider}-`), '');
  let language = null;
  for (const [re, lang] of LANG_SUFFIX) {
    if (re.test(stripped)) { language = lang; stripped = stripped.replace(re, ''); break; }
  }
  for (const [cat, re] of CATEGORY_RULES) {
    if (re.test(name) || re.test(stripped)) return { category: cat, language };
  }
  return { category: 'other', language };
}

// ---------------------------------------------------------------------------
// Main: build manifest
// ---------------------------------------------------------------------------
const ONLY_ARG = process.argv.find(a => a.startsWith('--only='));
const ONLY_NAMES = ONLY_ARG ? new Set(ONLY_ARG.slice('--only='.length).split(',')) : null;

function buildManifest() {
  let all = [];
  all.push(...findSkills(PRIMARY_ROOT, 0).map(s => ({ ...s, root: PRIMARY_ROOT })));
  for (const extra of EXTRA_ROOTS) {
    const found = findSkills(extra, 0);
    all.push(...found.map(s => ({ ...s, root: extra })));
  }
  if (ONLY_NAMES) all = all.filter(s => ONLY_NAMES.has(s.name));

  // group by basename for duplicate canonicalization
  const byName = new Map();
  for (const s of all) {
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name).push(s);
  }

  const manifest = [];
  for (const [name, group] of byName) {
    const isVendoredWrapper = (p) => /[\\/]skills[\\/]/.test(p);
    const canonical = group.find(s => !isVendoredWrapper(s.relPath)) || group[0];
    const skipped = group.filter(s => s !== canonical);

    for (const s of skipped) {
      manifest.push({ ...s, action: 'SKIP_DUPLICATE', reason: `duplicate of ${canonical.relPath}`, newPath: null });
    }

    // misfiled non-cloud items
    if (MISFILED[name] && canonical.root === PRIMARY_ROOT) {
      manifest.push({ ...canonical, action: 'RELOCATE', newPath: path.join(MISFILED[name], name).replace(/\\/g, '/') });
      continue;
    }

    const provider = classifyProvider(name);
    if (!provider) {
      manifest.push({ ...canonical, action: 'NEEDS_REVIEW', newPath: null });
      continue;
    }
    if (provider === 'other') {
      manifest.push({ ...canonical, action: 'MOVE', newPath: `cloud/other/${name}` });
      continue;
    }

    const flatProviders = new Set(['oracle', 'alibaba', 'digitalocean', 'ibm', 'cloudflare']);
    if (flatProviders.has(provider)) {
      manifest.push({ ...canonical, action: 'MOVE', newPath: `cloud/${provider}/${name}` });
      continue;
    }

    const { category, language } = classifyCategory(name, provider);
    const segs = ['cloud', provider, category];
    if (language) segs.push(language);
    segs.push(name);
    manifest.push({ ...canonical, action: 'MOVE', newPath: segs.join('/') });
  }

  return manifest;
}

const manifest = buildManifest();

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const counts = {};
for (const m of manifest) counts[m.action] = (counts[m.action] || 0) + 1;
console.log('=== Manifest summary ===');
console.log(counts);

const outPath = path.join(REPO_ROOT, 'scripts', '.cloud-reorg-manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`\nFull manifest written to ${path.relative(REPO_ROOT, outPath)}`);

console.log('\n=== NEEDS_REVIEW (unclassified) ===');
for (const m of manifest.filter(x => x.action === 'NEEDS_REVIEW')) {
  console.log(' -', m.relPath);
}

if (DRY_RUN) {
  console.log('\nDry run - no files moved.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Apply moves with git mv
// ---------------------------------------------------------------------------
let moved = 0, failed = 0;
for (const m of manifest) {
  if (m.action !== 'MOVE' && m.action !== 'RELOCATE') continue;
  const src = m.relPath;
  const dest = m.newPath;
  const destAbs = path.join(REPO_ROOT, dest);
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  try {
    execSync(`git mv "${src}" "${dest}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
    moved++;
  } catch (e) {
    console.error(`[FAIL] git mv "${src}" -> "${dest}": ${e.message.split('\n')[0]}`);
    failed++;
  }
}
console.log(`\nMoved: ${moved}, Failed: ${failed}`);
