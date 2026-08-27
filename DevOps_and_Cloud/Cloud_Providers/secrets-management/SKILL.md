---
name: secrets-management
description: >
  Guides eliminating hardcoded secrets from code and CI/CD, setting up a
  secrets manager (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault,
  SOPS+age/KMS for GitOps), rotating credentials, and adding
  secret-scanning to catch leaks. Use when the user asks to "remove
  hardcoded secrets", "set up Vault/Secrets Manager integration", "scan
  for leaked API keys", "rotate a compromised credential", "encrypt
  secrets for GitOps with SOPS", or "inject secrets into a Kubernetes
  pod/CI pipeline securely".
license: Apache-2.0
compatibility: "Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI"
metadata:
  domain: devsecops
  maturity: stable
---

# Secrets Management

## Purpose

Hardcoded credentials — API keys, database passwords, TLS private keys,
cloud IAM keys — committed to source control or baked into CI/CD
configuration are one of the most common and most consequential security
failures, because a leaked secret is immediately and directly exploitable
(no [reverse-engineering](../../../Security/reverse-engineering/SKILL.md) or chained exploit required), and git history
makes "delete the file" an incomplete fix. This skill covers three
related problems: preventing secrets from entering source control and CI
logs in the first place (scanning, pre-[commit](../../CI_CD/commit/SKILL.md) hooks), storing and
distributing secrets correctly at runtime (a dedicated secrets manager
rather than environment variables baked into images or config files), and
responding when a secret does leak (rotation, revocation, blast-radius
assessment).

## When to use

- The user asks to "remove hardcoded secrets" from a codebase or wants
  help auditing for them.
- A team wants to set up HashiCorp [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md), AWS Secrets Manager, Azure Key
  [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md), GCP Secret Manager, or a [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md)-friendly encrypted-secrets
  workflow (SOPS + age/KMS, Sealed Secrets) from scratch.
- The user wants secret-scanning added to CI/CD or pre-[commit](../../CI_CD/commit/SKILL.md) hooks
  (Gitleaks, TruffleHog, [GitHub](../../CI_CD/github/SKILL.md) secret scanning/push protection) to catch
  leaks before merge.
- A secret has leaked (committed to a public repo, printed in CI logs,
  exposed in an error message) and the user needs a rotation/response
  plan.
- The user wants to inject secrets into a [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) workload or CI job
  without writing them to disk in plaintext or exposing them in logs.
- The user is deciding between dynamic secrets (short-lived, generated
  on demand) and static secrets (long-lived, rotated on a schedule) for a
  given integration.

## Prerequisites & environment

- A secrets manager choice appropriate to the environment:
  - **HashiCorp [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)** (OSS or Enterprise) — most flexible, supports
    dynamic secrets (databases, cloud IAM), fine-grained policies, and
    multiple auth methods ([Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) service account, AWS IAM, OIDC);
    requires running/operating a [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) cluster (or using HCP [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)) —
    non-trivial operational overhead if self-hosted.
  - **AWS Secrets Manager / Azure Key [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) / GCP Secret Manager** —
    cloud-native, lower operational overhead if already on that cloud,
    integrates with IAM natively; less flexible across [multi-cloud](../multi-cloud/SKILL.md).
  - **SOPS** (Mozilla) + age or a cloud KMS — for encrypting secrets
    *at rest in git* for [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) workflows (e.g. secrets committed
    encrypted, decrypted at deploy time by Flux/[ArgoCD](../../Containers_and_Orchestration/argocd/SKILL.md) or a CI step).
  - **[Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) Sealed Secrets** (Bitnami) — cluster-scoped alternative
    to SOPS for [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md) secrets, encrypts against a controller-held key
    pair so only that cluster can decrypt.
- Secret-scanning tooling: **Gitleaks** or **TruffleHog** for CI/pre-[commit](../../CI_CD/commit/SKILL.md)
  scanning; [GitHub](../../CI_CD/github/SKILL.md) Advanced Security "secret scanning" and "push
  protection" if on [GitHub](../../CI_CD/github/SKILL.md) with the relevant license tier.
- CI/CD platform's native secret store ([GitHub](../../CI_CD/github/SKILL.md) Actions "Secrets",
  GitLab CI/CD variables marked "masked" and "protected", etc.) as the
  minimum viable baseline even before adopting a full secrets manager.
- IAM/permissions to create service identities ([Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) service
  accounts, cloud IAM roles) that the secrets manager will authenticate
  workloads against — secrets managers are only as strong as the
  authentication method used to reach them.

## Step-by-step guidance

