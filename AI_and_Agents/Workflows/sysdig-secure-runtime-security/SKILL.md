---
name: sysdig-secure-runtime-security
description: >
  Guides deep, tool-specific use of Sysdig Secure for runtime threat detection
  built on Falco rules under the hood, container/host image scanning, compliance
  checks (CIS Benchmarks), and the incident response workflow from a runtime
  alert through forensic capture. Use when the user asks to "write a
  Falco/Sysdig runtime rule", "investigate a Sysdig Secure runtime alert", "scan
  images with Sysdig", "run a CIS Benchmark compliance check with Sysdig", "tune
  noisy Falco rules in Sysdig", or "set up drift/anomaly detection for
  containers". Sysdig and Falco-rule-syntax specific depth; cross-references
  container image hardening for reducing what runtime detection has to catch in
  the first place.
license: Apache-2.0
compatibility: Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI
metadata:
  domain: security-scanning-tooling
  maturity: stable
tags:
  - workflows
  - sysdig-secure-runtime-security
depends_on: []
---

# Sysdig Secure Runtime Security

## Purpose

Sysdig Secure is a runtime security platform whose detection engine is
built on **Falco**, the open-source CNCF runtime security project
originated by Sysdig — Falco rules match system-call and [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)
[audit](../../Operations/audit/SKILL.md)-log events against a rule syntax describing suspicious behavior
(unexpected process execution inside a container, a shell spawned in a
production pod, an outbound connection from a process that should never
make one), and Sysdig Secure wraps that detection engine with a managed
rule feed, a UI/[alerting](../../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md) layer, image scanning, CIS Benchmark compliance
checks, and an [incident-response](../../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md) workflow including forensic capture.
The operational distinction that matters most: everything upstream of
this skill (SAST, SCA, CSPM, IaC scanning) evaluates *code or
configuration* before or independent of execution; Sysdig evaluates
*actual behavior of a running system*, which is the only layer that can
catch a zero-day exploit of an unpatched vulnerability, a supply-chain
compromise in a dependency that passed every prior scan, or
living-off-the-land techniques that don't correspond to any known CVE
or misconfiguration at all.

## When to use

- The user asks to "write a Falco/Sysdig runtime rule" for a specific
  suspicious behavior (shell in container, unexpected outbound
  connection, sensitive file read/write, privilege escalation attempt).
- The user is investigating a Sysdig Secure runtime alert and needs to
  work through the [incident-response](../../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md) workflow (triage, forensic
  capture, containment).
- The user wants image scanning results (base OS + application layer
  vulnerabilities) integrated alongside runtime detection in one
  platform, rather than a separate scanner.
- The user wants to run CIS Benchmark compliance checks ([Docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md),
  [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md), cloud provider benchmarks) against hosts/clusters.
- The user's Sysdig/Falco rules are too noisy (excessive alerts on
  benign, expected application behavior) and need tuning via exceptions
  or rule condition refinement.
- The user wants to understand drift/anomaly detection — flagging a
  running container whose process tree or file set has changed from
  its scanned image baseline.

## Prerequisites & environment

- A Sysdig Secure account/tenant (SaaS or self-hosted) and the Sysdig
  agent deployed to the target hosts/clusters — for [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md), this is
  typically a DaemonSet plus optionally node-level kernel
  instrumentation (an eBPF probe is the current default collection
  method on supported kernels, superseding the older kernel-module
  driver on most modern deployments).
- [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) cluster admin access to deploy the Sysdig agent Helm
  chart/DaemonSet, and — for the [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) [audit](../../Operations/audit/SKILL.md)-log-based detections
  — API server [audit](../../Operations/audit/SKILL.md) logging enabled and forwarded to the agent.
- Familiarity with Falco rule syntax (YAML-based rule definitions with
  `condition`, `output`, and `priority` fields) — Sysdig Secure ships a
  large managed default ruleset plus the ability to add custom rules in
  the same syntax.
- Registry/CI access for image scanning integration (Sysdig CLI
  scanner, `sysdig-cli-scanner`, or the Sysdig Secure [GitHub](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md)
  Action/[Jenkins](../../../DevOps_and_Cloud/CI_CD/jenkins/SKILL.md) plugin) with a Sysdig API token stored as a CI secret.
  See [secrets-management](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[secrets-management](../../../DevOps_and_Cloud/Cloud_Providers/secrets-management/SKILL.md)/SKILL.md).
