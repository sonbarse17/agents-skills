---
name: complete-cicd-pipeline-deployment-for-kubernetes-from-scratch
description: >
  Builds a complete CI/CD pipeline for a Kubernetes-targeted service from
  an empty repo — source checkout, container image build, SCA/SAST
  security gates, registry push, and a deploy step that ends at a GitOps
  handoff (committing a new image tag to a manifests repo) rather than a
  direct kubectl apply or helm upgrade against the cluster. Use when the
  user asks to "build a full CI/CD pipeline for Kubernetes from scratch,"
  "set up CI/CD that ends in a GitOps commit, not a cluster deploy," "wire
  a container build pipeline into Argo CD/Flux," or "go from an empty repo
  to a Kubernetes service deployed via GitOps end-to-end."
license: Apache-2.0
compatibility: "Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI"
metadata:
  domain: cicd-tooling
  maturity: stable
---

# Complete CI/CD Pipeline Deployment for [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md), From Scratch

## Purpose

A [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md)-targeted pipeline's defining mechanical trait is **where its
job ends**: it builds a container image, gates it, and pushes it to a
registry — but it does *not* touch the cluster. The last step is a Git
[commit](../../CI_CD/commit/SKILL.md) (a new image tag in a manifests/config repo), and a separate
in-cluster [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) operator (Argo CD/Flux) performs the actual apply. This
is the opposite shape from the VM-based and [serverless](../../Containers_and_Orchestration/serverless/SKILL.md) variants of this
skill, both of which end with the pipeline itself calling a deploy API
against live infrastructure. Every individual mechanic here — the
Dockerfile, the SAST/SCA tool invocations, the [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) repo structure —
already has its own deep skill; this one sequences them into one coherent
"empty repo to running-via-[GitOps](../../Containers_and_Orchestration/gitops/SKILL.md)" walkthrough and is explicit about the
handoff boundary so a well-meaning "just add a deploy step" doesn't
reintroduce direct cluster credentials into CI.

## When to use

- A new [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md)-targeted service has no pipeline yet, and the team
  wants source-to-[GitOps](../../Containers_and_Orchestration/gitops/SKILL.md)-handoff wired up in one pass rather than
  individually bolting on build, scan, and deploy steps over time.
- An existing pipeline currently ends with `[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) apply`/`helm upgrade`
  run directly from CI, and the user wants to migrate it to a [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md)
  handoff instead.
- The user wants to understand exactly where CI's responsibility ends and
  the [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) operator's begins for a containerized workload.
- Standing up the SAST/SCA gate sequence specifically for a
  container-image build (as opposed to a zip/layer or AMI-baking build).

## Prerequisites & environment

- A Git host and CI platform already available —
  [github-actions-single-repo-workflows](../[github-actions-single-repo-workflows](../../CI_CD/[github-actions](../../CI_CD/[github](../../CI_CD/github/SKILL.md)-actions/SKILL.md)-single-repo-workflows/SKILL.md)/SKILL.md)
  or
  [jenkins-declarative-pipeline-per-repo](../[jenkins-declarative-pipeline-per-repo](../../CI_CD/[jenkins](../../CI_CD/jenkins/SKILL.md)-declarative-pipeline-per-repo/SKILL.md)/SKILL.md)
  cover the concrete pipeline-authoring mechanics this skill sequences;
  either works, and examples below show [GitHub](../../CI_CD/github/SKILL.md) Actions with a [Jenkins](../../CI_CD/jenkins/SKILL.md) note
  where the shape differs.
- A container registry the pipeline can push to (GHCR, ECR, ACR, Artifact
  Registry, or a self-hosted Harbor) with least-privilege push credentials
  stored as CI secrets.
