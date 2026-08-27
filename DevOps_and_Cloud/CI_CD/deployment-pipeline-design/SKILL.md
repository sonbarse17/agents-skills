---
name: deployment-pipeline-design
description: Design multi-stage CI/CD pipelines with approval gates, security checks, and deployment orchestration. Use this skill when designing zero-downtime deployment pipelines, implementing canary rollout strategies, setting up multi-environment promotion workflows, or debugging failed deployment gates in CI/CD.
---

# Deployment Pipeline Design

Architecture patterns for multi-stage CI/CD pipelines with approval gates, deployment strategies, and environment promotion workflows.

## Purpose

Design robust, secure deployment pipelines that balance speed with safety through proper stage organization, automated quality gates, and progressive delivery strategies. This skill covers both the structural design of pipeline architecture and the operational patterns for reliable production deployments.

## Input / Output

### What You Provide

- **Application type**: Language/runtime, containerized or [bare-metal](../../../AI_and_Agents/Models_and_FineTuning/bare-metal/SKILL.md), monolith or [microservices](../../../Software_Engineering_and_Other/Patterns/microservices/SKILL.md)
- **Deployment target**: [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md), ECS, VMs, [serverless](../../Containers_and_Orchestration/serverless/SKILL.md), or platform-as-a-service
- **Environment topology**: Number of environments (dev/staging/prod), region layout, air-gap requirements
- **Rollout requirements**: Acceptable downtime, rollback SLA, traffic splitting needs, canary vs blue-green preference
- **Gate constraints**: Approval teams, required test coverage thresholds, compliance scans (SAST, DAST, SCA)
- **[Monitoring](../../Observability_and_SecOps/monitoring/SKILL.md) stack**: Prometheus, [Datadog](../../Observability_and_SecOps/datadog/SKILL.md), CloudWatch, or other metrics sources used for automated promotion decisions

### What This Skill Produces

- **Pipeline configuration**: Stage definitions, job dependencies, parallelism, and caching strategy
- **Deployment strategy**: Chosen rollout pattern with annotated configuration (canary weights, blue-green switchover, rolling parameters)
- **Health check setup**: Shallow vs deep readiness probes, post-deployment smoke test scripts
- **Gate definitions**: Automated metric thresholds and manual approval workflows
- **Rollback plan**: Automated rollback triggers and manual [runbook](../../Observability_and_SecOps/runbook/SKILL.md) steps

## When to Use

- Design CI/CD architecture for a new service or platform migration
- Implement deployment gates between environments
- Configure multi-environment pipelines with mandatory security scanning
- Establish progressive delivery with canary or blue-green strategies
- Debug pipelines where stages succeed but production behavior is wrong
- Reduce mean time to recovery by automating rollback on metric degradation

## Detailed patterns and worked examples

Detailed pattern documentation lives in `../../../Global_References/deployment-pipeline-design_details.md`. Read that file when the navigation tier above is insufficient.

## Troubleshooting

### Health check passes in pipeline but service is unhealthy in production

The pipeline health check is hitting a shallow `/ping` endpoint that returns 200 even when the database is unreachable. Use a deep readiness check that verifies actual dependencies (see Health Checks section above).

### Canary deployment never promotes to 100%

Argo Rollouts requires a valid `AnalysisTemplate` to auto-promote. If the Prometheus query returns no data (e.g., metric name changed), the analysis stays inconclusive and promotion stalls. Add `inconclusiveLimit` so the rollout fails fast rather than hanging:

```yaml
spec:
  metrics:
  - name: error-rate
    failureCondition: "result[0] > 0.05"
    inconclusiveLimit: 2   # fail after 2 inconclusive results, not hang indefinitely
    provider:
      prometheus:
        query: |
          sum(rate(http_requests_total{status=~"5.."}[2m]))
          / sum(rate(http_requests_total[2m]))
```

### Staging deploy succeeds but production job never starts

Check that production environment protection rules are configured — a missing reviewer assignment means the approval gate waits indefinitely with no notification. In [GitHub](../github/SKILL.md) Actions, ensure `Required reviewers` is set to an existing user or team in **Settings → Environments → production**.

### [Docker](../../Containers_and_Orchestration/docker/SKILL.md) layer cache busted on every run causing slow builds

If `COPY . .` appears before dependency installation, any source file change invalidates the dependency layer. Reorder to copy dependency manifests first:

```dockerfile
# Good: dependencies cached separately from source code
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

### Rollback leaves database migrations applied to old code

A service rollback without a migration rollback causes schema/code mismatch errors. Always make migrations backward-compatible (additive only) for at least one release cycle, and keep undo scripts versioned alongside the migration:

```bash
# migrations/V20240315__add_nullable_column.sql       (forward)
# migrations/V20240315__add_nullable_column.undo.sql  (backward)
```

Never run destructive migrations (DROP COLUMN, ALTER NOT NULL) until the old code version is fully retired from all environments.

## Advanced Topics

For platform-specific pipeline configurations, multi-region promotion workflows, and advanced Argo Rollouts patterns, see:

- [`../../../Global_References/advanced-strategies.md`](../../../Global_References/advanced-strategies.md) — Extended YAML examples, platform-specific configs ([GitHub](../github/SKILL.md) Actions, GitLab CI, Azure Pipelines), multi-region canary patterns, and database migration rollback strategies

## Related Skills

- `[github-actions-templates](../[github-actions](../[github](../github/SKILL.md)-actions/SKILL.md)-templates/SKILL.md)` - For [GitHub](../github/SKILL.md) Actions implementation patterns and reusable workflows
- `[gitlab-ci-patterns](../[gitlab-ci](../gitlab-ci/SKILL.md)-patterns/SKILL.md)` - For GitLab CI/CD pipeline implementation
- `[secrets-management](../../Cloud_Providers/secrets-management/SKILL.md)` - For secrets handling in CI/CD pipelines

