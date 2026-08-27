---
name: devops-gitops-advanced
description: >
  Use when the user asks about advanced GitOps, multi-cluster GitOps, ArgoCD
  ApplicationSets, sync waves, sync phases, progressive delivery with GitOps,
  cluster bootstrapping, or GitOps at scale. Covers: ApplicationSet generators
  (cluster, git, matrix, SCM provider, pull request), sync wave orchestration,
  phased rollouts, image updater, multi-cluster management with ArgoCD,
  cluster bootstrapping with Crossplane/Cluster API, secrets management in
  GitOps (SealedSecrets, External Secrets, SOPS), and GitOps at enterprise
  scale with RBAC, projects, and audit.
  Do NOT use for: basic GitOps introduction (gitops), basic ArgoCD setup
  (argo-cd), or Flux setup.
version: "2.0.0"
author: "j4flmao"
license: "MIT"
compatibility:
  claude-code: true
  cursor: true
  codex: true
  windsurf: true
tags: [devops, gitops-advanced, argocd, applicationset, multi-cluster, phase-3]
---

# [GitOps](../gitops/SKILL.md) Advanced

## Purpose
Implement advanced [GitOps](../gitops/SKILL.md) patterns: multi-cluster management, ApplicationSets, sync strategies, progressive delivery, cluster bootstrapping, and [GitOps](../gitops/SKILL.md) at enterprise scale. Covers ApplicationSet generators, sync wave orchestration, multi-cluster topology, image updater, and secrets management.

## Agent Protocol

### Trigger
Exact user phrases: "[GitOps](../gitops/SKILL.md) advanced", "multi-cluster [GitOps](../gitops/SKILL.md)", "ApplicationSet", "[ArgoCD](../argocd/SKILL.md) ApplicationSet", "sync wave", "sync phase", "progressive delivery [GitOps](../gitops/SKILL.md)", "cluster bootstrapping", "[GitOps](../gitops/SKILL.md) at scale", "[ArgoCD](../argocd/SKILL.md) multi-cluster", "[ArgoCD](../argocd/SKILL.md) image updater", "[GitOps](../gitops/SKILL.md) secrets", "SealedSecrets", "External Secrets Operator", "[ArgoCD](../argocd/SKILL.md) projects", "[ArgoCD](../argocd/SKILL.md) RBAC", "[ArgoCD](../argocd/SKILL.md) HA", "[ArgoCD](../argocd/SKILL.md) cluster federation", "[ArgoCD](../argocd/SKILL.md) [argocd](../argocd/SKILL.md)-notifications", "Config Management Plugins".

### Input Context
- Number of clusters managed (1, 10, 100+)
- Git provider ([GitHub](../../CI_CD/github/SKILL.md), GitLab, Bitbucket)
- Current [ArgoCD](../argocd/SKILL.md)/Flux version
- Existing cluster topology (hub-spoke, peer-to-peer)
- Secrets management approach (SOPS, SealedSecrets, External Secrets, [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md))
- Team structure and RBAC requirements
- Compliance/[audit](../../../AI_and_Agents/Operations/audit/SKILL.md) requirements
- CI/CD pipeline tooling

### Output Artifact
ApplicationSet YAML manifests, [ArgoCD](../argocd/SKILL.md) project configurations, sync wave strategies, cluster registration configs, and [GitOps](../gitops/SKILL.md) workflow documentation.

### Response Format
YAML manifests (ApplicationSet, [ArgoCD](../argocd/SKILL.md) Config, AppProject), shell commands, and architecture diagrams. No preamble. No postamble. No filler.

### Completion Criteria
- [ ] ApplicationSet generators configured for multi-cluster or multi-env
- [ ] Sync wave orchestration defined for complex dependencies
- [ ] Multi-cluster topology designed (hub-spoke or [GitOps](../gitops/SKILL.md)-federation)
- [ ] Cluster bootstrapping workflow established
- [ ] Secrets management integrated with [GitOps](../gitops/SKILL.md) (External Secrets, SealedSecrets, SOPS)
- [ ] Image updater configured for automated deployment
- [ ] RBAC and Projects configured for multi-team isolation
- [ ] [Monitoring](../../Observability_and_SecOps/monitoring/SKILL.md) and notifications configured for sync status

## Architecture / Decision Trees

### Multi-Cluster [GitOps](../gitops/SKILL.md) Topology

