import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');

const PRIMARY_ROOT = 'DevOps_and_Cloud/Observability_and_SecOps';
const EXTRA_ROOTS = [
  'cloud/azure/monitoring/app-insights',
  'cloud/azure/monitoring/appinsights-instrumentation',
  'cloud/azure/monitoring/azure-diagnostics',
  'cloud/azure/monitoring/azure-monitor-audit',
  'cloud/azure/monitoring/dotnet/azure-monitor-opentelemetry-exporter-dotnet',
  'cloud/azure/monitoring/java/azure-monitor-opentelemetry-exporter-java',
  'cloud/azure/monitoring/python/azure-monitor-opentelemetry-exporter-py',
  'cloud/azure/monitoring/python/azure-monitor-opentelemetry-py',
  'cloud/azure/monitoring/typescript/azure-monitor-opentelemetry-ts',
  'cloud/aws/monitoring/aws-health-events',
  'cloud/aws/monitoring/aws-health-report',
  'cloud/aws/monitoring/service-quotas-monitor',
  'cloud/gcp/monitoring/gcp-audit-logs',
  'containers-orchestration/kubernetes/other/prometheus-and-grafana-monitoring-stack',
];

// SecOps content: not observability - relocate into the existing Security/ category
// (flat, matching Security/'s own established convention) per this reorg's decision
// to split Observability_and_SecOps into its two halves.
const SECOPS = [
  'anti-reversing-techniques', 'attack-tree-construction', 'cis-benchmarks', 'crack-hashcat',
  'dast-integration', 'dast-nuclei', 'dast-scanning', 'dast-zap', 'detection-rule-management',
  'detection-sigma', 'ebpf-threat-detection', 'hipaa-compliance', 'iso27001-compliance',
  'ot-security-assessment', 'pci-compliance', 'pentest-metasploit', 'pentesting',
  'red-team-operator', 'red-team-pentest', 'risk-management', 'risk-metrics-calculation',
  'sast-bandit', 'sast-configuration', 'sast-horusec', 'sast-semgrep', 'security-auditor',
  'security-compliance-mapping-soc2-iso-pci-nist', 'security-engineer',
  'security-gate-exception-management', 'security-posture-metrics-and-trend-analysis',
  'soc-analyst', 'threat-mitigation-mapping', 'vulnerability-scanning', 'webapp-nikto',
  'webapp-sqlmap', 'windows-hardening', 'linux-hardening', 'compliance-audit', 'case-management',
  'api-mitmproxy', 'analysis-tshark', 'debugview', 'sonarqube-code-quality-and-security',
  'falco-runtime-threat-detection-configuration',
];