- A defined [incident-response](../../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md) escalation path (on-call rotation,
  ticketing/paging integration) before enabling high-severity runtime
  [alerting](../../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md) — an unactioned runtime alert is strictly worse than no
  alert at all, since it creates false confidence that "someone is
  watching."

## Step-by-step guidance

1. **Deploy the Sysdig agent to the cluster**, typically via the
   official Helm chart:
   ```bash
   helm repo add sysdig https://charts.sysdig.com
   helm install sysdig-agent sysdig/sysdig-deploy \
     --namespace sysdig-agent --create-namespace \
     --set global.sysdig.accessKey="${SYSDIG_ACCESS_KEY}" \
     --set global.clusterConfig.name="prod-cluster-1"
   ```

2. **Write custom Falco-syntax runtime rules** for behavior specific to
   the environment, layered on top of Sysdig's managed default set:
   ```yaml
   # Detect a shell spawned inside a production namespace container —
   # rarely legitimate outside of interactive debugging.
   - rule: Shell Spawned in Production Container
     desc: Detects an interactive shell process started inside a container
           running in a namespace tagged "production".
     condition: >
       spawned_process
       and container
       and proc.name in (bash, sh, zsh, dash)
       and k8s.ns.name = "production"
       and not proc.pname in (entrypoint.sh, [docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-entrypoint.sh)
     output: >
       Shell spawned in production container
       (user=%user.name container=%container.name image=%container.image.repository
       command=%proc.cmdline k8s.ns=%k8s.ns.name k8s.pod=%k8s.pod.name)
     priority: WARNING
     tags: [container, shell, mitre_execution]
   ```

3. **Scope alert routing by priority and namespace/tag**, not a single
   firehose channel — route CRITICAL findings in production namespaces
   to a paging integration, and lower-priority or non-prod findings to
   a dashboard/ticket queue reviewed on a normal cadence.

4. **Add image scanning to CI**, so vulnerabilities are caught before
   deploy, not only observed as runtime behavior after the fact:
   ```yaml
   # [GitHub](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Actions
   - name: Sysdig image scan
     uses: sysdiglabs/scan-action@v5
     with:
       image-tag: 'myorg/myapp:${{ [github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md).sha }}'
       sysdig-secure-token: ${{ secrets.SYSDIG_SECURE_TOKEN }}
       stop-on-failed-policy-eval: true
   ```

5. **Run CIS Benchmark compliance checks** against hosts/clusters on a
   schedule, not only at initial setup:
   ```bash
   sysdig-cli-scanner --compliance cis-[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-benchmark --host <[docker](../../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)-host>
   ```
   Sample finding:
   ```
   [WARN] 5.9  Ensure [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) secrets are not mounted as environment variables
     Pod: payments-api-7d9f  Namespace: production
   ```

6. **Enable drift/anomaly detection** to flag a running container whose
   process tree, open files, or binaries diverge from its scanned image
   baseline — this catches both malicious tampering and unexpected
   runtime installs (e.g. a container image being `apt-get install`'d
   into at runtime, a common anti-pattern that also widens attack
   surface).

7. **On a triggered alert, follow the [incident-response](../../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md) workflow**:
   - Triage the alert's priority, MITRE ATT&CK tag, and affected
     workload/namespace criticality.
   - Use Sysdig's activity/forensic capture (a rolling system-call
     capture triggered by the alert, or a manually-triggered capture)
     to get a point-in-time record of process, network, and file
     activity around the event for offline analysis — this is
     materially more actionable than the alert's single-line summary
     alone.
   - Contain: isolate or kill the affected pod/container (via
     [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) network policy, or `[kubectl](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubectl/SKILL.md) delete pod` on the specific
     affected pod — **not** a blanket `[kubectl](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubectl/SKILL.md) delete namespace` or
     similar broad action) while preserving the forensic capture and
     any relevant logs first.
   - Determine root cause (which CVE, which misconfiguration, which
     supply-chain vector let this happen) and feed it back into the
     upstream scanning layer it should have been caught by, if any
     (image scan policy, IaC scan rule, SAST/SCA finding).