```
Which topology?
  < 10 clusters → Hub cluster ([ArgoCD](../argocd/SKILL.md) in one cluster manages others)
  10-50 clusters → Hub cluster with sharded projects
  50+ clusters → Multi-hub or [GitOps](../gitops/SKILL.md) Federation (each cluster manages itself)

Hub cluster pros: single control plane, consistent policy, simpler RBAC
Hub cluster cons: single point of failure, hub must be resilient, latency for remote clusters

[GitOps](../gitops/SKILL.md) Federation (Flux-style): each cluster has its own controller
  Pros: fully decentralized, no SPOF, offline-capable
  Cons: harder to enforce org-wide policy, more moving parts

Cluster API integration:
  Cluster API provisions clusters → [ArgoCD](../argocd/SKILL.md) bootstraps them
  Full [GitOps](../gitops/SKILL.md) from cluster creation to workload deployment
```

### ApplicationSet Generator Decision Tree

```yaml
How are clusters organized?
  Static list (known clusters) → List generator
  Dynamic (Cluster API, auto-provisioned) → Cluster generator
  Defined in Git directory structure → Git generator (directories)
  From SCM ([GitHub](../../CI_CD/github/SKILL.md)/GitLab org repos) → SCM Provider generator
  Per PR (preview environments) → Pull Request generator

Need to combine generators?
  Cluster + Git → Matrix generator
  List + Git → Matrix or Merge generator
  Cluster + PR → Matrix generator

Need exclusive deployment?
  Per-cluster override → Cluster decision resource
  Per-environment exclusion → Git generator with path filtering
```

## Core Workflow

### Step 1: Multi-Cluster with ApplicationSets

```yaml
# Cluster generator — deploy to all clusters
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: app-clusters
spec:
  generators:
    - clusters:
        selector:
          matchLabels:
            environment: production
  template:
    metadata:
      name: "{{name}}-app"
      labels:
        app: myapp
        cluster: "{{name}}"
        environment: "{{metadata.labels.environment}}"
    spec:
      project: default
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-config
        targetRevision: main
        path: "apps/myapp/{{metadata.labels.environment}}"
      destination:
        server: "{{server}}"
        namespace: myapp
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
          - CreateNamespace=true
---
# Git generator — derive from repo directory structure
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: app-directories
spec:
  generators:
    - git:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-config
        revision: main
        directories:
          - path: apps/myapp/*
  template:
    metadata:
      name: "myapp-{{path.basename}}"
    spec:
      project: default
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-config
        targetRevision: main
        path: "{{path}}"
      destination:
        server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
        namespace: "{{path.basename}}"
---
# Matrix generator — combine cluster + git for multi-dimensional
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: app-matrix
spec:
  generators:
    - matrix:
        generators:
          - clusters:
              selector:
                matchLabels:
                  type: workload
          - git:
              repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-config
              revision: main
              directories:
                - path: apps/*
  template:
    metadata:
      name: "{{name}}-{{path.basename}}"
    spec:
      project: "{{metadata.labels.project}}"
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-config
        targetRevision: main
        path: "{{path}}/overlays/{{metadata.labels.environment}}"
      destination:
        server: "{{server}}"
        namespace: "{{path.basename}}"
---
# SCM Provider generator — auto-discover repos
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: app-scm
spec:
  generators:
    - scmProvider:
        [github](../../CI_CD/github/SKILL.md):
          organization: myorg
          api: https://api.[github](../../CI_CD/github/SKILL.md).com/
          allBranches: true
          filters:
            - repositoryMatch: ^myapp-
            - branchMatch: ^main$
            - labelMatch:
                - [gitops](../gitops/SKILL.md)-managed
  template:
    metadata:
      name: "{{repository}}-{{branch}}"
    spec:
      project: default
      source:
        repoURL: "{{sshCloneURL}}"
        targetRevision: "{{branch}}"
        path: deploy
      destination:
        server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
        namespace: "{{repository}}"
---
# Pull Request generator — preview environments
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: app-pr-preview
spec:
  generators:
    - pullRequest:
        [github](../../CI_CD/github/SKILL.md):
          owner: myorg
          repo: myapp
          api: https://api.[github](../../CI_CD/github/SKILL.md).com/
          labels:
            - preview-deploy
  template:
    metadata:
      name: "myapp-pr-{{number}}"
      labels:
        pr-number: "{{number}}"
    spec:
      project: default
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/myorg/myapp.git
        targetRevision: "{{head_sha}}"
        path: deploy/preview
      destination:
        server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
        namespace: "pr-{{number}}"
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        automated:
          selfHeal: true
      syncPolicy:
        automated:
          prune: true
```

