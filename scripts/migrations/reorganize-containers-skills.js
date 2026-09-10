import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../');

const DRY_RUN = process.argv.includes('--dry-run');

const PRIMARY_ROOT = 'DevOps_and_Cloud/Containers_and_Orchestration';
const EXTRA_ROOTS = [
  // Managed-K8s / container-PaaS skills pulled back out of cloud/ per this reorg's decision
  'cloud/azure/containers/azure-aks',
  'cloud/azure/containers/airunway-aks-setup',
  'cloud/gcp/containers/gcp-gke',
  'cloud/aws/containers/aws-eks-node-diagnostics-mcp',
  'cloud/aws/compute/aws-ecs-fargate',
  // Argo/Flux GitOps tooling pulled back out of ci-cd/ per this reorg's decision
  'ci-cd/argocd/other/argo-cd',
  'ci-cd/argocd/other/argo-events-and-event-driven-automation',
  'ci-cd/argocd/other/argo-rollouts-progressive-delivery',
  'ci-cd/argocd/other/argo-workflows-pipeline-design',
  'ci-cd/argocd/other/argocd',
  'ci-cd/argocd/other/argocd-application-configuration',
  'ci-cd/argocd/other/argocd-applicationset-patterns',
  'ci-cd/argocd/other/argocd-gitops',
  'ci-cd/argocd/other/argocd-operations',
  'ci-cd/argocd/other/argocd-sync-failure-and-drift-investigation',
  'ci-cd/argocd/other/complete-gitops-argocd-deployment-on-aks-from-scratch',
  'ci-cd/argocd/other/complete-gitops-argocd-deployment-on-eks-from-scratch',
  'ci-cd/argocd/other/complete-gitops-argocd-deployment-on-gke-from-scratch',
  'ci-cd/argocd/other/complete-gitops-argocd-deployment-on-prem-from-scratch',
  'ci-cd/fluxcd/other/flux-cd-configuration-and-reconciliation',
  'ci-cd/fluxcd/other/flux-cd-configuration-validation',
  // Scattered, misfiled elsewhere in the repo
  'AI_and_Agents/Models_and_FineTuning/model-serving-kubernetes',
  'Software_Engineering_and_Other/Frontend/kustomize-overlay-management',
];

// Items inside Containers_and_Orchestration that are NOT container/orchestration
// skills at all - relocate to their real home instead of containers-orchestration/.
const MISFILED = {
  'azure-mgmt-mongodbatlas-dotnet': 'cloud/azure/database',
  'kafka-cluster-configuration': 'Data_Engineering',
  'kafka-consumer-lag-and-partition-troubleshooting': 'Data_Engineering',
  'elasticsearch-opensearch-cluster-operations': 'DevOps_and_Cloud/Observability_and_SecOps',
  'vault-operations-and-pki-engine-configuration': 'Security',
  'sops-encryption': 'Security',
  'rds-operation-review': 'cloud/aws/database',
  'certificate-lifecycle-management-at-scale': 'Security',
  serverless: 'Software_Engineering_and_Other/Patterns',
  'deployment-strategies': 'ci-cd/common/deployment',
};