- A **separate** [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) config/manifests repo already set up — per
  [gitops-workflow](../../../devops/skills/[gitops-workflow](../../Containers_and_Orchestration/[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-workflow/SKILL.md)/SKILL.md) — with
  an Argo CD `Application`/`ApplicationSet` (or Flux `Kustomization`)
  already watching it. This skill assumes that operator-side setup exists;
  see the four `complete-[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-[argocd](../../Containers_and_Orchestration/argocd/SKILL.md)-deployment-on-*-from-scratch`
  skills in `[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-argo-ecosystem` if it doesn't yet.
- Write access (a bot/service account, ideally opening a PR rather than
  pushing directly) from the application repo's CI to the config repo.
- SAST/SCA tooling chosen per
  [sast-integration](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[sast-integration](../../../Security/sast-integration/SKILL.md)/SKILL.md)
  and
  [software-composition-analysis-sca](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[software-composition-analysis-sca](../../../Software_Engineering_and_Other/Frontend/software-composition-analysis-sca/SKILL.md)/SKILL.md).

## Step-by-step guidance

### Phase 1 — Source and trigger scoping

Standard trigger/concurrency setup per
[ci-cd-pipeline-design](../../../devops/skills/[ci-cd-pipeline-design](../../CI_CD/ci-cd-pipeline-design/SKILL.md)/SKILL.md)
and
[github-actions-single-repo-workflows](../[github-actions-single-repo-workflows](../../CI_CD/[github-actions](../../CI_CD/[github](../../CI_CD/github/SKILL.md)-actions/SKILL.md)-single-repo-workflows/SKILL.md)/SKILL.md):
run the full pipeline on PRs and pushes to `main`, path-filtered in a
[monorepo](../../../Software_Engineering_and_Other/Frontend/monorepo/SKILL.md).

### Phase 2 — Build the container image

Follow
[container-build-and-release](../../../devops/skills/[container-build-and-release](../../Containers_and_Orchestration/container-build-and-release/SKILL.md)/SKILL.md)
in full for the Dockerfile itself (multi-stage, non-root, pinned base
image, immutable tagging by [commit](../../CI_CD/commit/SKILL.md) SHA). This is the [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md)-specific
build artifact — contrast with Phase 2 of the [serverless](../../Containers_and_Orchestration/serverless/SKILL.md) variant of this
skill (a zip/layer, no Dockerfile at all) and the VM variant (a full
machine image, not a container layer).

### Phase 3 — SAST and SCA gates, scoped to the diff

Per
[sast-integration](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[sast-integration](../../../Security/sast-integration/SKILL.md)/SKILL.md)
and
[software-composition-analysis-sca](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[software-composition-analysis-sca](../../../Software_Engineering_and_Other/Frontend/software-composition-analysis-sca/SKILL.md)/SKILL.md),
run diff-aware static analysis and a dependency/lockfile scan **before**
the image is pushed anywhere — failing fast on a critical finding before
spending registry storage and pipeline minutes on an image that won't
ship:
```yaml
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: semgrep ci --config p/owasp-top-ten --baseline-[commit](../../CI_CD/commit/SKILL.md) "${{ [github](../../CI_CD/github/SKILL.md).event.pull_request.base.sha }}"
  sca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@0.24.0
        with: { scan-type: 'fs', severity: 'CRITICAL,HIGH', exit-code: '1', ignore-unfixed: true }
```

### Phase 4 — Push the built image to the registry

Only after Phase 3 passes:
```yaml
  build-and-push:
    needs: [sast, sca]
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: [docker](../../Containers_and_Orchestration/docker/SKILL.md)/setup-buildx-action@v3
      - uses: [docker](../../Containers_and_Orchestration/docker/SKILL.md)/login-action@v3
        with: { registry: ghcr.io, username: "${{ [github](../../CI_CD/github/SKILL.md).actor }}", password: "${{ secrets.GITHUB_TOKEN }}" }
      - uses: [docker](../../Containers_and_Orchestration/docker/SKILL.md)/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/example/payments-api:${{ [github](../../CI_CD/github/SKILL.md).sha }}
```
A follow-on image scan (per
[software-composition-analysis-sca](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[software-composition-analysis-sca](../../../Software_Engineering_and_Other/Frontend/software-composition-analysis-sca/SKILL.md)/SKILL.md)'s
container-image scanning step) on the pushed digest catches base-image
CVEs the filesystem scan in Phase 3 couldn't see.

### Phase 5 — The deploy step: a [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) handoff, not a cluster touch

This is the defining step. The pipeline's last action is a **Git [commit](../../CI_CD/commit/SKILL.md)**
against the manifests repo, bumping the image tag/digest in the relevant
overlay — never a direct `[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) apply`, `helm upgrade`, or any command
carrying a cluster credential:
```yaml
  update-manifests:
    needs: build-and-push
    if: [github](../../CI_CD/github/SKILL.md).ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: example/[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-config
          token: ${{ secrets.GITOPS_REPO_TOKEN }}
      - run: |
          cd apps/payments-api/overlays/staging
          [kustomize](../../Containers_and_Orchestration/kustomize/SKILL.md) edit set image payments-api=ghcr.io/example/payments-api:${{ [github](../../CI_CD/github/SKILL.md).sha }}
          git config user.name "ci-bot"
          git config user.email "ci-bot@example.com"
          git [commit](../../CI_CD/commit/SKILL.md) -am "payments-api: bump to ${{ [github](../../CI_CD/github/SKILL.md).sha }}"
          git push
```
`GITOPS_REPO_TOKEN` is scoped **only** to the manifests repo (never a
cluster kubeconfig or cloud credential) — the in-cluster Argo CD
`Application`/`ApplicationSet` (see the relevant
`complete-[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-[argocd](../../Containers_and_Orchestration/argocd/SKILL.md)-deployment-on-*-from-scratch` skill) picks up this
[commit](../../CI_CD/commit/SKILL.md) and performs the actual `[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) apply` on its own reconciliation
loop, per
[gitops-workflow](../../../devops/skills/[gitops-workflow](../../Containers_and_Orchestration/[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-workflow/SKILL.md)/SKILL.md).

### Phase 6 — Verify the handoff, not the deploy

The pipeline's own success/failure only reflects "the manifests repo was
updated correctly" — it cannot and should not report "the cluster is
running the new version," since that's the [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) operator's job.
Separately, monitor `[argocd](../../Containers_and_Orchestration/argocd/SKILL.md) app get payments-api-staging` (or a
notification wired from Argo CD/Flux) for the actual rollout outcome.

## Best practices

- Never let this pipeline hold a cluster kubeconbig, a cloud IAM role with
  cluster-apply permissions, or any credential capable of a direct
  `[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) apply` — the entire point of the [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) handoff is that CI's
  blast radius, if compromised, is "can propose a manifest change," not
  "can directly mutate the cluster."
- Prefer opening a PR against the manifests repo (with required review)
  for production overlays, and a direct [commit](../../CI_CD/commit/SKILL.md) only for lower
  environments (staging/dev) where the team has decided fast, unreviewed
  promotion is acceptable — mirroring the sync-policy trust progression in
  [argocd-application-configuration](../../../[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-argo-ecosystem/skills/[argocd-application-configuration](../../Containers_and_Orchestration/[argocd](../../Containers_and_Orchestration/argocd/SKILL.md)-application-configuration/SKILL.md)/SKILL.md).
- Tag the image with the exact [commit](../../CI_CD/commit/SKILL.md) SHA the manifests-repo [commit](../../CI_CD/commit/SKILL.md)
  references, so the Git history of the config repo is a complete,
  traceable [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) trail of what's running where at any point in time.
- Run the container-image scan (post-push, on the actual digest) as a
  separate gate from the pre-push filesystem SCA scan — they catch
  different things (application dependencies vs. base-image OS packages).
- Keep the "update manifests" step's credential (a fine-grained PAT or
  deploy key scoped to one repo) rotated and audited exactly like any
  other CI secret, per
  [secrets-management](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[secrets-management](../secrets-management/SKILL.md)/SKILL.md).

## Common pitfalls

- **Symptom:** Someone adds a "quick fix" `[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) apply` step directly to
  the pipeline "just for this one hotfix," and it works — until the next
  regular [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) sync reverts the hotfix moments later because the config
  repo was never updated to match.
  **Fix:** This is exactly the sequencing failure this skill exists to
  prevent — any change to what's running must go through the manifests
  repo [commit](../../CI_CD/commit/SKILL.md) (Phase 5), even for an emergency fix; a direct `[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md)
  apply` against a `selfHeal: true` `Application` is reverted on the next
  reconciliation, per the drift-handling behavior in
  [gitops-workflow](../../../devops/skills/[gitops-workflow](../../Containers_and_Orchestration/[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-workflow/SKILL.md)/SKILL.md).

- **Symptom:** The pipeline reports green ("deploy succeeded") but the
  service in the cluster is still running the old version an hour later.
  **Fix:** "Pipeline green" here only means the manifests-repo [commit](../../CI_CD/commit/SKILL.md)
  landed — it says nothing about whether Argo CD/Flux actually
  reconciled it. Check `[argocd](../../Containers_and_Orchestration/argocd/SKILL.md) app get <app>` (or Flux's equivalent)
  separately; if it's `OutOfSync`/stuck, that's a [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md)-operator issue
  (see
  [argocd-application-configuration](../../../[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-argo-ecosystem/skills/[argocd-application-configuration](../../Containers_and_Orchestration/[argocd](../../Containers_and_Orchestration/argocd/SKILL.md)-application-configuration/SKILL.md)/SKILL.md)),
  not a pipeline bug.

- **Symptom:** Two different pipelines (the app's own CI, and a separate
  "promote to prod" job) both push commits to the same manifests-repo
  overlay, and their commits race, silently overwriting each other's image
  tag bump.
  **Fix:** Give exactly one pipeline stage ownership of writing to a given
  overlay path per environment, and have any "promotion" step read the
  currently-deployed staging tag and bump prod to that exact value rather
  than independently recomputing it — avoid two automated writers racing
  on the same file.

- **Symptom:** The SAST/SCA gates (Phase 3) are placed *after* the image
  build and push (Phase 4) "to save a rebuild if it fails," and a
  vulnerable image sits in the registry (and is briefly pullable) before
  the gate result comes back.
  **Fix:** Order gates before the push, not after — a failed post-push
  gate still leaves a bad image in the registry for however long it takes
  to notice and delete it; scanning the filesystem/dependencies before
  `[docker](../../Containers_and_Orchestration/docker/SKILL.md) build`/`push` (Phase 3 before Phase 4) means a failing gate
  never produces a pushed artifact at all.

## Worked example

**Scenario:** `payments-api`, a Node.js service, gets its first full
pipeline: PR-time SAST/SCA, main-branch image build/push to GHCR, and a
[GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) handoff bumping the staging overlay in `example/[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-config`.

`.[github](../../CI_CD/github/SKILL.md)/workflows/ci-cd.yml` (abbreviated to the phases above; full
Dockerfile/scan config lives in the linked skills):
```yaml
name: ci-cd
on:
  pull_request: { branches: [main] }
  push: { branches: [main] }

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: semgrep ci --config p/owasp-top-ten --baseline-[commit](../../CI_CD/commit/SKILL.md) "${{ [github](../../CI_CD/github/SKILL.md).event.pull_request.base.sha || [github](../../CI_CD/github/SKILL.md).event.before }}"

  sca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@0.24.0
        with: { scan-type: 'fs', severity: 'CRITICAL,HIGH', exit-code: '1' }

  build-and-push:
    needs: [sast, sca]
    if: [github](../../CI_CD/github/SKILL.md).event_name == 'push'
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: [docker](../../Containers_and_Orchestration/docker/SKILL.md)/login-action@v3
        with: { registry: ghcr.io, username: "${{ [github](../../CI_CD/github/SKILL.md).actor }}", password: "${{ secrets.GITHUB_TOKEN }}" }
      - uses: [docker](../../Containers_and_Orchestration/docker/SKILL.md)/build-push-action@v6
        with: { push: true, tags: "ghcr.io/example/payments-api:${{ [github](../../CI_CD/github/SKILL.md).sha }}" }

  update-manifests:
    needs: build-and-push
    if: [github](../../CI_CD/github/SKILL.md).event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { repository: example/[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-config, token: "${{ secrets.GITOPS_REPO_TOKEN }}" }
      - run: |
          cd apps/payments-api/overlays/staging
          [kustomize](../../Containers_and_Orchestration/kustomize/SKILL.md) edit set image payments-api=ghcr.io/example/payments-api:${{ [github](../../CI_CD/github/SKILL.md).sha }}
          git config user.name "ci-bot" && git config user.email "ci-bot@example.com"
          git [commit](../../CI_CD/commit/SKILL.md) -am "payments-api: bump to ${{ [github](../../CI_CD/github/SKILL.md).sha }}"
          git push
```
Argo CD's `payments-api-staging` `Application` (`automated: {prune: true,
selfHeal: true}` per
[argocd-application-configuration](../../../[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-argo-ecosystem/skills/[argocd-application-configuration](../../Containers_and_Orchestration/[argocd](../../Containers_and_Orchestration/argocd/SKILL.md)-application-configuration/SKILL.md)/SKILL.md))
picks up the new [commit](../../CI_CD/commit/SKILL.md) on its next poll and reconciles the cluster —
the CI pipeline itself never held a cluster credential at any point.

## Cross-references

- [container-build-and-release](../../../devops/skills/[container-build-and-release](../../Containers_and_Orchestration/container-build-and-release/SKILL.md)/SKILL.md) — Dockerfile/image-build mechanics used in Phase 2.
- [sast-integration](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[sast-integration](../../../Security/sast-integration/SKILL.md)/SKILL.md) and [software-composition-analysis-sca](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[software-composition-analysis-sca](../../../Software_Engineering_and_Other/Frontend/software-composition-analysis-sca/SKILL.md)/SKILL.md) — the Phase 3 scan mechanics.
- [github-actions-single-repo-workflows](../[github-actions-single-repo-workflows](../../CI_CD/[github-actions](../../CI_CD/[github](../../CI_CD/github/SKILL.md)-actions/SKILL.md)-single-repo-workflows/SKILL.md)/SKILL.md) and [jenkins-declarative-pipeline-per-repo](../[jenkins-declarative-pipeline-per-repo](../../CI_CD/[jenkins](../../CI_CD/jenkins/SKILL.md)-declarative-pipeline-per-repo/SKILL.md)/SKILL.md) — the concrete pipeline-authoring syntax this skill sequences.
- [gitops-workflow](../../../devops/skills/[gitops-workflow](../../Containers_and_Orchestration/[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-workflow/SKILL.md)/SKILL.md) — the [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) handoff concept Phase 5 implements.
- [argocd-application-configuration](../../../[gitops](../../Containers_and_Orchestration/gitops/SKILL.md)-argo-ecosystem/skills/[argocd-application-configuration](../../Containers_and_Orchestration/[argocd](../../Containers_and_Orchestration/argocd/SKILL.md)-application-configuration/SKILL.md)/SKILL.md) — the operator-side reconciliation that consumes this pipeline's manifests-repo [commit](../../CI_CD/commit/SKILL.md).
- [secure-cicd-gates](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[secure-cicd-gates](../../../Security/secure-cicd-gates/SKILL.md)/SKILL.md) — orchestrating the Phase 3 gates alongside other security checks without duplication.
- [complete-[cicd-pipeline](../../CI_CD/cicd-pipeline/SKILL.md)-deployment-for-[serverless](../../Containers_and_Orchestration/serverless/SKILL.md)-from-scratch](../[complete-[cicd-pipeline](../../CI_CD/cicd-pipeline/SKILL.md)-deployment-for-[serverless](../../Containers_and_Orchestration/serverless/SKILL.md)-from-scratch](../complete-[cicd-pipeline](../../CI_CD/cicd-pipeline/SKILL.md)-deployment-for-[serverless](../../Containers_and_Orchestration/serverless/SKILL.md)-from-scratch/SKILL.md)/SKILL.md) and [complete-[cicd-pipeline](../../CI_CD/cicd-pipeline/SKILL.md)-for-vm-based-workloads-from-scratch](../[complete-[cicd-pipeline](../../CI_CD/cicd-pipeline/SKILL.md)-for-vm-based-workloads-from-scratch](../../CI_CD/complete-[cicd-pipeline](../../CI_CD/cicd-pipeline/SKILL.md)-for-vm-based-workloads-from-scratch/SKILL.md)/SKILL.md) — the same source-to-deploy shape for a fundamentally different build artifact and deploy mechanism.