### Step 2: Sync Wave Orchestration

```yaml
# Sync wave strategy for complex deployments
# Wave -5: Cluster infrastructure
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: crds
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-5"
spec:
  source:
    path: infrastructure/crds
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: kube-system

# Wave -3: Storage operators
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: storage-operator
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-3"
spec:
  source:
    path: infrastructure/storage
  destination:
    namespace: storage-system

# Wave -1: Databases
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: postgres-cluster
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-1"
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave-hook: "Sync"
spec:
  source:
    path: databases/postgres

# Wave 0: Services (depend on databases)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: backend-api
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "0"
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave-hook: "Sync"
spec:
  source:
    path: services/backend

# Wave 2: Frontend (depends on services)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: frontend
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "2"
spec:
  source:
    path: services/frontend

# Wave 5: [Monitoring](../../Observability_and_SecOps/monitoring/SKILL.md) config (last)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md)-config
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "5"
spec:
  source:
    path: [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md)/[dashboards](../../Cloud_Providers/dashboards/SKILL.md)
```

### Step 3: App-of-Apps Pattern

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: infrastructure
  namespace: [argocd](../argocd/SKILL.md)
spec:
  project: infrastructure
  source:
    repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-infra
    targetRevision: main
    path: apps
    directory:
      recurse: true
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: [argocd](../argocd/SKILL.md)
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
---
# apps/infrastructure-apps.yaml — referenced by app-of-apps
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: cert-manager
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-5"
spec:
  source:
    repoURL: https://charts.jetstack.io
    chart: cert-manager
    targetRevision: v1.14.0
    helm:
      values: |
        installCRDs: true
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: cert-manager
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ingress-nginx
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-4"
spec:
  source:
    repoURL: https://[kubernetes](../kubernetes/SKILL.md).[github](../../CI_CD/github/SKILL.md).io/ingress-nginx
    chart: ingress-nginx
    targetRevision: 4.9.0
    helm:
      values: |
        controller:
          service:
            type: LoadBalancer
  destination:
    namespace: ingress-nginx
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: external-secrets
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-3"
spec:
  source:
    repoURL: https://charts.external-secrets.io
    chart: external-secrets
    targetRevision: 0.9.0
    helm:
      values: |
        installCRDs: true
        serviceAccount:
          annotations:
            eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/external-secrets
  destination:
    namespace: external-secrets
```

### Step 4: Cluster Bootstrapping with Cluster API

```yaml
# CAPI Cluster definition — creates a [Kubernetes](../kubernetes/SKILL.md) cluster
apiVersion: cluster.x-k8s.io/v1beta1
kind: Cluster
metadata:
  name: workload-prod-1
  namespace: clusters
spec:
  clusterNetwork:
    pods:
      cidrBlocks:
        - 10.244.0.0/16
    serviceDomain: cluster.local
  controlPlaneRef:
    apiVersion: controlplane.cluster.x-k8s.io/v1beta1
    kind: KubeadmControlPlane
    name: workload-prod-1-cp
  infrastructureRef:
    apiVersion: infrastructure.cluster.x-k8s.io/v1beta2
    kind: AWSCluster
    name: workload-prod-1
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: bootstrap-workload-prod-1
spec:
  source:
    repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-bootstrap
    targetRevision: main
    path: clusters/workload-prod-1
  destination:
    name: workload-prod-1  # Cluster registered in [ArgoCD](../argocd/SKILL.md)
    namespace: [argocd](../argocd/SKILL.md)
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
---
# Bootstrap app — installs initial cluster components
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: bootstrap-initial
  namespace: [argocd](../argocd/SKILL.md)
spec:
  project: cluster-bootstrap
  source:
    repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-bootstrap
    targetRevision: main
    path: bootstrap
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: kube-system
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    retry:
      limit: 5
      backoff:
        duration: 30s
        factor: 2
        maxDuration: 10m
```

### Step 5: Secrets in [GitOps](../gitops/SKILL.md)

```yaml
# Option A: External Secrets Operator (recommended)
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: [aws-secrets-manager](../../Cloud_Providers/aws-secrets-manager/SKILL.md)
  namespace: production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
  namespace: production
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-1"
spec:
  refreshInterval: 4h
  secretStoreRef:
    name: [aws-secrets-manager](../../Cloud_Providers/aws-secrets-manager/SKILL.md)
    kind: SecretStore
  target:
    name: app-secrets
    creationPolicy: Owner
  data:
    - secretKey: database_url
      remoteRef:
        key: /production/app/database-url
    - secretKey: api_key
      remoteRef:
        key: /production/app/api-key
