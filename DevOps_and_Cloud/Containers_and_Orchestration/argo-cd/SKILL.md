---
name: argo-cd
description: >
  Use this skill when the user says 'ArgoCD', 'Argo CD', 'GitOps',
  'ApplicationSet', 'Sync Policy', 'Sync Wave', 'Application Controller',
  'argocd CLI', 'Declarative GitOps', 'Progressive Delivery', 'Rollback',
  'Multi-cluster ArgoCD', 'ArgoCD RBAC', 'ArgoCD SSO', 'ArgoCD Project'. Covers:
  application deployment, sync strategies, application sets, multi-cluster
  management, RBAC, SSO integration, monitoring, rollback, disaster recovery,
  CLI usage, declarative setup. Do NOT use for: Flux (use gitops skill), generic
  GitOps concepts, Kubernetes cluster setup, CI/CD pipeline design.
version: 2.0.0
author: j4flmao
license: MIT
compatibility:
  claude-code: true
  cursor: true
  codex: true
  windsurf: true
tags:
  - devops
  - gitops
  - argocd
  - kubernetes
  - phase-5
depends_on: []
---

# Argo CD

## Purpose
Implement [GitOps](../gitops/SKILL.md) workflows using Argo CD for [Kubernetes](../kubernetes/SKILL.md) deployments with sync strategies, application sets, multi-cluster management, and security best practices.

## Agent Protocol

### Trigger
Exact user phrases: "[ArgoCD](../argocd/SKILL.md)", "Argo CD", "[GitOps](../gitops/SKILL.md)", "ApplicationSet", "Sync Policy", "Sync Wave", "[argocd](../argocd/SKILL.md) CLI", "Declarative [GitOps](../gitops/SKILL.md)", "Progressive Delivery", "Rollback".

### Input Context
Before activating, verify:
- Argo CD version (2.4+ for ApplicationSets, 2.8+ for complex features).
- Number of clusters (single vs multi-cluster management).
- Git provider ([GitHub](../../CI_CD/github/SKILL.md), GitLab, Bitbucket — affects webhook config).
- Authentication method (local admin, SSO with OIDC, Dex).
- Environment structure (dev/staging/prod per cluster or namespace).
- [Monitoring](../../Observability_and_SecOps/monitoring/SKILL.md) tools (Prometheus operator for Argo CD metrics).

### Output Artifact
Writes to Argo CD Application YAML, ApplicationSet YAML, Argo CD project config, RBAC config, and notification templates.

### Response Format
YAML for Application, ApplicationSet, Project, and RBAC resources. CLI commands for setup and operations.

No preamble. No postamble. No explanations. No filler/hedging/transitions.

### Completion Criteria
- [ ] Application(s) defined and synced to target cluster.
- [ ] Sync policy configured (manual/automated with prune).
- [ ] Health checks and resource customization configured.
- [ ] RBAC roles assigned for team access.
- [ ] Notifications configured for sync events.
- [ ] Rollback procedure documented.

### Max Response Length
Direct file write. No response text.

## Architecture Decision Trees

### Application Structure: Single App vs ApplicationSet vs Multi-Source
| Pattern | Use Case | Complexity |
|---|---|---|
| Single Application | One service, one environment | Low |
| ApplicationSet (list generator) | Same app across multiple clusters | Medium |
| ApplicationSet (git generator) | One app per directory in repo | Medium |
| ApplicationSet (SCM generator) | One app per [GitHub](../../CI_CD/github/SKILL.md) repo in org | High |
| Multi-source Application | App config + overlay config separately | Medium |
| App of Apps pattern | Deploying multiple related applications | High |

### Sync Strategy: Automated vs Manual vs Phased
| Strategy | When to Use | Risk Level |
|---|---|---|
| Automated (Auto-Sync) | Dev/staging, non-critical services | Low (fast) |
| Automated with Self-Heal | All environments (recovers drift) | Low |
| Manual Sync | Production, strict change control | High (controlled) |
| Phased (Sync Waves) | Stateful apps, DB migrations | Medium |
| Blue-Green via Argo Rollouts | Zero-downtime production deploys | Medium (complex) |

