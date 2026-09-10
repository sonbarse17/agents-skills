import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'AI_and_Agents/Workflows';

const MISFILED = {
  'dns-management': 'containers-orchestration/common/other',
  'postgresql-high-availability-and-failover': 'Software_Engineering_and_Other/Databases/relational',
  'chef-puppet-saltstack-legacy-config-management': 'infrastructure-as-code/ansible/other',
  'fairwinds-polaris-and-goldilocks': 'containers-orchestration/kubernetes/security',
  'sysdig-secure-runtime-security': 'Security/incident-response',
  'vuln-defectdojo': 'Security/scanning',
  'vulnerability-management': 'Security/scanning',
  'promql-query-authoring': 'observability-monitoring-logging/prometheus/configuration',
  'ebpf-engineering': 'containers-orchestration/kubernetes/networking',
  'sql-pro': 'Software_Engineering_and_Other/Databases/relational',
  'cli-developer': 'Software_Engineering_and_Other/Backend/common',
  'ai-inference-service-mesh': 'containers-orchestration/common/service-mesh',
  abac: 'Security/identity-access',
};

const SUBFOLDER = {
  // prompting
  'prompt-engineer': 'prompt-engineering', 'prompt-engineering': 'prompt-engineering',
  'prompt-engineering-patterns': 'prompt-engineering', 'prompt-and-context-engineering': 'prompt-engineering',
  'few-shot-prompting': 'prompt-engineering', 'chain-of-thought': 'prompt-engineering',
  'avoid-ai-writing': 'prompt-engineering', 'context-engineering': 'prompt-engineering',
  // multi-agent coordination
  'multi-agent-orchestration': 'multi-agent', 'multi-agent-topology': 'multi-agent',
  'crewai-and-autogen-multi-agent-frameworks': 'multi-agent', 'task-coordination-strategies': 'multi-agent',
  'parallel-feature-development': 'multi-agent',
  // agent development / building
  'agent-builder': 'agent-development', 'agent-implementation-plan': 'agent-development',
  'agent-task-checklist': 'agent-development', 'agent-walkthrough-report': 'agent-development',
  'agentic-workflows': 'agent-development', 'ai-agents': 'agent-development', ai: 'agent-development',
  'code-knowledge-graph-tools-for-ai-agents': 'agent-development', 'tool-calling-principles': 'agent-development',
  'langchain-patterns': 'agent-development',
  // agent diagnostics / triage
  'agent-bad-response-triage-and-root-cause-classification': 'agent-diagnostics',
  'agent-cost-and-latency-spike-investigation': 'agent-diagnostics',
  'agent-tool-call-loop-diagnosis-and-circuit-breaking': 'agent-diagnostics',
  'ai-debt-detector': 'agent-diagnostics',
  // evaluation
  'agent-evals': 'evaluation', 'evaluation-methodology': 'evaluation', 'ai-testing': 'evaluation',
  // pipelines
  'ai-pipeline-orchestration': 'pipelines', 'ml-pipeline': 'pipelines', 'ml-pipeline-workflow': 'pipelines',
  'airflow-dag-authoring-and-validation': 'pipelines', 'airflow-dag-patterns': 'pipelines',
  'airflow-scheduler-and-dag-troubleshooting': 'pipelines',
  // applied AI / agent products
  'ai-content-optimization': 'applied-ai', 'ai-saas': 'applied-ai', 'ai-architect': 'applied-ai',
  'deep-research': 'applied-ai', 'github-issue-creator': 'applied-ai', 'copilot-sdk': 'applied-ai',
  'm365-agents-py': 'applied-ai', 'm365-agents-ts': 'applied-ai', 'refactor-module': 'applied-ai',
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

const outPath = path.join(REPO_ROOT, 'scripts', '.ai-workflows-reorg-manifest.json');
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