// Explicit destination (tool[/subfolder]) per skill name, checked before any
// keyword fallback. This reorg has too many nuanced calls for regex alone.
const EXPLICIT = {
  // docker
  'container-build-and-release': 'docker/build',
  'container-hardening': 'docker/security',
  'container-image-hardening': 'docker/security',
  'container-registry': 'docker/registry',
  'container-scanning': 'docker/security',
  'container-security': 'docker/security',
  containerization: 'docker/other',
  docker: 'docker/other',
  'docker-management': 'docker/other',
  'docker-patterns': 'docker/other',
  'docker-review': 'docker/troubleshooting',
  'complete-idp-deployment-with-docker-from-scratch': 'docker/other',
  // docker-compose (own top folder)
  'docker-compose': 'docker-compose/other',
  // container runtime spans docker+containerd - shared
  'container-runtime-docker-containerd': 'common/other',
  // azure container apps (PaaS container hosting, its own tool)
  'container-apps': 'azure-container-apps/other',
  // kubernetes
  'k8s-manifest-generator': 'kubernetes/workloads',
  'k8s-operators': 'kubernetes/workloads',
  'k8s-review': 'kubernetes/troubleshooting',
  'k8s-security-policies': 'kubernetes/security',
  kubectl: 'kubernetes/other',
  'kubeflow-ml-pipeline-orchestration': 'kubernetes/workloads',
  kubernetes: 'kubernetes/other',
  'kubernetes-autoscaling': 'kubernetes/scaling',
  'kubernetes-cluster-post-provision-conformance-validation': 'kubernetes/troubleshooting',
  'kubernetes-cluster-provisioning-with-kubeadm-and-cluster-api': 'kubernetes/other',
  'kubernetes-for-data': 'kubernetes/workloads',
  'kubernetes-hardening': 'kubernetes/security',
  'kubernetes-internals': 'kubernetes/other',
  'kubernetes-mastery': 'kubernetes/other',
  'kubernetes-network-policy-zero-trust': 'kubernetes/networking',
  'kubernetes-networking': 'kubernetes/networking',
  'kubernetes-node-maintenance-and-troubleshooting': 'kubernetes/troubleshooting',
  'kubernetes-operations': 'kubernetes/other',
  'kubernetes-operator-development': 'kubernetes/workloads',
  'kubernetes-operators': 'kubernetes/workloads',
  'kubernetes-ops': 'kubernetes/other',
  'kubernetes-security': 'kubernetes/security',
  'kubernetes-service-connectivity-troubleshooting': 'kubernetes/troubleshooting',
  'kubernetes-specialist': 'kubernetes/other',
  'kubernetes-storage': 'kubernetes/storage',
  'lightweight-kubernetes-k3s': 'kubernetes/other',
  'managed-kubernetes-eks-aks-gke': 'kubernetes/other',
  'pod-crashloop-and-oom-troubleshooting': 'kubernetes/troubleshooting',
  'stateful-workloads': 'kubernetes/workloads',
  'complete-kubernetes-deployment-on-prem-with-kubeadm-from-scratch': 'kubernetes/other',
  'complete-kubernetes-deployment-with-k3s-from-scratch': 'kubernetes/other',
  'complete-idp-deployment-on-kubernetes-from-scratch': 'kubernetes/other',
  'complete-idp-deployment-on-k3s-from-scratch': 'kubernetes/other',
  'complete-mlops-platform-deployment-self-hosted-k8s-from-scratch': 'kubernetes/workloads',
  'gpu-kubernetes-operations': 'kubernetes/workloads',
  'crossplane-kubernetes-native-provisioning': 'kubernetes/other',
  'karpenter-cluster-autoscaling': 'kubernetes/scaling',
  'keda-event-driven-autoscaling-configuration': 'kubernetes/scaling',
  'operators-and-crds': 'kubernetes/workloads',
  'etcd-backup-restore-and-cluster-health': 'kubernetes/storage',
  'velero-backup-and-restore': 'kubernetes/storage',
  'testkube-kubernetes-native-test-execution': 'kubernetes/other',
  'model-serving-kubernetes': 'kubernetes/workloads',
  'prometheus-and-grafana-monitoring-stack': 'kubernetes/other',
  'gpu-accelerator-infrastructure-for-ml-training': 'kubernetes/workloads',
  // kubernetes networking / service mesh / CNI
  'cilium-configuration-validation': 'kubernetes/networking',
  'cilium-ebpf': 'kubernetes/networking',
  'cilium-ebpf-cni-and-mesh-configuration': 'kubernetes/networking',
  'cni-networking-calico-flannel': 'kubernetes/networking',
  'ebpf-networking': 'kubernetes/networking',
  'istio-traffic-management': 'kubernetes/networking',
  'linkerd-patterns': 'kubernetes/networking',
  'kong-configuration-validation': 'kubernetes/networking',
  'metallb-bare-metal-load-balancer-configuration': 'kubernetes/networking',
  // kubernetes security / secrets / policy
  'cert-manager-tls-automation': 'kubernetes/security',
  'kubewarden-admission-policy-configuration': 'kubernetes/security',
  'kyverno-policy-management': 'kubernetes/security',
  'sealed-secrets-and-external-secrets-operator': 'kubernetes/security',
  // helm
  helm: 'helm/other',
  'helm-chart-authoring': 'helm/charts',
  'helm-chart-scaffolding': 'helm/charts',
  'helm-charts': 'helm/charts',
  'helm-patterns': 'helm/other',
  // kustomize
  kustomize: 'kustomize/other',
  'kustomize-overlay-management': 'kustomize/other',
  // openshift
  openshift: 'openshift/other',
  'openshift-and-rosa-platform': 'openshift/other',
  // podman
  podman: 'podman/other',
  // nomad (present in repo, not in the requested list but a real orchestrator)
  nomad: 'nomad/other',
  'hashicorp-nomad-scheduling-and-configuration': 'nomad/other',
  // eks / aks / gke - pulled in from cloud/
  'aws-eks-node-diagnostics-mcp': 'eks/troubleshooting',
  'eks-operation-review': 'eks/cluster-management',
  'complete-kubernetes-deployment-on-eks-from-scratch': 'eks/cluster-management',
  'azure-aks': 'aks/cluster-management',
  'airunway-aks-setup': 'aks/cluster-management',
  aks: 'aks/cluster-management',
  'complete-kubernetes-deployment-on-aks-from-scratch': 'aks/cluster-management',
  'gcp-gke': 'gke/cluster-management',
  'complete-kubernetes-deployment-on-gke-from-scratch': 'gke/cluster-management',
  // ecs (pulled in from cloud/)
  'aws-ecs-fargate': 'ecs/cluster-management',
  // argocd / fluxcd - pulled in from ci-cd/ (flat, matches how ci-cd organized them)
  'argo-cd': 'argocd/other',
  'argo-events-and-event-driven-automation': 'argocd/other',
  'argo-rollouts-progressive-delivery': 'argocd/other',
  'argo-workflows-pipeline-design': 'argocd/other',
  argocd: 'argocd/other',
  'argocd-application-configuration': 'argocd/other',
  'argocd-applicationset-patterns': 'argocd/other',
  'argocd-gitops': 'argocd/other',
  'argocd-operations': 'argocd/other',
  'argocd-sync-failure-and-drift-investigation': 'argocd/other',
  'complete-gitops-argocd-deployment-on-aks-from-scratch': 'argocd/other',
  'complete-gitops-argocd-deployment-on-eks-from-scratch': 'argocd/other',
  'complete-gitops-argocd-deployment-on-gke-from-scratch': 'argocd/other',
  'complete-gitops-argocd-deployment-on-prem-from-scratch': 'argocd/other',
  'flux-cd-configuration-and-reconciliation': 'fluxcd/other',
  'flux-cd-configuration-validation': 'fluxcd/other',
  // common / shared (cross-platform, tool-agnostic)
  'multi-tenancy': 'common/other',
  'resilience-patterns': 'common/other',
  'network-security': 'common/other',
  gitops: 'common/gitops',
  'gitops-advanced': 'common/gitops',
  'gitops-multi-cluster-management': 'common/gitops',
  'gitops-workflow': 'common/gitops',
  'consul-service-mesh-and-discovery-configuration': 'common/service-mesh',
  'dapr-configuration-validation': 'common/other',
  'golden-path-template-validation-and-testing': 'common/other',
  'humanitec-score-configuration-validation': 'common/other',
  'knative-eventing-configuration': 'common/serverless',
  'knative-configuration-validation': 'common/serverless',
  'knative-serverless-configuration': 'common/serverless',
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
      manifest.push({ ...s, action: 'MOVE', newPath: `containers-orchestration/${EXPLICIT[s.name]}/${s.name}` });
      continue;
    }
    manifest.push({ ...s, action: 'NEEDS_REVIEW', newPath: null });
  }
  for (const s of extras) {
    if (!EXPLICIT[s.name]) {
      manifest.push({ ...s, action: 'NEEDS_REVIEW', newPath: null });
      continue;
    }
    manifest.push({ ...s, action: 'MOVE', newPath: `containers-orchestration/${EXPLICIT[s.name]}/${s.name}` });
  }
  return manifest;
}

const manifest = buildManifest();
const counts = {};
for (const m of manifest) counts[m.action] = (counts[m.action] || 0) + 1;
console.log('=== Manifest summary ===', counts);

const outPath = path.join(REPO_ROOT, 'scripts', '.containers-reorg-manifest.json');
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