8. **Tune noisy rules with scoped exceptions**, not blanket
   rule-disabling — Falco/Sysdig rules support exception lists scoped
   by field (e.g. exempt a specific known-legitimate process name or
   image), which preserves detection for everything else the rule
   covers:
   ```yaml
   - rule: Shell Spawned in Production Container
     exceptions:
       - name: known_debug_sidecar
         fields: [container.image.repository]
         comps: [in]
         values:
           - [["myorg/debug-sidecar"]]
   ```

## Best practices

- Treat Falco-rule tuning as an ongoing discipline, not a one-time
  setup step — a rule that's too broad on day one (e.g. flagging every
  shell spawn cluster-wide) will be muted or ignored within days if not
  scoped and tuned; a rule that's too narrow silently misses real
  incidents.
- Route alerts by actual criticality (namespace/workload tags,
  priority, MITRE tag) to differentiated channels — a single Slack
  channel receiving every WARNING-and-above alert from a large cluster
  trains responders to ignore it.
- Reduce what runtime detection has to catch in the first place by
  hardening images and enforcing non-root/read-only/dropped-capability
  pod settings — see
  [container-image-hardening](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[container-image-hardening](../../../DevOps_and_Cloud/Containers_and_Orchestration/container-image-hardening/SKILL.md)/SKILL.md);
  a hardened, distroless, non-root container gives an attacker far less
  room to trigger the kind of process/file-system behavior runtime
  rules look for in the first place.
- Pre-define an [incident-response](../../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md) [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) (who's paged, what
  containment actions are pre-approved, how forensic captures are
  stored/retained) before the first real high-severity alert fires —
  improvising containment during a live [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) is where blanket,
  destructive actions get taken under pressure.
- Run CIS Benchmark and [image-scanning](../../../Security/image-scanning/SKILL.md) checks on a recurring schedule,
  not only once at rollout — configuration drift and newly disclosed
  CVEs make yesterday's clean compliance/scan report stale quickly.
- Treat runtime detection as the last layer of defense, not the primary
  control — it fires only once something is already executing; pair it
  with [prisma-cloud-cspm-and-workload-protection](../[prisma-cloud-cspm-and-workload-protection](../../../DevOps_and_Cloud/Cloud_Providers/prisma-cloud-cspm-and-workload-protection/SKILL.md)/SKILL.md)-style
  posture management and
  [trivy-vulnerability-scanning](../[trivy-vulnerability-scanning](../../../Security/trivy-[vulnerability-scanning](../../../DevOps_and_Cloud/Observability_and_SecOps/vulnerability-scanning/SKILL.md)/SKILL.md)/SKILL.md)
  for pre-deploy image/IaC scanning so most issues are caught long
  before they ever reach a running workload.

## Common pitfalls

- **Symptom:** The team disables the "Shell Spawned in Container" rule
  entirely within the first week because it fires constantly on
  legitimate `[kubectl](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubectl/SKILL.md) exec` debugging sessions.
  **Fix:** Scope the rule with a namespace/tag condition (e.g. only
  fire in namespaces tagged `production`, or exclude known debug
  sidecar images via a scoped exception, step 8) instead of disabling
  the rule outright — the rule is catching a genuinely useful signal in
  production even if it's noisy in dev/staging where interactive
  debugging is routine.

- **Symptom:** A real [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) is missed because the alert fired at
  INFO/NOTICE priority into a dashboard nobody actively monitors, while
  the on-call rotation only gets paged on CRITICAL.
  **Fix:** Review priority mapping against actual response capability —
  if a rule represents a genuinely actionable signal (e.g. a known
  privilege-escalation technique), its priority and routing should
  reflect that regardless of Falco's default priority level; don't
  assume default priorities are already calibrated to your
  environment's risk tolerance.

- **Symptom:** During a live [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md), the responder runs `[kubectl](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubectl/SKILL.md)
  delete pod` on every pod in the namespace to "be safe," destroying
  forensic evidence and disrupting unrelated healthy workloads.
  **Fix:** Isolate/contain the *specific* affected pod/container
  (targeted deletion, or better, a network policy that cuts its
  connectivity while leaving it running for forensic capture) rather
  than a blanket namespace-wide action; capture forensic data (step 7)
  before destroying the affected workload, and never run a broad
  destructive command as a first response reflex.

