---
name: gitops-workflow
description: >
  Designs and operates GitOps-based deployment workflows where Git is the
  single source of truth for desired state, reconciled into a cluster by
  an operator such as Argo CD or Flux. Use when the user asks to "set up
  GitOps," "use Argo CD / Flux," "manage Kubernetes deploys via Git,"
  "structure a GitOps repo," "sync/reconcile drift," or "roll back a
  deployment by reverting Git."
license: Apache-2.0
compatibility: "Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI"
metadata:
  domain: devops
  maturity: stable
---

# [GitOps](../gitops/SKILL.md) Workflow

## Purpose

[GitOps](../gitops/SKILL.md) replaces "push-based" deployment (a pipeline runs `[kubectl](../kubectl/SKILL.md) apply` or
`helm upgrade` against a cluster) with a "pull-based" model where a
reconciliation operator running inside the cluster continuously compares
live state against the desired state declared in a Git repository, and
converges toward it. This makes Git history the [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) log and rollback
mechanism for infrastructure and application state, eliminates
credential sprawl (CI no longer needs cluster-admin), and detects/corrects
configuration drift automatically. It matters operationally because it
turns "what's actually running in prod" from a question you answer by
`ssh`-ing in or querying the cluster into a question you answer by reading
Git.

## When to use

- Introducing [Kubernetes](../kubernetes/SKILL.md) deployment automation for a new cluster or
  migrating off imperative `[kubectl](../kubectl/SKILL.md) apply` / `helm upgrade` pipelines.
- Setting up Argo CD or Flux and deciding repo structure
  (app-of-apps, mono-repo vs. multi-repo, per-environment overlays).
- Diagnosing configuration drift (someone `[kubectl](../kubectl/SKILL.md) edit`'d a resource
  directly and it keeps getting reverted, or vice versa it silently stuck).
