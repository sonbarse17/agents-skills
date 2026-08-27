---
name: argocd-gitops
description: Implement GitOps with ArgoCD for declarative Kubernetes
  deployments. Configure applications, manage sync policies, implement
  progressive delivery, and automate deployments from Git repositories. Use when
  implementing GitOps workflows or continuous deployment to Kubernetes.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
tags:
  - containers_and_orchestration
  - argocd-gitops
depends_on: []
---

# [ArgoCD](../argocd/SKILL.md) [GitOps](../gitops/SKILL.md)

Implement declarative continuous delivery for [Kubernetes](../kubernetes/SKILL.md) with [ArgoCD](../argocd/SKILL.md).

## When to Use This Skill

Use this skill when:
- Implementing [GitOps](../gitops/SKILL.md) workflows for [Kubernetes](../kubernetes/SKILL.md)
- Automating deployments from Git repositories
- Managing multiple environments declaratively
- Implementing progressive delivery strategies
- Synchronizing cluster state with Git

## Prerequisites

- [Kubernetes](../kubernetes/SKILL.md) cluster with [ArgoCD](../argocd/SKILL.md) installed
- [kubectl](../kubectl/SKILL.md) configured
- Git repository for manifests
- [ArgoCD](../argocd/SKILL.md) CLI (optional)

## Installation

```bash
# Create namespace
[kubectl](../kubectl/SKILL.md) create namespace [argocd](../argocd/SKILL.md)

# Install [ArgoCD](../argocd/SKILL.md)
[kubectl](../kubectl/SKILL.md) apply -n [argocd](../argocd/SKILL.md) -f https://raw.githubusercontent.com/argoproj/[argo-cd](../argo-cd/SKILL.md)/stable/manifests/install.yaml

# Get admin password
[kubectl](../kubectl/SKILL.md) -n [argocd](../argocd/SKILL.md) get secret [argocd](../argocd/SKILL.md)-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
[kubectl](../kubectl/SKILL.md) port-forward svc/[argocd](../argocd/SKILL.md)-server -n [argocd](../argocd/SKILL.md) 8080:443

# Login with CLI
[argocd](../argocd/SKILL.md) login localhost:8080
```

## Application Definition

### Basic Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: [argocd](../argocd/SKILL.md)
spec:
  project: default
  source:
    repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-manifests.git
    targetRevision: main
    path: environments/production
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: myapp
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Helm Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-helm
  namespace: [argocd](../argocd/SKILL.md)
spec:
  project: default
  source:
    repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-chart.git
    targetRevision: main
    path: charts/myapp
    helm:
      valueFiles:
        - values.yaml
        - values-production.yaml
      parameters:
        - name: replicaCount
          value: "3"
        - name: image.tag
          value: "2.0.0"
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: myapp
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### [Kustomize](../kustomize/SKILL.md) Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-[kustomize](../kustomize/SKILL.md)
  namespace: [argocd](../argocd/SKILL.md)
spec:
  project: default
  source:
    repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-manifests.git
    targetRevision: main
    path: overlays/production
    [kustomize](../kustomize/SKILL.md):
      images:
        - myapp=myregistry/myapp:2.0.0
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: myapp
```

## Projects

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: myproject
  namespace: [argocd](../argocd/SKILL.md)
spec:
  description: My Project
  sourceRepos:
    - https://[github](../../CI_CD/github/SKILL.md).com/org/*
  destinations:
    - namespace: myapp-*
      server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
  namespaceResourceWhitelist:
    - group: '*'
      kind: '*'
  roles:
    - name: developer
      description: Developer role
      policies:
        - p, proj:myproject:developer, applications, get, myproject/*, allow
        - p, proj:myproject:developer, applications, sync, myproject/*, allow
      groups:
        - developers
```

## Application Sets

### Git Generator

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-environments
  namespace: [argocd](../argocd/SKILL.md)