### Generator Selection for ApplicationSets
| Generator | Best For | Example |
|---|---|---|
| List | Simple list of clusters/values | Dev, staging, prod clusters |
| Git | One directory per environment | apps/prod/*, apps/staging/* |
| Cluster | All registered clusters | Deploy to every cluster |
| SCM ([GitHub](../../CI_CD/github/SKILL.md)) | All repos in an org | One Application per microservice |
| Pull Request | Preview environments per PR | Ephemeral review apps |
| Matrix | Combining multiple generators | Cluster × Environment |

### Authentication Method
| Method | Pros | Cons |
|---|---|---|
| Local admin | Simple, no dependencies | No MFA, shared credentials |
| OIDC (Google, Okta, Azure AD) | SSO, MFA, group sync | OIDC provider required |
| Dex | Multi-provider, LDAP | Additional component to manage |
| [GitHub](../../CI_CD/github/SKILL.md) OAuth | Simple for small teams | Only [GitHub](../../CI_CD/github/SKILL.md) users |

## Quick Start
Install Argo CD → Register target cluster → Define Application YAML → Sync → Configure RBAC → Set up webhook → Add notifications.

## Core Workflow

### Step 1: Argo CD Installation
```yaml
# install/[argocd](../argocd/SKILL.md)-install.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: [argocd](../argocd/SKILL.md)
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: [argocd](../argocd/SKILL.md)-cm
  namespace: [argocd](../argocd/SKILL.md)
data:
  # SSO configuration (OIDC example)
  url: https://[argocd](../argocd/SKILL.md).example.com
  oidc.config: |
    name: Okta
    issuer: https://dev-123456.okta.com
    clientID: $ARGOCD_OIDC_CLIENT_ID
    clientSecret: $ARGOCD_OIDC_CLIENT_SECRET
    requestedScopes: ["openid", "profile", "email", "groups"]
    requestedIDTokenClaims: {"groups": {"essential": true}}
  # Repository configuration
  repositories: |
    - url: https://[github](../../CI_CD/github/SKILL.md).com/myorg/[gitops](../gitops/SKILL.md)-config
      passwordSecret:
        name: [github](../../CI_CD/github/SKILL.md)-token
        key: token
  # Resource customization
  resource.customizations: |
    admissionregistration.k8s.io/MutatingWebhookConfiguration:
      health.lua: |
        hs = {}
        hs.status = "Healthy"
        return hs
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: [argocd](../argocd/SKILL.md)-rbac-cm
  namespace: [argocd](../argocd/SKILL.md)
data:
  policy.default: role:readonly
  policy.csv: |
    p, role:org-admin, applications, *, */*, allow
    p, role:team-lead, applications, sync, */*, allow
    p, role:team-lead, applications, get, */*, allow
    p, role:team-lead, applications, update, */*, allow
    p, role:dev, applications, get, team-*/*, allow
    p, role:dev, applications, sync, team-*/*, allow
    p, role:dev, exec, create, team-*/*, allow
    g, myorg/team-leads, role:team-lead
    g, myorg/dev-team, role:dev

# Install with:
# [kubectl](../kubectl/SKILL.md) apply -n [argocd](../argocd/SKILL.md) -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
# [kubectl](../kubectl/SKILL.md) apply -n [argocd](../argocd/SKILL.md) -f [argocd](../argocd/SKILL.md)-cm.yaml
# [kubectl](../kubectl/SKILL.md) apply -n [argocd](../argocd/SKILL.md) -f [argocd](../argocd/SKILL.md)-rbac-cm.yaml
```

### Step 2: Basic Application Definition
```yaml
# apps/payment-service.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payment-service
  namespace: [argocd](../argocd/SKILL.md)
  finalizers:
    - resources-finalizer.[argocd](../argocd/SKILL.md).argoproj.io  # Cascade delete
spec:
  project: default
  source:
    repoURL: https://[github](../../CI_CD/github/SKILL.md).com/myorg/payment-service.git
    targetRevision: main
    path: [kubernetes](../kubernetes/SKILL.md)/overlays/production
    helm:
      valueFiles:
        - values-prod.yaml
      parameters:
        - name: replicaCount
          value: "3"
    [kustomize](../kustomize/SKILL.md):
      namePrefix: prod-
  destination:
    server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
    namespace: payment-system
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PruneLast=true  # Prune resources after sync
      - ApplyOutOfSyncOnly=true
      - RespectIgnoreDifferences=true
      - ServerSideApply=true  # Use SSA for CRDs
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas  # Ignore replica count drift from HPA
    - group: [autoscaling](../../../Software_Engineering_and_Other/Backend/autoscaling/SKILL.md)
      kind: HorizontalPodAutoscaler
      jsonPointers:
        - /spec/metrics  # HPA may have different metrics
  info:
    - name: Slack Channel
      value: "#team-payments"
    - name: [Runbook](../../Observability_and_SecOps/runbook/SKILL.md)
      value: "https://[runbook](../../Observability_and_SecOps/runbook/SKILL.md).example.com/payment-service"