// Not observability, not SecOps - genuinely misfiled elsewhere.
const MISFILED = {
  'accessibility-compliance': 'Software_Engineering_and_Other/Frontend',
  'auth-implementation-patterns': 'Software_Engineering_and_Other/Backend',
  caching: 'Software_Engineering_and_Other/Patterns',
  'checkout-cart': 'Software_Engineering_and_Other/Backend',
  'database-schema-migration-with-liquibase-and-flyway': 'Software_Engineering_and_Other/Databases',
  'liquibase-advanced-changelog-management-and-rollback-strategies': 'Software_Engineering_and_Other/Databases',
  'debugging-strategies': 'Software_Engineering_and_Other/Patterns',
  'debugging-strategy': 'Software_Engineering_and_Other/Patterns',
  'doubt-driven-development': 'Software_Engineering_and_Other/Patterns',
  'test-driven-development': 'Software_Engineering_and_Other/Patterns',
  'error-handling': 'Software_Engineering_and_Other/Patterns',
  'event-store-design': 'Software_Engineering_and_Other/Patterns',
  'integration-patterns': 'Software_Engineering_and_Other/Patterns',
  'grpc-service-troubleshooting': 'Software_Engineering_and_Other/Patterns',
  'network-protocols': 'Software_Engineering_and_Other/Patterns',
  networking: 'Mobile', // this is actually "mobile-networking" content
  'postgresql-operations-and-performance-tuning': 'Software_Engineering_and_Other/Databases',
  'pptx-reference-deck-analysis': 'Software_Engineering_and_Other/Miscellaneous',
  'python-automation-scripting-for-ops': 'Software_Engineering_and_Other/Languages',
  'release-versioning-and-changelog-automation': 'ci-cd/common/other',
  'semantic-versioning': 'ci-cd/common/other',
  'wiki-changelog': 'Software_Engineering_and_Other/Miscellaneous',
  'user-research': 'Product_and_Business',
  'track-management': 'Product_and_Business',
  'longhorn': 'containers-orchestration/kubernetes/storage',
  'longhorn-storage-configuration': 'containers-orchestration/kubernetes/storage',
  'rook-ceph-configuration-validation': 'containers-orchestration/kubernetes/storage',
  'rook-ceph-storage-operations': 'containers-orchestration/kubernetes/storage',
  'msk-operations': 'Data_Engineering',
  'service-mesh': 'containers-orchestration/common/service-mesh',
  'service-connectivity': 'containers-orchestration/common/service-mesh',
  'network-troubleshooting': 'containers-orchestration/kubernetes/networking',
  'backstage-developer-portal': 'containers-orchestration/common/other',
  'no-code-idp-service-catalog-tools-port-cortex-opslevel': 'containers-orchestration/common/other',
  'service-catalog': 'containers-orchestration/common/other',
  'disaster-recovery': 'containers-orchestration/common/other',
  'dr-review': 'containers-orchestration/common/other',
  'high-availability': 'containers-orchestration/common/other',
  'chaos-engineering': 'containers-orchestration/common/other',
  'gremlin-chaos-engineering-configuration': 'containers-orchestration/common/other',
  'cloud-resource-post-provisioning-validation-and-drift-detection': 'infrastructure-as-code/common/other',
  'data-governance': 'Data_Engineering',
  'devops-engineer': 'ci-cd/common/other',
  // duplicate terraform-policy conversion example artifacts (README + policy.hcl + sentinel) -
  // the data files are already correctly nested under the canonical terraform-policy skill;
  // these standalone copies only add a README not present there. Handled specially below,
  // not through the generic MOVE/RELOCATE path.
};

const TF_POLICY_EXAMPLES = ['step-functions-state-machine-logging-enabled', 'ec2-vpc-default-security-group-no-traffic'];
const TF_POLICY_EXAMPLES_DEST = 'infrastructure-as-code/terraform/best-practices/terraform-policy/examples/conversion';

