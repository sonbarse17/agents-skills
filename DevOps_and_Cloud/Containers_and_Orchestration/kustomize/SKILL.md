---
name: kustomize
description: Customize Kubernetes manifests without templating using Kustomize. Create base configurations with environment overlays, manage configuration variants, and patch resources declaratively. Use when managing Kubernetes configurations across multiple environments without Helm.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
---

# Kustomize

[Customize](../../../AI_and_Agents/Infrastructure/deploy-model/[customize](../../Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md) [Kubernetes](../kubernetes/SKILL.md) resources declaratively without templating.

## When to Use This Skill

Use this skill when:
- Managing [Kubernetes](../kubernetes/SKILL.md) configs across environments
- Patching existing manifests without modification
- Creating configuration variants from bases
- Customizing third-party manifests
- Preferring declarative over templating approach

## Prerequisites

- [kubectl](../kubectl/SKILL.md) 1.14+ (includes kustomize)
- Or standalone kustomize CLI
- Basic [Kubernetes](../kubernetes/SKILL.md) manifest knowledge

## Directory Structure

```
myapp/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── overlays/
    ├── development/
    │   ├── kustomization.yaml
    │   └── replica-patch.yaml
    ├── staging/
    │   ├── kustomization.yaml
    │   └── namespace.yaml
    └── production/
        ├── kustomization.yaml
        ├── replica-patch.yaml
        └── resource-patch.yaml
```

## Base Configuration

### kustomization.yaml

```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml

commonLabels:
  app: myapp
  
commonAnnotations:
  managed-by: kustomize
```

### Base Resources

```yaml
# base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
```

## Overlays

### Development Overlay

```yaml
# overlays/development/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

namespace: myapp-dev

namePrefix: dev-

commonLabels:
  environment: development

images:
  - name: myapp
    newTag: dev-latest
```

### Production Overlay

```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

namespace: myapp-prod

namePrefix: prod-

commonLabels:
  environment: production

replicas:
  - name: myapp
    count: 5

images:
  - name: myapp
    newName: registry.example.com/myapp
    newTag: v2.0.0

patches:
  - path: resource-patch.yaml
```

## Patching

### Strategic Merge Patch

```yaml
# overlays/production/resource-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: myapp
        resources:
          requests:
            memory: "256Mi"
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1000m"
```

### JSON Patch

```yaml
# kustomization.yaml
patches:
  - target:
      kind: Deployment
      name: myapp
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 5
      - op: add
        path: /spec/template/spec/containers/0/env
        value:
          - name: LOG_LEVEL
            value: info
```

### Inline Patches

```yaml
# kustomization.yaml
patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: myapp
      spec:
        replicas: 3
    target:
      kind: Deployment
      name: myapp
```

## Configuration Generation

### ConfigMap Generator

```yaml
# kustomization.yaml
configMapGenerator:
  - name: myapp-config
    literals:
      - APP_ENV=production
      - LOG_LEVEL=info
    files:
      - config.yaml
    envs:
      - config.env
    options:
      disableNameSuffixHash: false
```

### Secret Generator

```yaml
# kustomization.yaml
secretGenerator:
  - name: myapp-secrets
    literals:
      - api-key=secret123
    files:
      - tls.crt
      - tls.key
    type: [kubernetes](../kubernetes/SKILL.md).io/tls
```

## Image Transformations

```yaml
# kustomization.yaml
images:
  # Change tag
  - name: myapp
    newTag: v2.0.0
  
  # Change registry
  - name: myapp
    newName: registry.example.com/myapp
    newTag: v2.0.0
  
  # Use digest
  - name: myapp
    digest: sha256:abc123...
```

## Resource Transformations

### Name Prefix/Suffix

```yaml
# kustomization.yaml
namePrefix: prod-
nameSuffix: -v2
```

### Namespace

```yaml
# kustomization.yaml
namespace: production
```

### Labels and Annotations

```yaml
# kustomization.yaml
commonLabels:
  app.[kubernetes](../kubernetes/SKILL.md).io/name: myapp
  app.[kubernetes](../kubernetes/SKILL.md).io/environment: production

commonAnnotations:
  example.com/owner: team-a
```

### Replicas

```yaml
# kustomization.yaml
replicas:
  - name: myapp
    count: 5
  - name: worker
    count: 3
```

## Components

```yaml
# components/[monitoring](../../Observability_and_SecOps/monitoring/SKILL.md)/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1alpha1
kind: Component

resources:
  - servicemonitor.yaml

patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: myapp
      spec:
        template:
          metadata:
            annotations:
              prometheus.io/scrape: "true"
              prometheus.io/port: "8080"
```

```yaml
# overlays/production/kustomization.yaml
components:
  - ../../components/[monitoring](../../Observability_and_SecOps/monitoring/SKILL.md)
```

## Remote Resources

```yaml
# kustomization.yaml
resources:
  # Remote Git repository
  - https://[github](../../CI_CD/github/SKILL.md).com/org/manifests//base?ref=v1.0.0
  
  # Remote URL
  - https://raw.githubusercontent.com/org/repo/main/deployment.yaml
```

## Commands

```bash
# Build and view output
[kubectl](../kubectl/SKILL.md) kustomize overlays/production

# Apply to cluster
[kubectl](../kubectl/SKILL.md) apply -k overlays/production

# Delete resources
[kubectl](../kubectl/SKILL.md) delete -k overlays/production

# View diff
[kubectl](../kubectl/SKILL.md) diff -k overlays/production

# Build with standalone kustomize
kustomize build overlays/production

# Build and apply
kustomize build overlays/production | [kubectl](../kubectl/SKILL.md) apply -f -
```

## Helm Chart Integration

```yaml
# kustomization.yaml
helmCharts:
  - name: prometheus
    repo: https://prometheus-community.[github](../../CI_CD/github/SKILL.md).io/[helm-charts](../helm-charts/SKILL.md)
    version: 25.0.0
    releaseName: prometheus
    namespace: [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md)
    valuesFile: values.yaml
    includeCRDs: true
```

## Variable Substitution

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml

replacements:
  - source:
      kind: ConfigMap
      name: myapp-config
      fieldPath: data.APP_VERSION
    targets:
      - select:
          kind: Deployment
          name: myapp
        fieldPaths:
          - spec.template.spec.containers.[name=myapp].image
        options:
          delimiter: ':'
          index: 1
```

## Common Issues

### Issue: Name Hash Conflicts
**Problem**: Resources not updating when ConfigMap changes
**Solution**: Enable name suffix hash (default) or use replacement

### Issue: Patch Not Applying
**Problem**: Strategic merge patch doesn't work
**Solution**: Verify resource names match, use JSON patch for complex changes

### Issue: Remote Resource Fails
**Problem**: Cannot fetch remote resources
**Solution**: Check URL, verify ref/tag exists, ensure network access

### Issue: Label Selector Mismatch
**Problem**: commonLabels breaks selectors
**Solution**: Use includeSelectors: false or exclude specific resources

```yaml
commonLabels:
  app: myapp
configurations:
  - labelExclusions.yaml
```

## Best Practices

- Keep base manifests environment-agnostic
- Use overlays for environment-specific config
- Prefer strategic merge patches for simple changes
- Use components for optional features
- Pin remote resource versions
- Enable ConfigMap/Secret hash suffixes
- Document overlay structure in README
- Test builds before applying

## Related Skills

- [kubernetes-ops](../[kubernetes-ops](../[kubernetes](../kubernetes/SKILL.md)-ops/SKILL.md)/) - K8s fundamentals
- [helm-charts](../[helm-charts](../helm-charts/SKILL.md)/) - Helm alternative
- [argocd-gitops](../[argocd-gitops](../[argocd](../argocd/SKILL.md)-[gitops](../gitops/SKILL.md)/SKILL.md)/) - [GitOps](../gitops/SKILL.md) deployment