spec:
  generators:
    - git:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-manifests.git
        revision: main
        directories:
          - path: environments/*
  template:
    metadata:
      name: 'myapp-{{path.basename}}'
    spec:
      project: default
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-manifests.git
        targetRevision: main
        path: '{{path}}'
      destination:
        server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
        namespace: 'myapp-{{path.basename}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

### List Generator

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-clusters
  namespace: [argocd](../argocd/SKILL.md)
spec:
  generators:
    - list:
        elements:
          - cluster: production
            url: https://prod-cluster.example.com
          - cluster: staging
            url: https://staging-cluster.example.com
  template:
    metadata:
      name: 'myapp-{{cluster}}'
    spec:
      project: default
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-manifests.git
        targetRevision: main
        path: 'environments/{{cluster}}'
      destination:
        server: '{{url}}'
        namespace: myapp
```

### Matrix Generator

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-matrix
  namespace: [argocd](../argocd/SKILL.md)
spec:
  generators:
    - matrix:
        generators:
          - git:
              repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-manifests.git
              revision: main
              directories:
                - path: apps/*
          - list:
              elements:
                - env: staging
                - env: production
  template:
    metadata:
      name: '{{path.basename}}-{{env}}'
    spec:
      project: default
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/org/myapp-manifests.git
        targetRevision: main
        path: '{{path}}/overlays/{{env}}'
      destination:
        server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
        namespace: '{{path.basename}}-{{env}}'
```

## Sync Policies

### Automated Sync

```yaml
syncPolicy:
  automated:
    prune: true          # Delete resources not in Git
    selfHeal: true       # Revert manual changes
    allowEmpty: false    # Don't sync empty directories
  syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground
    - PruneLast=true
  retry:
    limit: 5
    backoff:
      duration: 5s
      factor: 2
      maxDuration: 3m
```

### Sync Waves

```yaml
# In [Kubernetes](../kubernetes/SKILL.md) manifests
apiVersion: v1
kind: ConfigMap
metadata:
  name: myconfig
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-1"  # Sync first
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "0"   # Sync second
```

### Sync Hooks

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: migration
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/hook: PreSync
    [argocd](../argocd/SKILL.md).argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: myapp:latest
          command: ["./migrate.sh"]
      restartPolicy: Never
```

## CLI Commands

```bash
# List applications
[argocd](../argocd/SKILL.md) app list

# Get application details
[argocd](../argocd/SKILL.md) app get myapp

# Sync application
[argocd](../argocd/SKILL.md) app sync myapp

# Force sync (ignore differences)
[argocd](../argocd/SKILL.md) app sync myapp --force

# View diff
[argocd](../argocd/SKILL.md) app diff myapp

# Rollback
[argocd](../argocd/SKILL.md) app rollback myapp

# Delete application
[argocd](../argocd/SKILL.md) app delete myapp

# View logs
[argocd](../argocd/SKILL.md) app logs myapp

# Hard refresh (clear cache)
[argocd](../argocd/SKILL.md) app get myapp --hard-refresh
```

## Repository Configuration

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: private-repo
  namespace: [argocd](../argocd/SKILL.md)
  labels:
    [argocd](../argocd/SKILL.md).argoproj.io/secret-type: repository
stringData:
  url: https://[github](../../CI_CD/github/SKILL.md).com/org/private-repo.git
  username: git
  password: ghp_xxxx
---
# SSH key
apiVersion: v1
kind: Secret
metadata:
  name: private-repo-ssh
  namespace: [argocd](../argocd/SKILL.md)
  labels:
    [argocd](../argocd/SKILL.md).argoproj.io/secret-type: repository
stringData:
  url: git@[github](../../CI_CD/github/SKILL.md).com:org/private-repo.git
  sshPrivateKey: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    ...
    -----END OPENSSH PRIVATE KEY-----
```

## Notifications

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: [argocd](../argocd/SKILL.md)-notifications-cm
  namespace: [argocd](../argocd/SKILL.md)
data:
  service.slack: |
    token: $slack-token
  template.app-deployed: |
    message: Application {{.app.metadata.name}} is now {{.app.status.sync.status}}.
  trigger.on-deployed: |
    - when: app.status.operationState.phase in ['Succeeded']
      send: [app-deployed]
```

## Common Issues

### Issue: Sync Fails with Diff
**Problem**: Resources show differences but are correct
**Solution**: Configure ignore differences

```yaml
spec:
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas
```

### Issue: Repository Not Accessible
**Problem**: [ArgoCD](../argocd/SKILL.md) cannot clone repository
**Solution**: Check repository secret, verify URL and credentials

### Issue: Application Stuck OutOfSync
**Problem**: Application never becomes synced
**Solution**: Check resource status, review events, verify manifests

### Issue: Health Check Failing
**Problem**: Application shows degraded health
**Solution**: Check custom health checks, verify probe configurations

## Best Practices

- Use ApplicationSets for multi-environment deployments
- Implement sync waves for ordered deployments
- Use projects to isolate applications
- Configure notifications for deployment events
- Implement proper RBAC with projects
- Use health checks for deployment verification
- Enable auto-pruning to remove deleted resources
- Keep manifests in dedicated repositories

## Related Skills

- [kubernetes-ops](../[kubernetes-ops](../[kubernetes](../kubernetes/SKILL.md)-ops/SKILL.md)/) - K8s fundamentals
- [helm-charts](../[helm-charts](../helm-charts/SKILL.md)/) - Helm deployments
- [kustomize](../[kustomize](../kustomize/SKILL.md)/) - [Kustomize](../kustomize/SKILL.md) overlays
