---
name: gitlab-ci-patterns
description: Build GitLab CI/CD pipelines with multi-stage workflows, caching,
  and distributed runners for scalable automation. Use when implementing GitLab
  CI/CD, optimizing pipeline performance, or setting up automated testing and
  deployment.
tags:
  - ci_cd
  - gitlab-ci-patterns
depends_on: []
---

# GitLab CI Patterns

Comprehensive GitLab CI/CD pipeline patterns for automated testing, building, and deployment.

## Purpose

Create efficient GitLab CI pipelines with proper stage organization, caching, and deployment strategies.

## When to Use

- Automate GitLab-based CI/CD
- Implement multi-stage pipelines
- Configure GitLab Runners
- Deploy to [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) from GitLab
- Implement [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) workflows

## Basic Pipeline Structure

```yaml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run lint
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

deploy:
  stage: deploy
  image: bitnami/[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md):1.31
  script:
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) apply -f k8s/
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) rollout status deployment/my-app
  only:
    - main
  environment:
    name: production
    url: https://app.example.com
```

## [Docker](../../Containers_and_Orchestration/docker/SKILL.md) Build and Push

```yaml
build-[docker](../../Containers_and_Orchestration/docker/SKILL.md):
  stage: build
  image: [docker](../../Containers_and_Orchestration/docker/SKILL.md):24
  services:
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md):24-dind
  before_script:
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md) login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md) build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md) build -t $CI_REGISTRY_IMAGE:latest .
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md) push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md) push $CI_REGISTRY_IMAGE:latest
  only:
    - main
    - tags
```

## Multi-Environment Deployment

```yaml
.deploy_template: &deploy_template
  image: bitnami/[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md):1.31
  before_script:
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) config set-cluster k8s --server="$KUBE_URL" --insecure-skip-tls-verify=true
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) config set-credentials admin --token="$KUBE_TOKEN"
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) config set-context default --cluster=k8s --user=admin
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) config use-context default

deploy:staging:
  <<: *deploy_template
  stage: deploy
  script:
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) apply -f k8s/ -n staging
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) rollout status deployment/my-app -n staging
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - develop

deploy:production:
  <<: *deploy_template
  stage: deploy
  script:
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) apply -f k8s/ -n production
    - [kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) rollout status deployment/my-app -n production
  environment:
    name: production
    url: https://app.example.com
  when: manual
  only:
    - main
```

## Terraform Pipeline

```yaml
stages:
  - validate
  - plan
  - apply

variables:
  TF_ROOT: ${CI_PROJECT_DIR}/terraform
  TF_VERSION: "1.6.0"

before_script:
  - cd ${TF_ROOT}
  - terraform --version

validate:
  stage: validate
  image: hashicorp/terraform:${TF_VERSION}
  script:
    - terraform init -backend=false
    - terraform validate
    - terraform fmt -check

plan:
  stage: plan
  image: hashicorp/terraform:${TF_VERSION}
  script:
    - terraform init
    - terraform plan -out=tfplan
  artifacts:
    paths:
      - ${TF_ROOT}/tfplan
    expire_in: 1 day

apply:
  stage: apply
  image: hashicorp/terraform:${TF_VERSION}
  script:
    - terraform init
    - terraform apply -auto-approve tfplan
  dependencies:
    - plan
  when: manual
  only:
    - main
```

## Security Scanning

```yaml
include:
  - template: Security/SAST.[gitlab-ci](../gitlab-ci/SKILL.md).yml
  - template: Security/[Dependency-Scanning](../../../Security/dependency-scanning/SKILL.md).[gitlab-ci](../gitlab-ci/SKILL.md).yml
  - template: Security/[Container-Scanning](../../Containers_and_Orchestration/container-scanning/SKILL.md).[gitlab-ci](../gitlab-ci/SKILL.md).yml

trivy-scan:
  stage: test
  image: aquasec/trivy:0.58.0
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  allow_failure: true
```

## Caching Strategies

```yaml
# Cache node_modules
build:
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
    policy: pull-push

# Global cache
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .cache/
    - vendor/

# Separate cache per job
job1:
  cache:
    key: job1-cache
    paths:
      - build/

job2:
  cache:
    key: job2-cache
    paths:
      - dist/
```

## Dynamic Child Pipelines

```yaml
generate-pipeline:
  stage: build
  script:
    - [python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) generate_pipeline.py > child-pipeline.yml
  artifacts:
    paths:
      - child-pipeline.yml

trigger-child:
  stage: deploy
  trigger:
    include:
      - artifact: child-pipeline.yml
        job: generate-pipeline
    strategy: depend
```


## Best Practices

1. **Use specific image tags** (node:20, not node:latest)
2. **Cache dependencies** appropriately
3. **Use artifacts** for build outputs
4. **Implement manual gates** for production
5. **Use environments** for deployment tracking
6. **Enable merge request pipelines**
7. **Use pipeline schedules** for recurring jobs
8. **Implement security scanning**
9. **Use CI/CD variables** for secrets
10. **Monitor pipeline performance**

## Related Skills

- `[github-actions-templates](../[github-actions](../[github](../github/SKILL.md)-actions/SKILL.md)-templates/SKILL.md)` - For [GitHub](../github/SKILL.md) Actions
- `[deployment-pipeline-design](../deployment-pipeline-design/SKILL.md)` - For architecture
- `[secrets-management](../../Cloud_Providers/secrets-management/SKILL.md)` - For secrets handling
