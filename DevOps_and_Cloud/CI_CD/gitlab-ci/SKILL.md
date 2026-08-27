---
name: gitlab-ci
description: Configure GitLab CI/CD pipelines and runners for automated building, testing, and deployment. Create .gitlab-ci.yml configurations, manage runners, and implement DevOps workflows. Use when working with GitLab repositories or self-hosted GitLab instances.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
---

# GitLab CI/CD

Automate your software delivery pipeline with GitLab's integrated CI/CD system.

## When to Use This Skill

Use this skill when:
- Setting up CI/CD pipelines in GitLab
- Configuring GitLab runners (shared or self-hosted)
- Creating multi-stage deployment pipelines
- Implementing GitLab Auto DevOps
- Managing CI/CD variables and secrets

## Prerequisites

- GitLab repository (gitlab.com or self-hosted)
- Basic understanding of YAML
- For self-hosted runners: Linux server or [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) cluster

## Pipeline Configuration

Create `.gitlab-ci.yml` in repository root:

```yaml
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "20"

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'

deploy:
  stage: deploy
  script:
    - ./deploy.sh
  environment:
    name: production
    url: https://example.com
  only:
    - main
```

## Job Configuration

### Rules-Based Execution

```yaml
deploy:
  script: ./deploy.sh
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: never
    - when: on_success
```

### Parallel Jobs

```yaml
test:
  stage: test
  parallel: 3
  script:
    - npm test -- --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
```

### Matrix Builds

```yaml
test:
  stage: test
  parallel:
    matrix:
      - NODE_VERSION: ["18", "20", "22"]
        OS: ["alpine", "slim"]
  image: node:${NODE_VERSION}-${OS}
  script:
    - npm test
```

## Caching

```yaml
cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/
  policy: pull-push

build:
  cache:
    key: build-cache
    paths:
      - .cache/
    policy: pull
```

## Artifacts

```yaml
build:
  artifacts:
    paths:
      - dist/
      - coverage/
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura.xml
    expire_in: 1 week
    when: always
```

## Environments and Deployments

```yaml
deploy_staging:
  stage: deploy
  script:
    - deploy --env staging
  environment:
    name: staging
    url: https://staging.example.com
    on_stop: stop_staging

stop_staging:
  stage: deploy
  script:
    - undeploy --env staging
  environment:
    name: staging
    action: stop
  when: manual
```

## [Docker](../../Containers_and_Orchestration/docker/SKILL.md) Builds

```yaml
build_image:
  stage: build
  image: [docker](../../Containers_and_Orchestration/docker/SKILL.md):24
  services:
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md):24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  script:
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md) login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md) build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md) push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

## GitLab Runners

### Install Runner

```bash
# Download and install
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt install gitlab-runner

# Register runner
sudo gitlab-runner register \
  --url https://gitlab.com/ \
  --registration-token TOKEN \
  --executor [docker](../../Containers_and_Orchestration/docker/SKILL.md) \
  --[docker](../../Containers_and_Orchestration/docker/SKILL.md)-image alpine:latest
```

### Runner Configuration

```toml
# /etc/gitlab-runner/config.toml
[[runners]]
  name = "[docker](../../Containers_and_Orchestration/docker/SKILL.md)-runner"
  url = "https://gitlab.com/"
  token = "TOKEN"
  executor = "[docker](../../Containers_and_Orchestration/docker/SKILL.md)"
  [runners.docker]
    image = "alpine:latest"
    privileged = true
    volumes = ["/cache", "/var/run/[docker](../../Containers_and_Orchestration/docker/SKILL.md).sock:/var/run/[docker](../../Containers_and_Orchestration/docker/SKILL.md).sock"]
```

### Runner Tags

```yaml
build:
  tags:
    - [docker](../../Containers_and_Orchestration/docker/SKILL.md)
    - linux
  script:
    - make build
```

## CI/CD Variables

### Protected Variables

Define in Settings > CI/CD > Variables:
- `AWS_ACCESS_KEY_ID` (protected, masked)
- `AWS_SECRET_ACCESS_KEY` (protected, masked)

### Using Variables

```yaml
deploy:
  script:
    - aws s3 sync dist/ s3://$S3_BUCKET
  variables:
    AWS_DEFAULT_REGION: us-east-1
```

## Include and Extend

### Include Templates

```yaml
include:
  - template: Security/SAST.gitlab-ci.yml
  - project: 'group/shared-ci'
    file: '/templates/deploy.yml'
  - local: '/ci/jobs.yml'
```

### Extend Jobs

```yaml
.base_job:
  image: node:20
  before_script:
    - npm ci

build:
  extends: .base_job
  script:
    - npm run build

test:
  extends: .base_job
  script:
    - npm test
```

## Multi-Project Pipelines

```yaml
trigger_downstream:
  stage: deploy
  trigger:
    project: group/downstream-project
    branch: main
    strategy: depend
```

## Common Issues

### Issue: Pipeline Stuck
**Problem**: Jobs stay pending
**Solution**: Check runner availability and tags matching

### Issue: [Docker](../../Containers_and_Orchestration/docker/SKILL.md)-in-[Docker](../../Containers_and_Orchestration/docker/SKILL.md) Fails
**Problem**: Cannot connect to [Docker](../../Containers_and_Orchestration/docker/SKILL.md) daemon
**Solution**: Use `[docker](../../Containers_and_Orchestration/docker/SKILL.md):dind` service with proper TLS configuration

### Issue: Cache Not Working
**Problem**: Cache misses between jobs
**Solution**: Verify cache key and ensure runners share distributed cache

## Best Practices

- Use `rules` instead of `only/except` for complex conditions
- Leverage GitLab's built-in security scanning templates
- Use job dependencies to optimize pipeline speed
- Implement review apps for merge requests
- Cache dependencies aggressively
- Use artifacts for passing data between stages

## Related Skills

- [github-actions](../[github-actions](../[github](../github/SKILL.md)-actions/SKILL.md)/) - [GitHub](../github/SKILL.md) CI/CD alternative
- [argocd-gitops](../../orchestration/[argocd-gitops](../../Containers_and_Orchestration/[argocd](../../Containers_and_Orchestration/argocd/SKILL.md)-[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)/SKILL.md)/) - [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) deployments
- [container-registries](../../containers/[container-registries](../../Cloud_Providers/container-registries/SKILL.md)/) - Registry management