- **Symptom:** Image scanning in CI shows clean, but a runtime alert
  later fires for a vulnerability that should have been caught pre-deploy.
  **Fix:** Check whether the running image actually matches what was
  scanned — a `:latest` tag or a mutable tag re-pushed after the scan
  ran means the deployed artifact may differ from the scanned one;
  scan and deploy the same immutable, digest-referenced image (see
  [container-image-hardening](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[container-image-hardening](../../../DevOps_and_Cloud/Containers_and_Orchestration/container-image-hardening/SKILL.md)/SKILL.md)
  on digest pinning) so "scanned" and "running" are guaranteed to be
  identical.

- **Symptom:** CIS Benchmark compliance checks report the same finding
  every quarter with no progress, and the report becomes a
  check-the-box exercise nobody acts on.
  **Fix:** Assign an owning team and a remediation SLA per finding
  category (the same discipline as vulnerability management), and
  track trend/closure rate rather than re-running the same scan and
  filing the same unaddressed report each cycle.

## Worked example

A platform team deploys Sysdig Secure to a production EKS cluster,
adds a custom rule for their specific threat model, and walks through
an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) it catches.

Helm values (`sysdig-values.yaml`, abbreviated):
```yaml
global:
  sysdig:
    accessKey: "${SYSDIG_ACCESS_KEY}"
  clusterConfig:
    name: "prod-eks-1"
nodeAnalyzer:
  secure:
    vulnerabilityManagement:
      enabled: true
```

Custom rule detecting unexpected outbound connections from a payments
service that should only ever talk to its known database and internal
API dependencies:
```yaml
- rule: Unexpected Outbound Connection from Payments Service
  desc: Payments service pods should only connect to known internal
        endpoints; any other outbound connection is suspicious.
  condition: >
    outbound
    and container
    and k8s.pod.label.app = "payments-api"
    and not fd.sip in (known_payments_dependency_ips)
  output: >
    Unexpected outbound connection from payments-api
    (pod=%k8s.pod.name dest_ip=%fd.sip dest_port=%fd.sport proc=%proc.cmdline)
  priority: CRITICAL
  tags: [network, payments, mitre_exfiltration]
```

[Incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) walkthrough:
1. The rule fires CRITICAL: a `payments-api` pod opens a connection to
   an IP outside the known-dependency list, at 02:14 UTC.
2. The alert pages the on-call engineer via the configured
   CRITICAL-priority integration.
3. The engineer triggers a Sysdig forensic capture on the affected pod
   and reviews the process tree: a child process not present in the
   original container image spawned the connection — indicating either
   a compromised dependency or in-container tampering.
4. Containment: a [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) NetworkPolicy is applied to isolate the
   specific pod's egress while preserving it (not deleted) for further
   forensic review; the workload is failed over to healthy replicas.
5. Root cause: image scanning (Sysdig CLI scanner in CI) is found to
   have been scanning an older cached image tag rather than the
   actually-deployed digest — the fix is enforcing digest-pinned
   deploys so "scanned" and "running" images are guaranteed identical
   going forward.

## Cross-references

- [container-image-hardening](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[container-image-hardening](../../../DevOps_and_Cloud/Containers_and_Orchestration/container-image-hardening/SKILL.md)/SKILL.md) —
  reducing attack surface (non-root, read-only, dropped capabilities,
  digest-pinned images) so there is less for runtime detection to catch
  and less an attacker can do once inside.
- [trivy-vulnerability-scanning](../[trivy-vulnerability-scanning](../../../Security/trivy-[vulnerability-scanning](../../../DevOps_and_Cloud/Observability_and_SecOps/vulnerability-scanning/SKILL.md)/SKILL.md)/SKILL.md) —
  pre-deploy image/IaC vulnerability scanning that should catch most
  known-CVE issues before they ever reach a running workload Sysdig
  monitors.
- [prisma-cloud-cspm-and-workload-protection](../[prisma-cloud-cspm-and-workload-protection](../../../DevOps_and_Cloud/Cloud_Providers/prisma-cloud-cspm-and-workload-protection/SKILL.md)/SKILL.md) —
  a comparable CNAPP with its own agent-based workload protection
  (Defender) and CSPM posture layer, worth understanding as an
  alternative or complementary platform to Sysdig Secure.
- [secrets-management](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[secrets-management](../../../DevOps_and_Cloud/Cloud_Providers/secrets-management/SKILL.md)/SKILL.md) —
  storing the Sysdig API/access tokens used for CI [image-scanning](../../../Security/image-scanning/SKILL.md)
  integration and agent enrollment.
