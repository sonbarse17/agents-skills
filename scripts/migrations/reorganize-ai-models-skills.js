import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'AI_and_Agents/Models_and_FineTuning';

const MISFILED = {
  'bare-metal': 'Software_Engineering_and_Other/Miscellaneous/systems-low-level',
  'bi-tools': 'Data_Engineering',
  'causal-inference': 'Data_Engineering',
};

const SUBFOLDER = {
  // fine-tuning
  finetuning: 'fine-tuning', 'fine-tuning-expert': 'fine-tuning', 'finetuning-method-selection': 'fine-tuning',
  'llm-fine-tuning': 'fine-tuning', 'llm-finetuning': 'fine-tuning', 'llmops-fine-tuning-and-deployment': 'fine-tuning',
  'lora-qlora-recipes': 'fine-tuning', 'preference-optimization': 'fine-tuning', 'checkpoint-promotion': 'fine-tuning',
  'grpo-rlvr-training': 'fine-tuning', 'vision-sft': 'fine-tuning', 'trace-to-training-data': 'fine-tuning',
  // llmops / model lifecycle
  'llm-obs': 'llmops', 'llm-ops': 'llmops', mlops: 'llmops', 'llmops-platform-engineering': 'llmops',
  'model-monitoring-and-drift-detection': 'llmops', 'model-drift-alert-triage': 'llmops',
  'production-model-rollback-procedure': 'llmops', 'model-registry-governance': 'llmops',
  'mlflow-experiment-tracking-and-model-registry': 'llmops', 'weights-and-biases-experiment-tracking': 'llmops',
  'model-packaging-and-versioning': 'llmops', 'training-pipeline-orchestration': 'llmops',
  // inference / serving
  'model-serving': 'inference-serving', 'model-serving-and-scaling': 'inference-serving',
  'llm-inference-scaling': 'inference-serving', 'vllm-server': 'inference-serving',
  'tensorrt-optimization': 'inference-serving', 'triton-kernels': 'inference-serving',
  'paged-attention': 'inference-serving', 'kv-cache': 'inference-serving', 'quantized-export': 'inference-serving',
  'model-quantization': 'inference-serving', 'multi-tenant-llm-hosting': 'inference-serving',
  'llm-caching': 'inference-serving', 'flash-attention': 'inference-serving',
  // llm platform / ops tooling
  'llm-gateway': 'llm-platform', 'llm-gateway-and-multi-provider-routing': 'llm-platform',
  'llm-cost-optimization': 'llm-platform', 'llm-cost-and-latency-optimization': 'llm-platform',
  'ollama-stack': 'llm-platform', 'mac-mini-llm-lab': 'llm-platform', 'gpu-server-management': 'llm-platform',
  'gpu-engineer': 'llm-platform',
  // evaluation
  'agent-evaluation-and-guardrails': 'evaluation', 'eval-harness-first': 'evaluation',
  'llm-evaluation': 'evaluation', 'model-evaluation': 'evaluation', 'model-interpretability': 'evaluation',
  experimentation: 'evaluation',
  // rag / embeddings
  'embedding-strategies': 'rag-embeddings', embeddings: 'rag-embeddings', 'rag-pipeline-design': 'rag-embeddings',
  // agent reasoning patterns
  'agent-tool-use-patterns': 'agent-patterns', 'langchain-and-langgraph-agent-orchestration': 'agent-patterns',
  'tree-of-thoughts': 'agent-patterns', 'sandbox-execution': 'agent-patterns',
  // ML domains
  'classical-ml': 'ml-domains', 'computer-vision': 'ml-domains', nlp: 'ml-domains', 'time-series': 'ml-domains',
  'anomaly-detection': 'ml-domains', 'genai-vision': 'ml-domains', 'hyperparameter-tuning': 'ml-domains',
  'model-training': 'ml-domains', 'edge-ai': 'ml-domains',
  // common
  'meigen-ai-design': 'common', 'recommendation-systems': 'common', multimodal: 'common',
  'feature-store': 'common', preset: 'common',
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

const outPath = path.join(REPO_ROOT, 'scripts', '.ai-models-reorg-manifest.json');
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
