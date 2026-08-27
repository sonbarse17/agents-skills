---
name: container-runtime-docker-containerd
description: >
  Guides choosing and configuring the container RUNTIME engine — Docker
  Engine vs. containerd vs. CRI-O — including rootless mode, runtime
  (runc/crun/gVisor/Kata) configuration, and migration considerations
  for clusters moving off dockershim. This is about the runtime that
  executes containers, not building/tagging images. Use when a user
  asks to "choose a container runtime for Kubernetes nodes," "configure
  containerd," "run containers rootless," "migrate off Docker/dockershim,"
  "add a sandboxed/gVisor runtime class," or "debug a CRI-level
  container start failure."
license: Apache-2.0
compatibility: "Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI"
metadata:
  domain: kubernetes-platform
  maturity: stable
---

# Container Runtime: [Docker](../docker/SKILL.md) Engine, containerd, CRI-O

## Purpose

The container runtime is the layer that actually creates namespaces,
cgroups, and processes for a container — it sits below the image build
process entirely and below [Kubernetes](../kubernetes/SKILL.md)'s own scheduling logic. Since
[Kubernetes](../kubernetes/SKILL.md) 1.24 removed dockershim, every node runs a CRI-compliant
runtime directly (containerd or CRI-O), and [Docker](../docker/SKILL.md) Engine itself is no
longer a supported *node* runtime for new clusters, though it remains
extremely relevant as a local development and image-build tool. Getting
runtime configuration wrong — rootful-by-default containers, a
misconfigured cgroup driver mismatching kubelet's, no sandboxing for
untrusted workloads — produces either broken node bootstrap or a real
container-escape risk. This skill covers the runtime engine layer;
building and tagging images is a separate concern (see
[container-build-and-release](../../../devops/skills/[container-build-and-release](../container-build-and-release/SKILL.md)/SKILL.md)).

## When to use

- Choosing the CRI runtime for new [Kubernetes](../kubernetes/SKILL.md) nodes (containerd vs.
  CRI-O) post-dockershim.
- Migrating an existing cluster off [Docker](../docker/SKILL.md) Engine/dockershim to a
  CRI-native runtime.
- Configuring containerd (`config.toml`) — registry mirrors, cgroup
  driver, pull-through cache, private registry auth.
- Running containers rootless (no root-owned daemon, unprivileged user
  namespaces) for reduced host attack surface.
- Adding a sandboxed runtime class (gVisor, Kata Containers) for
  untrusted or multi-tenant workloads that need stronger isolation than
  standard `runc`.
- Debugging a container that fails to start with a CRI/runtime-level
  error rather than an application error (`OCI runtime create failed`,
  cgroup driver mismatch, missing seccomp profile).

## Prerequisites & environment

- containerd ≥ 1.7 (bundled with most current [Kubernetes](../kubernetes/SKILL.md) node images) or
  CRI-O matched exactly to the [Kubernetes](../kubernetes/SKILL.md) minor version being run —
  CRI-O version-locks to [Kubernetes](../kubernetes/SKILL.md) (CRI-O 1.30.x targets [Kubernetes](../kubernetes/SKILL.md)
  1.30) and does not support mixing minor versions the way containerd's
  versioning is decoupled from [Kubernetes](../kubernetes/SKILL.md) releases.
- `crictl` (the CRI-level equivalent of `[docker](../docker/SKILL.md)`/`nerdctl` CLI) for
  debugging directly against whatever CRI runtime is in use, configured
  via `/etc/crictl.yaml` pointing at the correct runtime socket.
- Root/sudo on nodes to edit runtime configuration
  (`/etc/containerd/config.toml`, `/etc/crio/crio.conf.d/`) and restart
  the runtime service — this is a node-level, not workload-level,
  change and typically requires a node drain/cordon for a live cluster.
- Confirm the kubelet's configured `cgroupDriver` (`systemd` is the
  current recommended default) matches the runtime's own cgroup driver
  setting exactly — a mismatch is one of the most common node
  bootstrap failures.
- [Docker](../docker/SKILL.md) Engine itself, if used at all in this context, is for local
  development/CI image builds (`[docker](../docker/SKILL.md) build`), not as the [Kubernetes](../kubernetes/SKILL.md)
  node runtime — see
  [container-build-and-release](../../../devops/skills/[container-build-and-release](../container-build-and-release/SKILL.md)/SKILL.md)
  for that usage.

## Step-by-step guidance

