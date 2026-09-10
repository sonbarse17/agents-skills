import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');
const PRIMARY_ROOT = 'Security';

const MISFILED = {
  'risk-metrics-calculation': 'Product_and_Business', // financial VaR/CVaR/Sharpe, not security risk
};

const SUBFOLDER = {
  // pentest / red team / offensive
  'penetration-testing': 'pentest-redteam', pentesting: 'pentest-redteam', 'pentest-metasploit': 'pentest-redteam',
  'red-team-operator': 'pentest-redteam', 'red-team-pentest': 'pentest-redteam', 'recon-nmap': 'pentest-redteam',
  'privesc-linpeas': 'pentest-redteam', 'crack-hashcat': 'pentest-redteam', 'api-mitmproxy': 'pentest-redteam',
  'analysis-tshark': 'pentest-redteam', 'anti-reversing-techniques': 'pentest-redteam',
  'binary-analysis-patterns': 'pentest-redteam', 'protocol-reverse-engineering': 'pentest-redteam',
  'reverse-engineering': 'pentest-redteam', debugview: 'pentest-redteam', 'webapp-nikto': 'pentest-redteam', 'webapp-sqlmap': 'pentest-redteam',
  'ot-security-assessment': 'pentest-redteam', 'ai-red-teaming': 'pentest-redteam',
  // scanning: SAST / DAST / dependency / container
  'sast-bandit': 'scanning', 'sast-configuration': 'scanning', 'sast-horusec': 'scanning',
  'sast-integration': 'scanning', 'sast-scanning': 'scanning', 'sast-semgrep': 'scanning',
  'sast-dast': 'scanning', 'dast-ffuf': 'scanning', 'dast-integration': 'scanning', 'dast-nuclei': 'scanning',
  'dast-scanning': 'scanning', 'dast-zap': 'scanning', 'owasp-zap-dast-configuration': 'scanning',
  'dependency-scanning': 'scanning', 'vulnerability-scanning': 'scanning', 'security-scanning': 'scanning',
  'container-grype': 'scanning', 'container-hadolint': 'scanning', 'image-scanning': 'scanning',
  'fortify-static-analysis': 'scanning', 'sonarqube-code-quality-and-security': 'scanning',
  'software-composition-analysis-sca': 'scanning', 'sca-blackduck': 'scanning', 'sca-trivy': 'scanning',
  'trivy-vulnerability-scanning': 'scanning', 'snyk-vulnerability-and-license-scanning': 'scanning',
  'secrets-gitleaks': 'scanning', scan: 'scanning',
  // supply chain
  sbom: 'supply-chain', 'sbom-supply-chain': 'supply-chain', 'sbom-syft': 'supply-chain',
  'supply-chain-attack-response': 'supply-chain', 'supply-chain-security': 'supply-chain',
  'supply-chain-security-slsa-sbom': 'supply-chain', 'model-supply-chain-security': 'supply-chain',
  // compliance / audit
  'cis-benchmarks': 'compliance', 'cis-benchmarks-hardening': 'compliance', 'compliance-as-code': 'compliance',
  'compliance-audit': 'compliance', 'gdpr-compliance': 'compliance', 'gdpr-data-handling': 'compliance',
  'hipaa-compliance': 'compliance', 'iso27001-compliance': 'compliance', 'pci-compliance': 'compliance',
  'soc2-compliance': 'compliance', 'security-compliance-mapping-soc2-iso-pci-nist': 'compliance',
  // identity / access
  'access-review': 'identity-access', 'auth-patterns': 'identity-access', biometrics: 'identity-access',
  'identity-access-management': 'identity-access', 'identity-provider': 'identity-access', rbac: 'identity-access',
  'zero-trust': 'identity-access', 'zero-trust-identity': 'identity-access',
  'spiffe-spire-workload-identity-configuration': 'identity-access', 'mtls-configuration': 'identity-access',
  'session-guard': 'identity-access',
  // cryptography / secrets management
  vault: 'cryptography-secrets', 'vault-configuration-validation': 'cryptography-secrets',
  'hashicorp-vault': 'cryptography-secrets', 'vault-operations-and-pki-engine-configuration': 'cryptography-secrets',
  'modern-cryptography': 'cryptography-secrets', 'certificate-lifecycle-management-at-scale': 'cryptography-secrets',
  'ssl-tls-management': 'cryptography-secrets', 'signed-audit-trails-recipe': 'cryptography-secrets',
  // incident response / detection / forensics
  'blue-team-soc': 'incident-response', 'case-management': 'incident-response',
  'critical-vulnerability-emergency-response': 'incident-response', 'detection-rule-management': 'incident-response',
  'detection-sigma': 'incident-response', 'ebpf-threat-detection': 'incident-response',
  'edr-xdr': 'incident-response', 'falco-configuration-validation': 'incident-response',
  'falco-runtime-threat-detection-configuration': 'incident-response', 'forensics-osquery': 'incident-response',
  'ir-velociraptor': 'incident-response', 'memory-forensics': 'incident-response',
  'siem-engineering': 'incident-response', 'soc-analyst': 'incident-response', 'soc-operations': 'incident-response',
  'threat-intelligence': 'incident-response',
  // threat modeling
  'attack-tree-construction': 'threat-modeling', 'stride-analysis-patterns': 'threat-modeling',
  'threat-mitigation-mapping': 'threat-modeling', 'threat-modeling': 'threat-modeling', pytm: 'threat-modeling',
  // policy as code
  'opa-gatekeeper-policy-authoring': 'policy-as-code', 'policy-as-code': 'policy-as-code',
  'policy-as-code-guardrails': 'policy-as-code', 'policy-opa': 'policy-as-code',
  // application security
  'api-security': 'app-security', 'owasp-top-10-secure-coding-standards': 'app-security',
  'owasp-web-security': 'app-security', 'waf-setup': 'app-security', 'secure-cicd-gates': 'app-security',
  'secure-code-guardian': 'app-security', 'data-security': 'app-security',
  'cloudtrail-server-side-encryption-enabled': 'app-security', 'sops-encryption': 'app-security',
  // AI / agent / MCP security
  'ai-agent-security': 'ai-security', 'ai-coding-agent-guardrails': 'ai-security',
  'ai-security-hardening': 'ai-security', 'llm-app-security': 'ai-security', 'mcp-server-security': 'ai-security',
  'prompt-injection-defense': 'ai-security', 'openclaw-deployment-hardening': 'ai-security',
  'openclaw-local-mac-mini': 'ai-security', 'openclaw-security-hardening': 'ai-security',
  'review-agent-governance': 'ai-security', 'protect-mcp-setup': 'ai-security',
  // common - generalist roles, generic overview, risk/asset mgmt
  devsecops: 'common', 'security-and-hardening': 'common', 'security-auditor': 'common',
  'security-automation': 'common', 'security-engineer': 'common', 'security-finding-backlog-triage': 'common',
  'security-gate-exception-management': 'common', 'security-posture-metrics-and-trend-analysis': 'common',
  'security-requirement-extraction': 'common', 'security-review': 'common', 'security-reviewer': 'common',
  security: 'common', 'risk-management': 'common', 'asset-inventory': 'common',
  'generate-security-sample-data': 'common', 'wiz-security-context': 'common',
  'ci-access-and-credential-lifecycle-management': 'common', windows_hardening_placeholder: 'common',
};
delete SUBFOLDER.windows_hardening_placeholder;
SUBFOLDER['windows-hardening'] = 'common';
SUBFOLDER['linux-hardening'] = 'common';

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

const outPath = path.join(REPO_ROOT, 'scripts', '.security-reorg-manifest.json');
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