---
# Option B: SOPS + AGE (for [GitOps](../gitops/SKILL.md)-native encryption)
# .sops.yaml
creation_rules:
  - path_regex: secrets/.*\.yaml
    age: age1abc123...
---
# Encrypted secret in git (decrypted by [ArgoCD](../argocd/SKILL.md) with SOPS plugin)
# secrets/app-secrets.yaml (encrypted with SOPS)
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  database_url: ENC[AES256_GCM,data:abc123...,type:str]
  api_key: ENC[AES256_GCM,data:def456...,type:str]
sops:
  age:
    - recipient: age1abc123...
      enc: |
        -----BEGIN AGE ENCRYPTED FILE-----
        ...
  lastmodified: "2026-05-20T10:00:00Z"
  mac: ENC[AES256_GCM,data:...,type:str]
---
# Option C: SealedSecrets
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-secrets
  namespace: production
spec:
  encryptedData:
    database_url: AgByxUv9...
    api_key: AgB7wXk...
```

### Step 6: [ArgoCD](../argocd/SKILL.md) Image Updater

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  annotations:
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/image-list: myapp=ghcr.io/org/myapp
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/myapp.helm.image-name: image.repository
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/myapp.helm.image-tag: image.tag
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/myapp.update-strategy: latest
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/myapp.allow-tags: regex:^v?\d+\.\d+\.\d+$
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/myapp.pull-secret: pullsecret
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/write-back-method: git
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/git-branch: main
    [argocd](../argocd/SKILL.md)-image-updater.argoproj.io/write-back-target: kustomization
spec:
  source:
    repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-config
    targetRevision: main
    path: overlays/production
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: production
---
# [argocd](../argocd/SKILL.md)-image-updater config
apiVersion: v1
kind: ConfigMap
metadata:
  name: [argocd](../argocd/SKILL.md)-image-updater-config
  namespace: [argocd](../argocd/SKILL.md)
data:
  config.json: |
    {
      "git_user": "[argocd](../argocd/SKILL.md)-image-updater",
      "git_email": "image-updater@example.com",
      "registries": [
        {
          "name": "[GitHub](../../CI_CD/github/SKILL.md) Container Registry",
          "api_url": "https://ghcr.io",
          "prefix": "ghcr.io",
          "ping": true,
          "credentials": "ext:/scripts/get-creds.sh"
        },
        {
          "name": "[Docker](../docker/SKILL.md) Hub",
          "api_url": "https://registry-1.[docker](../docker/SKILL.md).io",
          "prefix": "[docker](../docker/SKILL.md).io",
          "ping": true,
          "credentials": "pullsecret:[argocd](../argocd/SKILL.md)/dockerhub-creds"
        }
      ]
    }
```

### Step 7: Enterprise Multi-Cluster RBAC

```yaml
# [ArgoCD](../argocd/SKILL.md) Projects for team isolation
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: team-platform
  namespace: [argocd](../argocd/SKILL.md)
spec:
  description: Platform team infrastructure
  sourceRepos:
    - "https://[github](../../CI_CD/github/SKILL.md).com/org/[gitops](../gitops/SKILL.md)-infra"
    - "https://charts.bitnami.com/bitnami"
    - "https://charts.jetstack.io"
  destinations:
    - namespace: "*"
      server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    - namespace: "platform-*"
      server: "https://cluster-prod-1.example.com:6443"
  clusterResourceWhitelist:
    - group: "apiextensions.k8s.io"
      kind: "CustomResourceDefinition"
    - group: "rbac.authorization.k8s.io"
      kind: "ClusterRole"
    - group: "rbac.authorization.k8s.io"
      kind: "ClusterRoleBinding"
  orphanedResources:
    warn: false
  roles:
    - name: platform-admin
      description: Platform team admin
      policies:
        - p, proj:team-platform:platform-admin, applications, *, team-platform/*, allow
      groups:
        - myorg:platform-team
---
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: team-checkout
  namespace: [argocd](../argocd/SKILL.md)
spec:
  sourceRepos:
    - "https://[github](../../CI_CD/github/SKILL.md).com/org/checkout-*"
  destinations:
    - namespace: "checkout-*"
      server: "https://cluster-prod-1.example.com:6443"
    - namespace: "checkout-*"
      server: "https://cluster-staging-1.example.com:6443"
  namespaceResourceWhitelist:
    - group: "*"
      kind: "*"
  roles:
    - name: checkout-admin
      policies:
        - p, proj:team-checkout:checkout-admin, applications, *, team-checkout/*, allow
      groups:
        - myorg:checkout-team
    - name: checkout-readonly
      policies:
        - p, proj:team-checkout:checkout-readonly, applications, get, team-checkout/*, allow
      groups:
        - myorg:everyone
---
# [ArgoCD](../argocd/SKILL.md) RBAC ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: [argocd](../argocd/SKILL.md)-rbac-cm
  namespace: [argocd](../argocd/SKILL.md)
data:
  policy.default: role:readonly
  policy.csv: |
    p, role:org-admin, applications, *, */*, allow
    p, role:org-admin, projects, *, *, allow
    p, role:org-admin, clusters, *, *, allow
    p, role:org-admin, repositories, *, *, allow

    p, role:team-lead, applications, create, *, allow
    p, role:team-lead, applications, delete, *, allow
    p, role:team-lead, applications, update, *, allow
    p, role:team-lead, applications, get, *, allow
    p, role:team-lead, applications, sync, *, allow

    g, myorg:platform-admins, role:org-admin
    g, myorg:checkout-leads, role:team-lead
    g, myorg:checkout-team, role:readonly
```

