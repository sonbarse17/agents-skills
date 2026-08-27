---
name: sops-encryption
description: Encrypt files and configs with Mozilla SOPS. Integrate with AWS
  KMS, GCP KMS, or PGP for key management. Use when encrypting configuration
  files, Kubernetes secrets, or implementing GitOps with encrypted secrets.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
tags:
  - containers_and_orchestration
  - sops-encryption
depends_on: []
---

# SOPS Encryption

Encrypt secrets in configuration files while keeping structure visible.

## When to Use This Skill

Use this skill when:
- Encrypting secrets in Git
- Implementing [GitOps](../gitops/SKILL.md) with secrets
- Managing [Kubernetes](../kubernetes/SKILL.md) secrets as code
- Encrypting configuration files

## Prerequisites

- SOPS installed
- KMS access (AWS, GCP, Azure) or PGP key

## Installation

```bash
# macOS
brew install sops

# Linux
wget https://[github](../../CI_CD/github/SKILL.md).com/getsops/sops/releases/download/v3.8.0/sops-v3.8.0.linux.amd64
chmod +x sops-v3.8.0.linux.amd64
mv sops-v3.8.0.linux.amd64 /usr/local/bin/sops
```

## Basic Usage

```bash
# Encrypt with AWS KMS
sops --encrypt --kms arn:aws:kms:region:account:key/key-id secrets.yaml > secrets.enc.yaml

# Decrypt
sops --decrypt secrets.enc.yaml

# Edit encrypted file
sops secrets.enc.yaml

# Encrypt in place
sops --encrypt --in-place secrets.yaml
```

## Configuration

```yaml
# .sops.yaml
creation_rules:
  - path_regex: .*\.prod\.yaml$
    kms: arn:aws:kms:us-east-1:account:key/prod-key
  - path_regex: .*\.dev\.yaml$
    kms: arn:aws:kms:us-east-1:account:key/dev-key
  - path_regex: .*
    pgp: fingerprint
```

## [Kubernetes](../kubernetes/SKILL.md) Integration

```yaml
# encrypted secret
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
type: Opaque
stringData:
  password: ENC[AES256_GCM,data:encrypted...]
sops:
  kms:
    - arn: arn:aws:kms:region:account:key/key-id
```

```bash
# With [ArgoCD](../argocd/SKILL.md)
# Install ksops plugin for [ArgoCD](../argocd/SKILL.md) to decrypt secrets
```

## Best Practices

- Store .sops.yaml in repository
- Use different keys per environment
- Rotate encryption keys regularly
- Never [commit](../../CI_CD/commit/SKILL.md) unencrypted secrets
- Use key aliases for readability

## Related Skills

- [hashicorp-vault](../[hashicorp-vault](../../../Security/hashicorp-[vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)/SKILL.md)/) - Centralized secrets
- [argocd-gitops](../../../devops/orchestration/[argocd-gitops](../[argocd](../argocd/SKILL.md)-[gitops](../gitops/SKILL.md)/SKILL.md)/) - [GitOps](../gitops/SKILL.md) integration