1. **Add secret-scanning first**, before anything else, so you stop the
   bleeding while you build out proper management:
   ```yaml
   # [GitHub](../../CI_CD/github/SKILL.md) Actions - Gitleaks
   name: secret-scan
   on: [push, pull_request]
   jobs:
     gitleaks:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 0
         - uses: gitleaks/gitleaks-action@v2
           env:
             GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
   ```
   Add a matching pre-[commit](../../CI_CD/commit/SKILL.md) hook so leaks are caught before they're even
   pushed:
   ```yaml
   # .pre-[commit](../../CI_CD/commit/SKILL.md)-config.yaml
   repos:
     - repo: https://[github](../../CI_CD/github/SKILL.md).com/gitleaks/gitleaks
       rev: v8.18.4
       hooks:
         - id: gitleaks
   ```

2. **Inventory existing hardcoded secrets** found by the scan, and for
   each one: rotate/revoke it at the source system first (assume it's
   compromised the moment it was committed, even to a private repo —
   git history persists), *then* remove it from code, and only then
   consider the finding resolved. Removing the file without rotating the
   credential leaves the leaked value valid forever in history.

3. **Stand up the secrets manager.** [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) example — enable a KV v2
   secrets engine and a policy scoped to least privilege:
   ```bash
   [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets enable -path=myapp kv-v2
   [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) kv put myapp/prod/db username="svc-myapp" password="<generated>"
   ```
   ```hcl
   # policy: myapp-prod-read.hcl
   path "myapp/data/prod/*" {
     capabilities = ["read"]
   }
   ```

4. **Authenticate workloads, not humans, to fetch secrets at runtime.**
   [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) example using [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)'s [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) auth method with the [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)
   Agent Injector (annotations on a pod spec):
   ```yaml
   metadata:
     annotations:
       [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).hashicorp.com/agent-inject: "true"
       [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).hashicorp.com/role: "myapp-prod"
       [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).hashicorp.com/agent-inject-secret-db-creds: "myapp/data/prod/db"
   ```
   This avoids ever writing the secret into a [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) Secret object,
   environment variable dump, or CI log — the sidecar fetches it directly
   into a file the app reads at startup.

5. **For [GitOps](../../Containers_and_Orchestration/gitops/SKILL.md), encrypt secrets at rest with SOPS** rather than
   committing plaintext or relying on cluster RBAC alone:
   ```yaml
   # .sops.yaml
   creation_rules:
     - path_regex: secrets/.*\.yaml$
       kms: arn:aws:kms:us-east-1:<AWS_ACCOUNT_ID>:key/<KMS_KEY_ID>
   ```
   ```bash
   sops --encrypt --in-place secrets/prod-db.yaml
   git add secrets/prod-db.yaml   # ciphertext only — safe to [commit](../../CI_CD/commit/SKILL.md)
   ```

6. **Prefer dynamic, short-lived secrets over long-lived static ones**
   where the backing system supports it ([Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)'s database secrets engine
   generates a unique DB credential per lease with automatic expiry,
   versus a single shared password rotated manually every 90 days).

7. **Set a rotation policy and automate it** for anything that must
   remain static (API keys for third-party SaaS without dynamic-secret
   support): document an owner, a rotation interval, and an automated
   or scripted rotation procedure — not a calendar reminder to do it
   manually.

8. **Mask secrets in CI logs explicitly** even when using a secrets
   manager — a script that echoes a fetched secret for debugging, or a
   stack trace that includes a connection string, leaks it just as
   badly as a hardcoded value.

## Best practices

- Rotate first, remove second: a leaked secret is compromised the moment
  it's committed, regardless of repo visibility; deleting it from the
  latest [commit](../../CI_CD/commit/SKILL.md) does nothing to git history without a separate
  history-rewrite (`git filter-repo` / BFG), and even that doesn't help
  once it's been cloned or indexed.
- Prefer dynamic/short-lived secrets (database credentials issued
  per-session, cloud STS tokens) over long-lived static ones wherever the
  backend supports it — a leaked short-lived credential has a small blast
  radius by construction.
- Scope access with least privilege per environment/workload identity,
  not one shared "CI" or "prod" credential used everywhere — a [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)
  policy or IAM role per service limits blast radius if one workload is
  compromised.
- Never pass secrets as CLI arguments or build args — they end up in
  shell history, process lists (`ps aux`), and (for [Docker](../../Containers_and_Orchestration/docker/SKILL.md) build args)
  potentially cached image layers. Use environment variables sourced from
  a secrets manager, files mounted at runtime, or BuildKit secret mounts
  (`--mount=type=secret`) instead.