### Step 8: Notifications and [Observability](../../Observability_and_SecOps/observability/SKILL.md)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: [argocd](../argocd/SKILL.md)-notifications-cm
  namespace: [argocd](../argocd/SKILL.md)
data:
  service.slack: |
    token: $slack-token
  template.app-sync-succeeded: |
    message: |
      Application {{.app.metadata.name}} sync succeeded.
      Sync status: {{.app.status.sync.status}}
    slack:
      attachments:
        - title: "{{.app.metadata.name}} sync succeeded"
          color: "#36a64f"
          fields:
            - title: Environment
              value: "{{.app.spec.destination.namespace}}"
            - title: Revision
              value: "{{.app.status.sync.revision}}"
  template.app-sync-failed: |
    message: |
      Application {{.app.metadata.name}} sync FAILED.
      Error: {{.app.status.operationState.message}}
    slack:
      attachments:
        - title: "{{.app.metadata.name}} sync failed"
          color: "#ff0000"
          fields:
            - title: Error
              value: "{{.app.status.operationState.message}}"
  trigger.on-sync-succeeded: |
    - description: Application sync succeeded
      send:
        - app-sync-succeeded
      when: app.status.sync.status == 'Synced' and app.status.health.status == 'Healthy'
  trigger.on-sync-failed: |
    - description: Application sync failed
      send:
        - app-sync-failed
      when: app.status.operationState.phase in ['Error', 'Failed']
```

## Production Considerations

### [ArgoCD](../argocd/SKILL.md) HA Configuration
```
Control plane:
  - 3 replicas for [argocd](../argocd/SKILL.md)-server, [argocd](../argocd/SKILL.md)-repo-server, [argocd](../argocd/SKILL.md)-application-controller
  - [argocd](../argocd/SKILL.md)-dex-server: 2 replicas (if using OIDC)
  - [argocd](../argocd/SKILL.md)-redis: sentinel-based HA

Backend:
  - [argocd](../argocd/SKILL.md)-repo-server: 2+ replicas, 2 CPU, 4Gi RAM per 100 repos
  - [argocd](../argocd/SKILL.md)-application-controller: 2+ replicas, 2 CPU, 2Gi RAM per 1000 apps
  - [argocd](../argocd/SKILL.md)-server: 4+ replicas for API + UI

Database:
  - Redis for caching only (loss-tolerant)
  - State stored in [Kubernetes](../kubernetes/SKILL.md) secrets (backed by etcd)
```

### Sync Strategies for Large Deployments
```
Number of apps:
  < 100 → Single app-of-apps
  100-500 → App-of-apps with project separation
  500+ → Multiple app-of-apps + project scoping

Sync cadence:
  Default: 3m (polling)
  Webhook: [GitHub](../../CI_CD/github/SKILL.md)/GitLab webhook to [argocd](../argocd/SKILL.md)-server (60s latency)
  Automated: enabled with prune+selfHeal for most apps
  Manual: critical production apps (require approval)

Retry strategy:
  Limit: 5 retries
  Backoff: 30s → 2x → max 10m