- Implementing rollback-by-revert instead of ad hoc rollback scripts.
- Deciding how secrets should be handled in a Git-as-source-of-truth model
  (they can't live in plaintext in the repo).

## Prerequisites & environment

- A running [Kubernetes](../kubernetes/SKILL.md) cluster (or clusters) and a [GitOps](../gitops/SKILL.md) operator
  installed: Argo CD ≥ 2.9 or Flux ≥ 2.x (Flux v1 is end-of-life and
  should not be used for new setups).
- A Git repository to act as the source of truth, separate in purpose
  (though it can be the same physical repo) from the application source
  repo — commonly called the "config repo" or "environments repo."
  Multi-repo (app repo + config repo) is the common pattern to keep
  application PRs from being polluted by generated manifests, and to keep
  deploy permissions scoped separately from source-code permissions.
- [Kustomize](../kustomize/SKILL.md) ≥ 5.0 or Helm ≥ 3.x for templating environment-specific values,
  since [GitOps](../gitops/SKILL.md) repos almost never hand-maintain a full manifest per
  environment.
- A secrets strategy decided before rollout: Sealed Secrets, SOPS, or an
  external secrets operator pulling from a [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) (AWS Secrets Manager,
  HashiCorp [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md), Azure Key [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)) — plaintext [Kubernetes](../kubernetes/SKILL.md) `Secret` objects
  must never be committed.
- Cluster-side RBAC scoping so the [GitOps](../gitops/SKILL.md) operator's service account has
  only the permissions it needs per namespace/environment, not blanket
  cluster-admin.

## Step-by-step guidance

1. **Choose repo topology.** For most teams: one app repo per service
   (source + Dockerfile + CI) and one (or a few, per business unit)
   environments/config repo containing [Kubernetes](../kubernetes/SKILL.md) manifests organized by
   environment. Example layout:
   ```
   [gitops](../gitops/SKILL.md)-config/
   ├── apps/
   │   └── payments-api/
   │       ├── base/
   │       │   ├── deployment.yaml
   │       │   ├── service.yaml
   │       │   └── kustomization.yaml
   │       └── overlays/
   │           ├── dev/kustomization.yaml
   │           ├── staging/kustomization.yaml
   │           └── prod/kustomization.yaml
   └── clusters/
       ├── dev/apps.yaml        # Argo CD Application / Flux Kustomization pointers
       ├── staging/apps.yaml
       └── prod/apps.yaml
   ```

2. **Define the desired state declaratively with an overlay per
   environment** ([Kustomize](../kustomize/SKILL.md) example):
   ```yaml
   # apps/payments-api/overlays/prod/kustomization.yaml
   resources:
     - ../../base
   images:
     - name: payments-api
       newName: ghcr.io/example/payments-api
       newTag: "1.4.2"
   patches:
     - path: replica-count.yaml
   ```

3. **Register the app with the operator.** Argo CD `Application` example:
   ```yaml
   apiVersion: argoproj.io/v1alpha1
   kind: Application
   metadata:
     name: payments-api-prod
     namespace: [argocd](../argocd/SKILL.md)
   spec:
     project: default
     source:
       repoURL: https://[github](../../CI_CD/github/SKILL.md).com/example/[gitops](../gitops/SKILL.md)-config.git
       targetRevision: main
       path: apps/payments-api/overlays/prod
     destination:
       server: https://[kubernetes](../kubernetes/SKILL.md).default.svc
       namespace: payments-prod
     syncPolicy:
       automated:
         prune: true
         selfHeal: true
       syncOptions:
         - CreateNamespace=true
   ```
   Flux equivalent uses a `GitRepository` + `Kustomization` CR pair
   pointing at the same overlay path.

4. **Decide sync policy per environment deliberately.** `automated` +
   `selfHeal: true` is appropriate for dev/staging (fast feedback, drift
   auto-corrected). For production, many teams require manual sync
   approval (`automated` disabled, or gated behind a promotion PR merge)
   so a bad manifest doesn't roll out unattended — pair this with
   [environment-promotion-strategy](../[environment-promotion-strategy](../../../Software_Engineering_and_Other/Frontend/environment-promotion-strategy/SKILL.md)/SKILL.md).

5. **Wire CI to update the config repo, not the cluster.** The
   application CI pipeline builds and pushes an image, then opens a PR (or
   commits, depending on trust level) against the config repo bumping
   `newTag` in the relevant overlay. The [GitOps](../gitops/SKILL.md) operator, not the CI
   pipeline, performs the actual cluster apply. This is the core inversion
   [GitOps](../gitops/SKILL.md) makes: CI produces artifacts and proposes state changes; the
   in-cluster operator is the only thing with apply credentials.

6. **Handle secrets out-of-band of plaintext Git.** With Sealed Secrets,
   encrypt with the cluster's public key before committing:
   ```bash
   kubeseal --format yaml < secret.yaml > sealed-secret.yaml
   git add sealed-secret.yaml   # safe to [commit](../../CI_CD/commit/SKILL.md); only the controller can decrypt
   ```
   With an External Secrets Operator, [commit](../../CI_CD/commit/SKILL.md) only a reference
   (`ExternalSecret` CR pointing at a [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) path), never the value.

7. **Roll back by reverting Git, not by manual cluster surgery.**
   ```bash
   git revert <bad-[commit](../../CI_CD/commit/SKILL.md)-sha>
   git push origin main
   ```
   The operator reconciles the cluster back to the prior state
   automatically. Verify with `[argocd](../argocd/SKILL.md) app get payments-api-prod` or
   `flux get kustomizations` that the sync completed and health is green.

8. **Monitor for drift and unhealthy sync state**, not just "did the PR
   merge." `[argocd](../argocd/SKILL.md) app diff <app>` / `flux diff kustomization` shows
   whether live state matches desired state; alert on `OutOfSync` or
   `Degraded` status persisting beyond a few reconciliation intervals.

## Best practices

- Keep the config repo's history linear and meaningful — each [commit](../../CI_CD/commit/SKILL.md)
  should represent one intentional desired-state change, since that
  history *is* your deployment [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) log and rollback mechanism.
- Use an "app-of-apps" (Argo CD) or a top-level `Kustomization` (Flux)
  pattern so bootstrapping a new cluster is "apply one root manifest,"
  not "manually register N applications."
- Scope the operator's cluster RBAC per environment/namespace rather than
  granting one global service account cluster-admin — a compromised
  config repo should not be able to affect every environment.
- Never let the pipeline both build the image *and* apply it directly to
  the cluster "for speed" — that reintroduces the push-based credential
  sprawl [GitOps](../gitops/SKILL.md) exists to remove.
- Pin `targetRevision` to a branch or, for stricter environments, a tag,
  so you know exactly what [commit](../../CI_CD/commit/SKILL.md)(s) the operator is watching.
- Treat `selfHeal`/auto-prune as powerful but sharp: `prune: true` will
  delete cluster resources whose manifest was removed from Git — make
  sure that's intended before enabling it broadly.

## Common pitfalls

- **Symptom:** Someone runs `[kubectl](../kubectl/SKILL.md) edit deployment` directly against a
  cluster with `selfHeal: true`, and their change is silently reverted a
  minute later with no explanation.
  **Fix:** This is [GitOps](../gitops/SKILL.md) working as designed — communicate the policy
  clearly (no direct `[kubectl](../kubectl/SKILL.md) edit`/`apply` in [GitOps](../gitops/SKILL.md)-managed namespaces)
  and make emergency changes via a fast-tracked Git [commit](../../CI_CD/commit/SKILL.md) instead, so the
  change survives reconciliation and is auditable.

- **Symptom:** Application repo commits update manifests directly, and now
  two sources of truth (app repo and config repo) disagree about what
  version is deployed.
  **Fix:** Keep manifest ownership single-sourced in the config repo;
  application CI should only push images and open a version-bump PR/[commit](../../CI_CD/commit/SKILL.md)
  against the config repo, never apply manifests itself.

- **Symptom:** A plaintext `Secret` YAML was committed to the [GitOps](../gitops/SKILL.md) repo
  before a secrets strategy was in place, and it's now in Git history even
  after deletion.
  **Fix:** Treat it as a leaked credential — rotate the underlying secret
  immediately; simply deleting the file does not remove it from history.
  Then adopt Sealed Secrets/SOPS/external-secrets before committing
  anything else sensitive, and consider history rewriting only as a
  last-resort cleanup (it invalidates all clones/forks).

- **Symptom:** Production sync is `OutOfSync` for days and nobody noticed
  until an [incident](../../Observability_and_SecOps/incident/SKILL.md).
  **Fix:** Alert on sync/health status directly from the operator
  (Argo CD notifications, Flux alerts to Slack/PagerDuty) rather than
  relying on someone periodically checking the UI.

## Worked example

**Scenario:** Promote `payments-api` version `1.4.2` from staging to
production using [GitOps](../gitops/SKILL.md), with production requiring manual sync approval.

1. CI on the app repo builds and pushes
   `ghcr.io/example/payments-api:1.4.2`, then opens a PR against
   `[gitops](../gitops/SKILL.md)-config` changing `apps/payments-api/overlays/staging/kustomization.yaml`'s
   `newTag` to `1.4.2`.
2. The PR merges; Argo CD (`automated: {prune: true, selfHeal: true}` on
   staging) reconciles staging to `1.4.2` within its poll interval.
3. After staging soak/verification, a second PR bumps
   `overlays/prod/kustomization.yaml`'s `newTag` to `1.4.2`.
4. Because prod's `Application` has `automated` sync disabled, the change
   sits `OutOfSync` until an operator runs
   `[argocd](../argocd/SKILL.md) app sync payments-api-prod` (or CI triggers it via
   `[argocd](../argocd/SKILL.md) app sync` in a manual-approval job) — giving a deliberate,
   auditable go/no-go moment before production actually changes.
5. If `1.4.2` misbehaves in prod, the fix is
   `git revert <prod-bump-[commit](../../CI_CD/commit/SKILL.md)> && git push`, followed by an
   (auto or manual) sync back to `1.4.1` — no bespoke rollback script
   needed.

## Cross-references

- [ci-cd-pipeline-design](../[ci-cd-pipeline-design](../../CI_CD/ci-cd-pipeline-design/SKILL.md)/SKILL.md)
- [environment-promotion-strategy](../[environment-promotion-strategy](../../../Software_Engineering_and_Other/Frontend/environment-promotion-strategy/SKILL.md)/SKILL.md)
- [infrastructure-as-code-terraform](../[infrastructure-as-code-terraform](../../Infrastructure_as_Code/[infrastructure-as-code](../../Infrastructure_as_Code/infrastructure-as-code/SKILL.md)-terraform/SKILL.md)/SKILL.md)