const EXPLICIT = {
  // datadog / new relic / sentry - single-tool top folders
  datadog: 'datadog/other',
  'new-relic': 'new-relic/other',
  sentry: 'sentry/other',
  // prometheus / grafana
  'prometheus-configuration': 'prometheus/configuration',
  'grafana-dashboards': 'grafana/dashboards',
  'prometheus-grafana': 'common/other',
  'prometheus-and-grafana-monitoring-stack': 'common/other',
  // elasticsearch / ELK / kibana
  'elasticsearch-audit': 'elasticsearch/other',
  'elasticsearch-authz': 'elasticsearch/other',
  'elasticsearch-esql': 'elasticsearch/queries',
  'elasticsearch-opensearch-cluster-operations': 'elasticsearch/other',
  'elk-stack': 'elasticsearch/other',
  'kibana-anomaly-detection': 'elasticsearch/kibana',
  'kibana-audit': 'elasticsearch/kibana',
  'kibana-alerting-rules': 'elasticsearch/kibana',
  'kibana-connectors': 'elasticsearch/kibana',
  'kibana-dashboards': 'elasticsearch/kibana',
  'kibana-vega': 'elasticsearch/kibana',
  // fluent-bit
  'fluent-bit-configuration-validation': 'fluent-bit/other',
  'fluent-bit-log-forwarding-configuration': 'fluent-bit/other',
  // loki
  'logql-query-authoring': 'loki/log-queries',
  'loki-configuration-validation': 'loki/configuration',
  'loki-log-aggregation-configuration': 'loki/logging',
  'loki-logging': 'loki/logging',
  // jaeger / tracing
  'distributed-tracing-with-tempo-and-jaeger': 'jaeger/other',
  // opentelemetry
  opentelemetry: 'opentelemetry/other',
  'opentelemetry-configuration-validation': 'opentelemetry/other',
  'opentelemetry-instrumentation-and-collector-configuration': 'opentelemetry/instrumentation',
  'python-observability': 'opentelemetry/instrumentation',
  'edot-dotnet-instrument': 'opentelemetry/instrumentation',
  'edot-dotnet-migrate': 'opentelemetry/instrumentation',
  'edot-java-instrument': 'opentelemetry/instrumentation',
  'edot-java-migrate': 'opentelemetry/instrumentation',
  'edot-python-instrument': 'opentelemetry/instrumentation',
  'edot-python-migrate': 'opentelemetry/instrumentation',
  // azure monitor / app insights (pulled from cloud/)
  'app-insights': 'azure-monitor/application-insights',
  'appinsights-instrumentation': 'azure-monitor/application-insights',
  'azure-diagnostics': 'azure-monitor/monitoring',
  'azure-monitor-audit': 'azure-monitor/monitoring',
  'azure-monitor-opentelemetry-exporter-dotnet': 'azure-monitor/application-insights',
  'azure-monitor-opentelemetry-exporter-java': 'azure-monitor/application-insights',
  'azure-monitor-opentelemetry-exporter-py': 'azure-monitor/application-insights',
  'azure-monitor-opentelemetry-py': 'azure-monitor/application-insights',
  'azure-monitor-opentelemetry-ts': 'azure-monitor/application-insights',
  // cloudwatch / aws monitoring (pulled from cloud/)
  'aws-health-events': 'cloudwatch/other',
  'aws-health-report': 'cloudwatch/other',
  'service-quotas-monitor': 'cloudwatch/other',
  // gcp operations suite (pulled from cloud/)
  'gcp-audit-logs': 'gcp-operations/other',
  // common / shared - observability practice, cross-tool
  'alert-triage': 'common/alerting',
  alerting: 'common/alerting',
  'alerting-oncall': 'common/alerting',
  'on-call-management': 'common/alerting',
  'pagerduty-and-opsgenie-oncall-configuration': 'common/alerting',
  'pagerduty-opsgenie-configuration-validation': 'common/alerting',
  'skip-scheduled-maintenance': 'common/alerting',
  'audit-logging': 'common/logs',
  'log-management': 'common/logs',
  'logs-search': 'common/logs',
  'structured-logging': 'common/logs',
  capacity: 'common/capacity-monitoring',
  'capacity-planning': 'common/capacity-monitoring',
  'capacity-planning-and-load-testing': 'common/capacity-monitoring',
  'load-testing': 'common/capacity-monitoring',
  dashboards: 'common/dashboard-design',
  'sre-dashboards': 'common/dashboard-design',
  'devops-delivery-metrics-and-dora-analysis': 'common/metrics',
  'metrics-and-monitoring': 'common/metrics',
  incident: 'common/incident-detection',
  'ai-sre-incident-response': 'common/incident-detection',
  'incident-response': 'common/incident-detection',
  'incident-runbook-templates': 'common/incident-detection',
  runbook: 'common/incident-detection',
  runbooks: 'common/incident-detection',
  'operational-runbook-execution-and-escalation': 'common/incident-detection',
  'incident-investigation-using-metrics-logs-traces': 'common/root-cause-analysis',
  'k8s-investigation': 'common/root-cause-analysis',
  'postmortem-writing': 'common/root-cause-analysis',
  'root-cause-analysis': 'common/root-cause-analysis',
  monitoring: 'common/monitoring-strategy',
  'observability-scaling': 'common/monitoring-strategy',
  'service-health': 'common/monitoring-strategy',
  observability: 'common/fundamentals',
  'observability-and-instrumentation': 'common/fundamentals',
  'manage-slos': 'common/sli-slo-sla',
  'sla-management': 'common/sli-slo-sla',
  'sli-slo-management': 'common/sli-slo-sla',
  'slo-definition': 'common/sli-slo-sla',
  'slo-implementation': 'common/sli-slo-sla',
  'distributed-tracing': 'common/distributed-tracing',
  'service-mesh-observability': 'common/distributed-tracing',
  'ebpf-observability': 'common/other',
  'toil-reduction': 'common/other',
  'crash-reporting': 'common/other',
  'sre-engineer': 'common/other',
  'servicenow-itsm-configuration-validation': 'common/incident-detection',
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
    if (s.name === '_template') { manifest.push({ ...s, action: 'SKIP_TEMPLATE', newPath: null }); continue; }
    if (TF_POLICY_EXAMPLES.includes(s.name)) { manifest.push({ ...s, action: 'TF_POLICY_MERGE', newPath: `${TF_POLICY_EXAMPLES_DEST}/${s.name}` }); continue; }
    if (SECOPS.includes(s.name)) { manifest.push({ ...s, action: 'RELOCATE', newPath: `Security/${s.name}` }); continue; }
    if (MISFILED[s.name]) { manifest.push({ ...s, action: 'RELOCATE', newPath: path.join(MISFILED[s.name], s.name).replace(/\\/g, '/') }); continue; }
    if (EXPLICIT[s.name]) { manifest.push({ ...s, action: 'MOVE', newPath: `observability-monitoring-logging/${EXPLICIT[s.name]}/${s.name}` }); continue; }
    manifest.push({ ...s, action: 'NEEDS_REVIEW', newPath: null });
  }
  for (const s of extras) {
    if (!EXPLICIT[s.name]) { manifest.push({ ...s, action: 'NEEDS_REVIEW', newPath: null }); continue; }
    manifest.push({ ...s, action: 'MOVE', newPath: `observability-monitoring-logging/${EXPLICIT[s.name]}/${s.name}` });
  }
  return manifest;
}