1. **Choose containerd vs. CRI-O deliberately**:
   - **containerd**: the most widely used CRI runtime, backs [Docker](../docker/SKILL.md)
     Engine itself under the hood, has the broadest ecosystem/tooling
     support (`nerdctl` for a [Docker](../docker/SKILL.md)-CLI-like local experience), and is
     the default on most managed [Kubernetes](../kubernetes/SKILL.md) node images (EKS, GKE, AKS
     all ship containerd-based nodes).
   - **CRI-O**: purpose-built for [Kubernetes](../kubernetes/SKILL.md) only (no independent
     daemon use case outside a CRI context), version-locked to the
     [Kubernetes](../kubernetes/SKILL.md) release, and the default on [OpenShift](../openshift/SKILL.md)/ROSA nodes — see
     [openshift-and-rosa-platform](../[openshift-and-rosa-platform](../[openshift](../openshift/SKILL.md)-and-rosa-platform/SKILL.md)/SKILL.md).
   For a self-managed cluster with no [OpenShift](../openshift/SKILL.md)/Red Hat requirement,
   containerd is the more broadly supported default; choose CRI-O
   primarily when the platform ([OpenShift](../openshift/SKILL.md)) mandates it or the team
   specifically wants its tighter [Kubernetes](../kubernetes/SKILL.md)-only scope.

2. **Confirm and align the cgroup driver** before/during node bootstrap
   — this is the single most common "node won't join" failure:
   ```toml
   # /etc/containerd/config.toml
   [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
     SystemdCgroup = true
   ```
   ```yaml
   # kubelet config must match
   cgroupDriver: systemd
   ```

3. **Configure a registry mirror/pull-through cache** to reduce
   external registry dependency and rate-limit exposure:
   ```toml
   # /etc/containerd/config.toml
   [plugins."io.containerd.grpc.v1.cri".registry.mirrors."[docker](../docker/SKILL.md).io"]
     endpoint = ["https://mirror.internal.example.com", "https://registry-1.[docker](../docker/SKILL.md).io"]
   ```
   ```bash
   sudo systemctl restart containerd
   ```

4. **Configure private registry authentication** without embedding
   credentials in the config file directly where avoidable — use a
   credential helper or a separately-permissioned config path:
   ```toml
   [plugins."io.containerd.grpc.v1.cri".registry.configs."registry.internal.example.com".auth]
     auth = "${REGISTRY_AUTH_BASE64}"
   ```
   Prefer [Kubernetes](../kubernetes/SKILL.md)-native `imagePullSecrets` at the workload level for
   per-namespace registry credentials over node-wide containerd auth
   config wherever the credential scope should be workload-specific
   rather than node-wide.

5. **Debug directly at the CRI level** when a pod fails to start but
   `[kubectl](../kubectl/SKILL.md) describe pod` doesn't give enough detail:
   ```bash
   sudo crictl ps -a
   sudo crictl logs <container-id>
   sudo crictl inspect <container-id>
   ```
   This bypasses kubelet's abstraction and shows exactly what the
   runtime attempted and why it failed (missing image, OCI spec
   error, seccomp/AppArmor profile rejection).

6. **Run rootless containers** where host attack-surface reduction is
   the priority (most relevant for standalone [Docker](../docker/SKILL.md)/containerd use —
   e.g. CI runners — rather than typical [Kubernetes](../kubernetes/SKILL.md) node setups, which
   usually rely on Pod-level `securityContext.runAsNonRoot` and user
   namespaces instead):
   ```bash
   # rootless [Docker](../docker/SKILL.md) (dockerd-rootless-setuptool.sh, bundled with [Docker](../docker/SKILL.md) ≥ 20.10)
   dockerd-rootless-setuptool.sh install
   systemctl --user start [docker](../docker/SKILL.md)
   ```
   ```bash
   # rootless containerd + nerdctl
   containerd-rootless-setuptool.sh install
   nerdctl run --rm alpine echo hello
   ```
   [Kubernetes](../kubernetes/SKILL.md)' own user-namespace support (stable since 1.30 via
   `hostUsers: false` on the PodSpec) provides an analogous benefit at
   the pod level without needing a fully rootless node daemon:
   ```yaml
   spec:
     hostUsers: false
   ```