- Mask and [audit](../../../AI_and_Agents/Operations/audit/SKILL.md): configure CI to mask known secret patterns in logs, and
  enable [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging on the secrets manager ([Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) devices, cloud
  CloudTrail/Activity Log) so every secret access is traceable.
- Combine secret-scanning at [commit](../../CI_CD/commit/SKILL.md) time (prevent), a secrets manager at
  runtime (contain), and a rotation policy (recover) — each addresses a
  different failure mode and none alone is sufficient.

## Common pitfalls

- **Symptom:** A secret was committed, the [commit](../../CI_CD/commit/SKILL.md) was reverted/force-pushed
  away, and the team considers the [incident](../../Observability_and_SecOps/incident/SKILL.md) closed.
  **Fix:** Treat the credential as permanently compromised regardless of
  history rewriting — rotate/revoke it at the source system. History
  rewriting only helps prevent *future* discovery; it does not undo
  exposure to anyone who already cloned, forked, or indexed the repo
  (including any CI system or bot that pulled it in the interim).

- **Symptom:** Secrets are stored in a secrets manager, but a debug log
  statement or an unhandled exception prints the full config object,
  leaking the secret into application logs anyway.
  **Fix:** Redact known secret fields in logging middleware/formatters at
  the framework level (structured logging with an explicit denylist of
  field names) rather than relying on developers to remember not to log
  the config object.

- **Symptom:** A [Docker](../../Containers_and_Orchestration/docker/SKILL.md) image built with `--build-arg DB_PASSWORD=...`
  works fine, but the password is later found inside an intermediate
  layer via `[docker](../../Containers_and_Orchestration/docker/SKILL.md) history` even after the final stage doesn't reference
  it.
  **Fix:** Use BuildKit secret mounts (`RUN --mount=type=secret,id=dbpass`)
  which never persist the value in any image layer, instead of build
  args, for any credential needed only during the build.

- **Symptom:** [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) (or another secrets manager) is deployed, but every
  service shares one broad "read everything" policy/token because
  writing per-service policies felt slow.
  **Fix:** Invest in per-service/per-environment policies up front —
  retrofitting least privilege after a broad token is already
  distributed to a dozen services is far more disruptive than doing it
  at rollout time.

- **Symptom:** A rotated database password breaks the application because
  it was cached in a connection pool or a long-lived environment variable
  that isn't reloaded until restart.
  **Fix:** Design rotation to be observed by the app at runtime (short
  connection pool max-lifetime, a sidecar that re-renders config and
  signals a reload, or dynamic secrets with lease renewal) rather than
  assuming rotation alone is sufficient without an app-side refresh path.

## Worked example

A team finds a hardcoded AWS access key in `config/settings.py` via a
newly-added Gitleaks scan, and migrates the service to [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-issued
dynamic AWS credentials.

Gitleaks finding:
```
Finding:     <AWS_ACCESS_KEY_ID>
Secret:      <REDACTED_EXAMPLE_NOT_A_REAL_KEY>
RuleID:      aws-access-token
File:        config/settings.py
Line:        14
[Commit](../../CI_CD/commit/SKILL.md):      3f9a21c
```

Response, in order:
1. Deactivate the leaked IAM access key immediately in the AWS console/CLI
   (`aws iam update-access-key --access-key-id <KEY_ID> --status Inactive`),
   then delete it once confirmed unused.
2. Remove the hardcoded key from `config/settings.py` and replace with a
   [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-issued dynamic credential:
   ```bash
   [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets enable -path=aws aws
   [vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write aws/roles/myapp-prod \
     credential_type=iam_user \
     policy_document=@myapp-prod-policy.json
   ```
   ```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
   # settings.py — fetch a short-lived credential at startup instead of
   # embedding one
   import hvac
   client = hvac.Client(url=os.environ["VAULT_ADDR"])
   creds = client.secrets.aws.generate_credentials(name="myapp-prod")
   ```
3. Add the Gitleaks CI job and pre-[commit](../../CI_CD/commit/SKILL.md) hook (shown above) so the same
   class of leak is caught before merge going forward.
4. Rewrite git history to remove the literal string from old commits
   (`git filter-repo --path config/settings.py --invert-paths` or a
   targeted BFG run) as defense-in-depth — understanding this does not
   undo the exposure, only limits future discovery.

## Cross-references

- [secure-cicd-gates](../[secure-cicd-gates](../../../Security/secure-cicd-gates/SKILL.md)/SKILL.md) — where
  secret-scanning fits among other pipeline security gates, and how to
  avoid it becoming redundant with SAST secret-detection rules.
- [policy-as-code-guardrails](../[policy-as-code-guardrails](../../../Security/[policy-as-code](../../../Security/policy-as-code/SKILL.md)-guardrails/SKILL.md)/SKILL.md) —
  enforcing "no plaintext secrets in manifests/IaC" as an automated
  policy rather than a manual review checklist item.