const manifest = buildManifest();
const counts = {};
for (const m of manifest) counts[m.action] = (counts[m.action] || 0) + 1;
console.log('=== Manifest summary ===', counts);

const outPath = path.join(REPO_ROOT, 'scripts', '.observability-reorg-manifest.json');
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
  if (m.action === 'MOVE' || m.action === 'RELOCATE') {
    const destAbs = path.join(REPO_ROOT, m.newPath);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    try {
      execSync(`git mv "${m.relPath}" "${m.newPath}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
      moved++;
    } catch (e) {
      console.error(`[FAIL] git mv "${m.relPath}" -> "${m.newPath}": ${e.message.split('\n')[0]}`);
      failed++;
    }
  } else if (m.action === 'TF_POLICY_MERGE') {
    // Copy the README (unique content) into the canonical example dir, then drop
    // the redundant standalone folder (policy.hcl/sentinel already exist there).
    const destDir = path.join(REPO_ROOT, m.newPath);
    const srcReadme = path.join(REPO_ROOT, m.relPath, 'README.md');
    try {
      if (fs.existsSync(srcReadme) && fs.existsSync(destDir)) {
        fs.copyFileSync(srcReadme, path.join(destDir, 'README.md'));
      }
      execSync(`git add "${path.relative(REPO_ROOT, path.join(destDir, 'README.md'))}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
      execSync(`git rm -r -q -f "${m.relPath}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
      moved++;
    } catch (e) {
      console.error(`[FAIL] tf-policy-merge "${m.relPath}": ${e.message.split('\n')[0]}`);
      failed++;
    }
  }
}
console.log(`\nMoved: ${moved}, Failed: ${failed}`);