7. **Add a sandboxed RuntimeClass** for workloads needing stronger
   isolation than default `runc` namespaces (untrusted code execution,
   hard [multi-tenancy](../multi-tenancy/SKILL.md)):
   ```yaml
   apiVersion: node.k8s.io/v1
   kind: RuntimeClass
   metadata: { name: gvisor }
   handler: runsc
   ```
   ```yaml
   spec:
     runtimeClassName: gvisor
   ```
   This requires the sandboxed runtime (gVisor's `runsc`, or Kata
   Containers) actually installed and registered with containerd/CRI-O
   on the node first (`containerd`'s `config.toml` needs a matching
   `runtimes.runsc` entry) — applying the `RuntimeClass` alone without
   the node-side handler installed leaves pods stuck in
   `CreateContainerError`.

8. **Migrate a cluster off [Docker](../docker/SKILL.md)/dockershim**, if any node still runs
   it: since [Kubernetes](../kubernetes/SKILL.md) 1.24, dockershim no longer exists in-tree at
   all, so this is not an optional modernization but a hard requirement
   for any node still on ≤ 1.23 to upgrade past — drain each node,
   reprovision with a containerd/CRI-O-based node image (most managed
   [Kubernetes](../kubernetes/SKILL.md) offerings handle this automatically on node group/pool
   replacement), and rejoin:
   ```bash
   [kubectl](../kubectl/SKILL.md) drain <node> --ignore-daemonsets --delete-emptydir-data
   # reprovision node with containerd-based image, then:
   [kubectl](../kubectl/SKILL.md) uncordon <node>
   ```

## Best practices

- Match the kubelet and runtime cgroup drivers explicitly at every node
  provisioning step (bake it into the node image/bootstrap script), not
  as a manual per-node fix applied after nodes fail to join.
- Use `crictl`/`nerdctl` for node-level runtime debugging instead of
  reaching for a [Docker](../docker/SKILL.md) Engine install "because it's familiar" — adding
  [Docker](../docker/SKILL.md) Engine alongside the CRI runtime on a [Kubernetes](../kubernetes/SKILL.md) node is
  redundant, adds an unused daemon, and does not reflect what actually
  runs the pod's containers.
- Keep registry mirror/auth configuration in node bootstrap
  automation (Terraform user-data, a DaemonSet-applied config, or the
  node image itself), not manually edited on individual nodes — manual
  edits drift and don't survive node replacement.
- Reserve sandboxed runtimes (gVisor, Kata) for workloads that
  specifically need the added isolation — they carry a real performance
  and compatibility cost (syscall interception overhead for gVisor,
  full VM boundary for Kata) and are not a drop-in replacement for
  `runc` everywhere.
- Prefer [Kubernetes](../kubernetes/SKILL.md)-native `imagePullSecrets`/workload-level
  `securityContext` and user namespaces over node-wide rootless-daemon
  setups for isolating workload identity/permissions inside a cluster —
  node-level rootless mode matters most for standalone [Docker](../docker/SKILL.md)/CI-runner
  use, not typical multi-tenant [Kubernetes](../kubernetes/SKILL.md) nodes.
- Track CRI-O's [Kubernetes](../kubernetes/SKILL.md)-version lock-step explicitly in upgrade
  planning; a CRI-O version mismatched with the target kubelet version
  is not a supported combination even if it appears to start.

## Common pitfalls

- **Symptom:** A node fails to join the cluster, or kubelet logs show
  cgroup-driver related errors, right after provisioning.
  **Fix:** The kubelet's `cgroupDriver` and the runtime's own cgroup
  driver setting (containerd's `SystemdCgroup` option, CRI-O's
  equivalent) disagree — align both to `systemd` (the current
  recommended default across distributions) and restart both services.

- **Symptom:** A pod requesting a sandboxed `RuntimeClass` (gVisor/Kata)
  gets stuck in `CreateContainerError` with a handler-not-found-style
  message.
  **Fix:** The `RuntimeClass` [Kubernetes](../kubernetes/SKILL.md) object was created, but the
  corresponding runtime handler was never installed/registered in the
  node's containerd `config.toml` (`runtimes.runsc`/`runtimes.kata`).
  Both the [Kubernetes](../kubernetes/SKILL.md)-level `RuntimeClass` and the node-level runtime
  installation are required; neither alone is sufficient.

- **Symptom:** After a [Kubernetes](../kubernetes/SKILL.md) upgrade past 1.23/1.24, a legacy node
  image referencing `[docker](../docker/SKILL.md)://` as the container runtime fails to
  bootstrap entirely.
  **Fix:** dockershim was removed in-tree in [Kubernetes](../kubernetes/SKILL.md) 1.24 with no
  fallback — this is not a configuration bug to patch around. Reprovision
  the node with a containerd- or CRI-O-based image before attempting to
  join it to a 1.24+ control plane.