```

### Anti-Patterns

1. **Git repo as a dumping ground**: One massive repo with all clusters. Use separate repos per team or per cluster.
2. **No sync wave orchestration**: All resources deploy simultaneously. Use sync waves for ordering.
3. **Plaintext secrets in Git**: Secrets committed without encryption. Always use External Secrets, SOPS, or SealedSecrets.
4. **Overusing sync waves**: 30 sync waves for a simple app. Keep waves for infrastructure dependencies only.
5. **Ignoring application health**: [ArgoCD](../argocd/SKILL.md) shows "Synced" but app is not healthy. Always implement health checks.
6. **Auto-sync for everything**: Databases and CRDs should not auto-sync without verification.
7. **No drift detection**: Changes made outside [GitOps](../gitops/SKILL.md) are silently ignored. Enable self-heal with [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md).
8. **Single cluster hub bottleneck**: Hub cluster goes down, no cluster can sync. Implement HA for hub or use [GitOps](../gitops/SKILL.md) Federation.
9. **Missing prune safeguards**: `prune: true` without `PreserveResourcesOnDeletion` for critical data.
10. **Insufficient RBAC**: Everyone has cluster-admin on [ArgoCD](../argocd/SKILL.md). Scope projects and roles per team.

## Compared With

| Feature | [ArgoCD](../argocd/SKILL.md) | Flux v2 |
|---------|--------|---------|
| Multi-cluster | Native (hub/spoke) | Native (Kustomization with KubeConfig) |
| ApplicationSet | Built-in | Manual ([Kustomize](../kustomize/SKILL.md) overlay per cluster) |
| Sync waves | Annotations | depends-on in Kustomization |
| Image updates | [ArgoCD](../argocd/SKILL.md) Image Updater | Image Automation Controllers |
| Secrets integration | SOPS/External Secrets/SealedSecrets | SOPS native |
| RBAC/Projects | Native | Native (roles + accounts) |
| Notifications | [argocd](../argocd/SKILL.md)-notifications | Notification controller |
| Config Management | CMP (any tool) | [Kustomize](../kustomize/SKILL.md) + Helm |
| Drift detection | Self-heal + Diff | Reconciliation loop |
| SSO/OIDC | Dex/Built-in | OIDC/[GitHub](../../CI_CD/github/SKILL.md)/GitLab |

## References
- ../../../Global_References/applicationset-generators.md — [ArgoCD](../argocd/SKILL.md) ApplicationSet Generators
- ../../../Global_References/[argocd](../argocd/SKILL.md)-image-updater.md — [ArgoCD](../argocd/SKILL.md) Image Updater
- ../../../Global_References/[gitops](../gitops/SKILL.md)-advanced-advanced.md — [Gitops](../gitops/SKILL.md) Advanced Advanced Topics
- ../../../Global_References/[gitops](../gitops/SKILL.md)-advanced-fundamentals.md — [Gitops](../gitops/SKILL.md) Advanced Fundamentals
- ../../../Global_References/[gitops](../gitops/SKILL.md)-secrets.md — Secrets in [GitOps](../gitops/SKILL.md)
- ../../../Global_References/multi-cluster-management.md — Multi-Cluster [GitOps](../gitops/SKILL.md) Management
- ../../../Global_References/sync-phases-hooks.md — Sync Phases, Waves, and Hooks
- references/[argocd](../argocd/SKILL.md)-ha.md — [ArgoCD](../argocd/SKILL.md) High Availability Configuration
- references/[argocd](../argocd/SKILL.md)-projects-rbac.md — [ArgoCD](../argocd/SKILL.md) Projects and RBAC
- references/cluster-bootstrapping.md — Cluster Bootstrapping with [GitOps](../gitops/SKILL.md)
- references/[argocd](../argocd/SKILL.md)-notifications.md — [ArgoCD](../argocd/SKILL.md) Notifications and Webhooks
- references/config-management-plugins.md — [ArgoCD](../argocd/SKILL.md) Config Management Plugins

## Handoff
Related skills: [progressive-delivery](../../CI_CD/progressive-delivery/SKILL.md) (Argo Rollouts with [GitOps](../gitops/SKILL.md)), [argo-cd](../argo-cd/SKILL.md) (basic [ArgoCD](../argocd/SKILL.md) setup), [gitops](../gitops/SKILL.md) ([GitOps](../gitops/SKILL.md) fundamentals), [kubernetes](../kubernetes/SKILL.md)-patterns (K8s resources), [policy-as-code](../../../Security/policy-as-code/SKILL.md) (policy enforcement), crossplane (infrastructure composition), cluster-api (cluster provisioning).