```

### Step 3: ApplicationSet with Git Generator
```yaml
# appsets/cluster-apps.yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: cluster-apps
  namespace: [argocd](../argocd/SKILL.md)
spec:
  generators:
    # Git generator — one Application per directory in apps/
    - git:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/myorg/[gitops](../gitops/SKILL.md)-config.git
        revision: HEAD
        directories:
          - path: apps/production/*
          - path: apps/staging/*
  template:
    metadata:
      name: '{{path.basename}}'
      labels:
        environment: '{{path[1]}}'
    spec:
      project: default
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/myorg/{{path.basename}}.git
        targetRevision: main
        path: [kubernetes](../kubernetes/SKILL.md)/overlays/{{path[1]}}
      destination:
        server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
        namespace: '{{path.basename}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
  syncPolicy:
    preserveResourcesOnDeletion: false
```

### Step 4: ApplicationSet with Matrix Generator (Cluster × Environment)
```yaml
# appsets/multi-cluster-apps.yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-cluster-apps
  namespace: [argocd](../argocd/SKILL.md)
spec:
  generators:
    - matrix:
        generators:
          # List of clusters
          - clusters:
              selector:
                matchLabels:
                  environment: production
          # List of apps
          - list:
              elements:
                - app: payment-service
                  path: payment-service
                - app: notification-service
                  path: notification-service
  template:
    metadata:
      name: '{{app}}-{{name}}'
      labels:
        app: '{{app}}'
        cluster: '{{name}}'
        environment: '{{metadata.labels.environment}}'
    spec:
      project: default
      source:
        repoURL: https://[github](../../CI_CD/github/SKILL.md).com/myorg/{{app}}.git
        targetRevision: main
        path: [kubernetes](../kubernetes/SKILL.md)/overlays/{{metadata.labels.environment}}
      destination:
        server: '{{server}}'
        namespace: '{{app}}'
      syncPolicy:
        automated:
          prune: true
```

### Step 5: Sync Waves and Phased Deployment
```yaml
# Example: Database migration before app rollout
---
# Wave -10: CRDs first
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-10"
...
---
# Wave -5: Namespace and RBAC
apiVersion: v1
kind: Namespace
metadata:
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "-5"
...
---
# Wave 0: ConfigMaps and Secrets (app config)
apiVersion: v1
kind: ConfigMap
metadata:
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "0"
...
---
# Wave 1: Database migration Job
apiVersion: batch/v1
kind: Job
metadata:
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "1"
    [argocd](../argocd/SKILL.md).argoproj.io/hook: Sync  # Run on every sync
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migration
          image: myapp/migration:latest
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
---
# Wave 2: Application Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "2"
spec:
  replicas: 3
...
---
# Wave 3: Service and Ingress
apiVersion: v1
kind: Service
metadata:
  annotations:
    [argocd](../argocd/SKILL.md).argoproj.io/sync-wave: "3"
...
```

### Step 6: Argo Rollouts for Progressive Delivery
```yaml
# rollouts/payment-service-rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: payment-service
  namespace: payment-system
spec:
  replicas: 10
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
        - name: app
          image: myapp/payment-service:latest
          ports:
            - containerPort: 8080
  strategy:
    canary:
      maxSurge: "25%"
      maxUnavailable: 0
      steps:
        - setWeight: 5
        - pause: {duration: 2m}
        - setWeight: 25
        - pause: {duration: 5m}
        - setWeight: 50
        - pause: {duration: 10m}
        - setWeight: 75
        - pause: {duration: 10m}
        - setWeight: 100
      analysis:
        templates:
          - templateName: success-rate
        args:
          - name: service-name
            value: payment-service
      trafficRouting:
        nginx:
          stableIngress: payment-service-ingress
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
  namespace: payment-system
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 1m
      count: 5
      successCondition: result >= 95
      provider:
        prometheus:
          query: |
            sum(rate(http_requests_total{
              service="{{args.service-name}}",
              status!~"5.."
            }[1m]))
            /
            sum(rate(http_requests_total{
              service="{{args.service-name}}"
            }[1m])) * 100
```

### Step 7: Notifications
```yaml
# [argocd](../argocd/SKILL.md)-notifications-cm.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: [argocd](../argocd/SKILL.md)-notifications-cm
  namespace: [argocd](../argocd/SKILL.md)
data:
  context: |
    region: us-east-1
    environment: production
    grafana_url: https://grafana.example.com

  template.app-sync-succeeded: |
    message: |
      Application {{.app.metadata.name}} sync succeeded.
      Sync status: {{.app.status.sync.status}}
      Health: {{.app.status.health.status}}
      Revision: {{.app.status.sync.revision | substr 0 8}}

  template.app-sync-failed: |
    message: |
      ❌ Application {{.app.metadata.name}} sync FAILED.
      Sync status: {{.app.status.sync.status}}
      Health: {{.app.status.health.status}}
      Revision: {{.app.status.sync.revision | substr 0 8}}
      Error: {{.app.status.operationState.syncResult.revision}}

  trigger.on-sync-succeeded: |
    - description: Application sync succeeded
      send: [app-sync-succeeded]
      when: app.status.sync.status == 'Synced'

  trigger.on-sync-failed: |
    - description: Application sync failed
      send: [app-sync-failed]
      when: app.status.operationState.phase in ['Error', 'Failed']

  trigger.on-health-degraded: |
    - description: Application health degraded
      send: [app-health-degraded]
      when: app.status.health.status == 'Degraded'

  service.slack: |
    token: $slack-token
    username: [ArgoCD](../argocd/SKILL.md) Bot
    icon: https://argo-cd.readthedocs.io/en/stable/assets/logo.png
```

### Step 8: Cluster Registration
```bash
# Add a remote cluster to Argo CD
# On the remote cluster:
SERVICE_ACCOUNT_NAME=[argocd](../argocd/SKILL.md)-manager
NAMESPACE=kube-system

[kubectl](../kubectl/SKILL.md) create sa $SERVICE_ACCOUNT_NAME -n $NAMESPACE
[kubectl](../kubectl/SKILL.md) create clusterrolebinding $SERVICE_ACCOUNT_NAME \
  --clusterrole=cluster-admin \
  --serviceaccount=$NAMESPACE:$SERVICE_ACCOUNT_NAME

# Get the secret token
SECRET=$([kubectl](../kubectl/SKILL.md) get sa $SERVICE_ACCOUNT_NAME -n $NAMESPACE -o jsonpath='{.secrets[0].name}')
TOKEN=$([kubectl](../kubectl/SKILL.md) get secret $SECRET -n $NAMESPACE -o jsonpath='{.data.token}' | base64 -d)
APISERVER=$([kubectl](../kubectl/SKILL.md) config view --minify -o jsonpath='{.clusters[0].cluster.server}')

# On Argo CD control node:
[argocd](../argocd/SKILL.md) cluster add <context-name> \
  --name=production-us-east-1 \
  --label=environment=production \
  --label=region=us-east-1
```

## Tool Comparison: Argo CD vs Flux

| Feature | Argo CD | Flux v2 |
|---|---|---|
| Architecture | Controller + CLI + API | Controller-only |
| UI | Built-in Web UI | No native UI (use Weave [GitOps](../gitops/SKILL.md)) |
| ApplicationSets | Built-in (powerful generators) | Not built-in (use [Kustomize](../kustomize/SKILL.md)) |
| Sync mechanism | Git → desired state → apply | Git → reconcile loop |
| Health assessment | Built-in LUA scripts | [Kubernetes](../kubernetes/SKILL.md) status |
| SSO/SAML | OIDC, Dex, SAML | OIDC via CLI |
| Multi-cluster | Via cluster registration | Via Kustomization targeting |
| Argo Rollouts | Native integration | Separate Flagger |
| Notifications | Built-in | Via Flux notification controllers |
| Learning curve | Medium | Medium-High |
| RBAC | Fine-grained policy | [Kubernetes](../kubernetes/SKILL.md) RBAC |

## Anti-Patterns

### Anti-Pattern 1: Auto-Sync with No Prune Protection
Enabling `automated.prune: true` without PR review process. Prune can delete resources in bulk. Always review sync diff before production.

### Anti-Pattern 2: Direct Cluster Edits
Engineers editing resources directly with [kubectl](../kubectl/SKILL.md) in namespaces managed by Argo CD. Argo CD treats this as drift and will self-heal (or fail if self-heal is off).

### Anti-Pattern 3: Single Monolithic Repository
Putting all environments and apps in one repo without structure. Use separate repos per service or well-organized directories with ApplicationSet.

### Anti-Pattern 4: No Resource Customization
Not handling CRD health checks. Argo CD can't determine health of custom resources without LUA health scripts in resource.customizations.

### Anti-Pattern 5: Ignoring Sync Waves
All resources synced simultaneously. Database migrations running at the same time as application deployments cause failures.

### Anti-Pattern 6: Overprivileged RBAC
Using `role:admin` for all users. Create least-privilege roles (readonly, sync-only, admin per project).

## Production Considerations

### Security
- Enable SSO with OIDC and MFA — never use shared admin password.
- Restrict cluster access: only Argo CD control plane needs `cluster-admin`.
- Use webhook secrets to validate git provider requests.
- Disable `[argocd](../argocd/SKILL.md) admin` initial password; rotate immediately.
- Enable [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging for all Argo CD operations.
- Use network policies to restrict Argo CD component communication.

### High Availability
- Deploy Argo CD with multiple replicas ([argocd](../argocd/SKILL.md)-server, [argocd](../argocd/SKILL.md)-repo-server).
- Use Redis HA for [argocd](../argocd/SKILL.md)-server session storage.
- Configure [argocd](../argocd/SKILL.md)-repo-server parallelism for large repos.
- Monitor Argo CD itself (metrics on port 8083/metrics).

### Disaster Recovery
- Backup Argo CD configuration (Applications, Projects, RBAC) to Git.
- Maintain bootstrap Argo CD manifests in a separate repo.
- Document cluster re-registration procedure.
- Test DR by recreating Argo CD from scratch using only Git sources.

### Performance
- Set repo-server parallelism based on number of applications.
- Use repository caching to speed up sync.
- Disable detailed diff for large applications.
- Set `statusBadgeEnabled: false` if not using badges.

## Troubleshooting Guide

| Issue | Likely Cause | Solution |
|---|---|---|
| OutOfSync (drift) | Manual [kubectl](../kubectl/SKILL.md) edit | Revert manual changes; enable self-heal |
| Sync stuck | CRD not installed | Verify CRDs; install missing ones |
| Connection refused | Cluster API not accessible | Check cluster endpoint; network policies |
| Application not found | Namespace mismatch | Verify destination namespace exists |
| Health unknown | CRD health check missing | Add resource.customizations LUA |
| Webhook not triggering | Secret mismatch | Verify webhook secret between Argo CD and Git |
| Repo cloning failed | Git credentials wrong | Update repository credentials in [argocd](../argocd/SKILL.md)-cm |

## Rules & Constraints
- All Application manifests must be in Git — never create via CLI for production.
- Every Application must have `syncPolicy.automated.prune: true` only after review.
- Use ApplicationSets for multi-environment or multi-cluster deployments.
- Every sync must be testable with `[argocd](../argocd/SKILL.md) app diff` before applying.
- Never edit Argo CD managed resources directly with [kubectl](../kubectl/SKILL.md).
- Enable self-healing only when automated sync is enabled.
- Configure webhook triggers for faster sync — don't rely on polling.
- Pin targetRevision to specific branches or tags, never `HEAD` for production.
- Define Projects to isolate teams and clusters.
- Log all sync failures to external [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md).

## Output Format
Argo CD Application/ApplicationSet YAML, Project YAML, RBAC config, notification templates.

## References
  - ../../../Global_References/argo-cd-advanced.md
  - ../../../Global_References/argo-cd-application-sets.md
  - ../../../Global_References/argo-cd-fundamentals.md
  - ../../../Global_References/argo-cd-sync-strategies.md
  - ../../../Global_References/[argocd-operations](../../Observability_and_SecOps/[argocd](../argocd/SKILL.md)-operations/SKILL.md).md
  - ../../../Global_References/argo-cd_argocd-patterns.md
  - ../../../Global_References/[argocd](../argocd/SKILL.md)-setup.md
  - references/[argocd](../argocd/SKILL.md)-rollouts-guide.md

## Handoff
After completing this skill:
- Next skill: **[gitops](../gitops/SKILL.md)** — [GitOps](../gitops/SKILL.md) principles, Flux comparison
- Pass context: cluster list, Application names, sync strategy, notification config