- **Symptom:** Private registry pulls fail on some nodes but not others
  despite identical [Kubernetes](../kubernetes/SKILL.md)-level `imagePullSecrets`.
  **Fix:** Node-level containerd registry auth config
  (`/etc/containerd/config.toml` or the newer `hosts.toml`-per-registry
  layout) drifted between nodes — confirm the auth config is applied
  identically across all nodes via bootstrap automation rather than a
  manual per-node edit, since `imagePullSecrets` and node-level
  containerd auth are two separate mechanisms that can each mask or
  duplicate the other depending on which the scheduler happens to hit.

- **Symptom:** `crictl` commands fail with a connection error even
  though `[kubectl](../kubectl/SKILL.md)` shows the node `Ready` and pods running fine.
  **Fix:** `crictl` is pointed at the wrong CRI socket
  (`/etc/crictl.yaml` `runtime-endpoint`) — common after migrating a
  node from one runtime to another without updating this config file;
  point it explicitly at the active runtime's socket
  (`unix:///run/containerd/containerd.sock` for containerd,
  `unix:///var/run/crio/crio.sock` for CRI-O).

## Worked example

**Scenario:** Configure a containerd-based node to use `systemd`
cgroups, mirror [Docker](../docker/SKILL.md) Hub through an internal cache, and add a gVisor
`RuntimeClass` for an untrusted-code-execution workload.

```toml
# /etc/containerd/config.toml
version = 2

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
  SystemdCgroup = true

[plugins."io.containerd.grpc.v1.cri".registry.mirrors."[docker](../docker/SKILL.md).io"]
  endpoint = ["https://mirror.internal.example.com", "https://registry-1.[docker](../docker/SKILL.md).io"]

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runsc]
  runtime_type = "io.containerd.runsc.v1"
```

```bash
sudo systemctl restart containerd
sudo crictl info | grep -A2 cgroupDriver   # confirm systemd is active
```

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata: { name: gvisor }
handler: runsc
---
apiVersion: v1
kind: Pod
metadata: { name: untrusted-job }
spec:
  runtimeClassName: gvisor
  containers:
    - name: sandboxed
      image: ghcr.io/example/untrusted-runner:2.1.0
```

```bash
[kubectl](../kubectl/SKILL.md) apply -f gvisor-runtimeclass.yaml -f untrusted-pod.yaml
[kubectl](../kubectl/SKILL.md) get pod untrusted-job
sudo crictl ps -a | grep untrusted-job
sudo crictl inspect <container-id> | grep -i runtimeType
```

The pod reaches `Running`, and `crictl inspect` confirms the container
was actually created under `io.containerd.runsc.v1` (gVisor) rather than
the default `runc`, giving the untrusted workload a syscall-interception
sandbox boundary in addition to standard [Kubernetes](../kubernetes/SKILL.md) RBAC/NetworkPolicy
isolation.

## Cross-references

- [lightweight-[kubernetes](../kubernetes/SKILL.md)-k3s](../[lightweight-[kubernetes](../kubernetes/SKILL.md)-k3s](../lightweight-[kubernetes](../kubernetes/SKILL.md)-k3s/SKILL.md)/SKILL.md) — K3s bundles and manages containerd internally; the same cgroup-driver and registry-mirror concepts apply.
- [managed-[kubernetes](../kubernetes/SKILL.md)-eks-aks-gke](../[managed-[kubernetes](../kubernetes/SKILL.md)-eks-aks-gke](../managed-[kubernetes](../kubernetes/SKILL.md)-eks-aks-gke/SKILL.md)/SKILL.md) — node image/runtime choices and constraints on managed [Kubernetes](../kubernetes/SKILL.md) node groups/pools.
- [openshift-and-rosa-platform](../[openshift-and-rosa-platform](../[openshift](../openshift/SKILL.md)-and-rosa-platform/SKILL.md)/SKILL.md) — CRI-O as [OpenShift](../openshift/SKILL.md)'s default node runtime and its [Kubernetes](../kubernetes/SKILL.md)-version lock-step.
- [container-build-and-release](../../../devops/skills/[container-build-and-release](../container-build-and-release/SKILL.md)/SKILL.md) — building, tagging, and scanning the images this runtime executes (a separate concern from the runtime engine itself).
