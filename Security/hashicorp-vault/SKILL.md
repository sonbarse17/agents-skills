---
name: hashicorp-vault
description: Manage secrets and PKI with HashiCorp Vault. Configure secret
  engines, authentication methods, and policies. Use when implementing
  centralized secrets management, dynamic credentials, or certificate
  management.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
tags:
  - security
  - hashicorp-vault
depends_on: []
---

# HashiCorp [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)

Centrally manage secrets, encryption, and access with HashiCorp [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).

## When to Use This Skill

Use this skill when:
- Centralizing secrets management
- Implementing dynamic credentials
- Managing PKI and certificates
- Encrypting sensitive data
- Meeting compliance requirements

## Prerequisites

- [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) server (dev or production)
- [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) CLI installed
- Network access to [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)

## Quick Start

### Development Server

```bash
# Start dev server
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) server -dev

# Set environment
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'

# Verify connection
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) status
```

### Production Deployment

```hcl
# config.hcl
storage "raft" {
  path = "/opt/[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)/data"
  node_id = "[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-1"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_cert_file = "/opt/[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)/tls/[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).crt"
  tls_key_file = "/opt/[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)/tls/[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).key"
}

api_addr = "https://[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).example.com:8200"
cluster_addr = "https://[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).example.com:8201"

ui = true
```

```bash
# Initialize [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) operator init -key-shares=5 -key-threshold=3

# Unseal (run 3 times with different keys)
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) operator unseal <key-1>
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) operator unseal <key-2>
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) operator unseal <key-3>

# Login
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) login <root-token>
```

## Secret Engines

### KV Secrets

```bash
# Enable KV v2
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets enable -path=secret kv-v2

# Write secret
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) kv put secret/myapp/config \
  username="admin" \
  password="s3cr3t"

# Read secret
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) kv get secret/myapp/config
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) kv get -field=password secret/myapp/config

# Update secret
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) kv put secret/myapp/config \
  username="admin" \
  password="new-password"

# List secrets
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) kv list secret/

# Delete secret
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) kv delete secret/myapp/config

# Version history
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) kv metadata get secret/myapp/config
```

### Database Secrets

```bash
# Enable database engine
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets enable database

# Configure [PostgreSQL](../../Software_Engineering_and_Other/Backend/postgresql/SKILL.md) connection
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write database/config/[postgresql](../../Software_Engineering_and_Other/Backend/postgresql/SKILL.md) \
  plugin_name=[postgresql](../../Software_Engineering_and_Other/Backend/postgresql/SKILL.md)-database-plugin \
  connection_url="[postgresql](../../Software_Engineering_and_Other/Backend/postgresql/SKILL.md)://{{username}}:{{password}}@localhost:5432/mydb" \
  allowed_roles="readonly,readwrite" \
  username="[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)" \
  password="[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)-password"

# Create role
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write database/roles/readonly \
  db_name=[postgresql](../../Software_Engineering_and_Other/Backend/postgresql/SKILL.md) \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"

# Get credentials
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) read database/creds/readonly
```

### AWS Secrets

```bash
# Enable AWS engine
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets enable aws

# Configure root credentials
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write aws/config/root \
  access_key=AKIA... \
  secret_key=secret... \
  region=us-east-1

# Create role
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write aws/roles/deploy \
  credential_type=iam_user \
  policy_document=-<<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:*"],
      "Resource": ["arn:aws:s3:::my-bucket/*"]
    }
  ]
}
EOF

# Get credentials
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) read aws/creds/deploy
```

### PKI Secrets

```bash
# Enable PKI engine
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets enable pki
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets tune -max-lease-ttl=87600h pki

# Generate root CA
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write -field=certificate pki/root/generate/internal \
  common_name="example.com" \
  ttl=87600h > ca_cert.crt

# Configure URLs
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write pki/config/urls \
  issuing_certificates="https://[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).example.com:8200/v1/pki/ca" \
  crl_distribution_points="https://[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).example.com:8200/v1/pki/crl"

# Create role
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write pki/roles/web-server \
  allowed_domains="example.com" \
  allow_subdomains=true \
  max_ttl="720h"

# Issue certificate
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write pki/issue/web-server \
  common_name="web.example.com" \
  ttl="24h"
```

## Authentication Methods

### AppRole

```bash
# Enable AppRole
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) auth enable approle

# Create role
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write auth/approle/role/myapp \
  token_policies="myapp-policy" \
  token_ttl=1h \
  token_max_ttl=4h \
  secret_id_ttl=10m

# Get role ID
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) read auth/approle/role/myapp/role-id

# Generate secret ID
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write -f auth/approle/role/myapp/secret-id

# Login
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write auth/approle/login \
  role_id=<role-id> \
  secret_id=<secret-id>
```

### [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)

```bash
# Enable [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) auth
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) auth enable [kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)

# Configure
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write auth/[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)/config \
  kubernetes_host="https://[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md).default.svc" \
  kubernetes_ca_cert=@/var/run/secrets/[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md).io/serviceaccount/ca.crt

# Create role
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write auth/[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)/role/myapp \
  bound_service_account_names=myapp \
  bound_service_account_namespaces=default \
  policies=myapp-policy \
  ttl=1h
```

### OIDC

```bash
# Enable OIDC auth
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) auth enable oidc

# Configure
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write auth/oidc/config \
  oidc_discovery_url="https://accounts.google.com" \
  oidc_client_id="your-client-id" \
  oidc_client_secret="your-client-secret" \
  default_role="default"

# Create role
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) write auth/oidc/role/default \
  bound_audiences="your-client-id" \
  allowed_redirect_uris="http://localhost:8250/oidc/callback" \
  user_claim="sub" \
  policies="default"
```

## Policies

### Policy Definition

```hcl
# myapp-policy.hcl
# Read secrets
path "secret/data/myapp/*" {
  capabilities = ["read", "list"]
}

# Database credentials
path "database/creds/myapp-db" {
  capabilities = ["read"]
}

# PKI certificates
path "pki/issue/web-server" {
  capabilities = ["create", "update"]
}

# Deny access to other secrets
path "secret/data/other/*" {
  capabilities = ["deny"]
}
```

```bash
# Create policy
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) policy write myapp myapp-policy.hcl

# List policies
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) policy list

# Read policy
[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) policy read myapp
```

## Application Integration

### [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)

```[python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)
import hvac

# Initialize client
client = hvac.Client(url='http://localhost:8200')

# AppRole authentication
client.auth.approle.login(
    role_id='role-id',
    secret_id='secret-id'
)

# Read secret
secret = client.secrets.kv.v2.read_secret_version(
    path='myapp/config',
    mount_point='secret'
)
password = secret['data']['data']['password']

# Get database credentials
db_creds = client.secrets.database.generate_credentials(
    name='myapp-db'
)
```

### [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) Sidecar

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  annotations:
    [vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).hashicorp.com/agent-inject: "true"
    [vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).hashicorp.com/role: "myapp"
    [vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).hashicorp.com/agent-inject-secret-config: "secret/data/myapp/config"
    [vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md).hashicorp.com/agent-inject-template-config: |
      {{- with secret "secret/data/myapp/config" -}}
      export DB_PASSWORD="{{ .Data.data.password }}"
      {{- end }}
spec:
  serviceAccountName: myapp
  containers:
    - name: myapp
      image: myapp:latest
      command: ["/bin/sh", "-c", "source /[vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)/secrets/config && ./start.sh"]
```

## Common Issues

### Issue: Sealed [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)
**Problem**: [Vault](../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) is sealed after restart
**Solution**: Implement auto-unseal with cloud KMS or HSM

### Issue: Token Expired
**Problem**: Application token has expired
**Solution**: Implement token renewal, use shorter-lived tokens

### Issue: Permission Denied
**Problem**: Cannot access secrets
**Solution**: Review policies, check token capabilities

## Best Practices

- Use short-lived tokens
- Implement auto-unseal
- Enable [audit](../../AI_and_Agents/Operations/audit/SKILL.md) logging
- Use namespaces for isolation
- Rotate root tokens regularly
- Implement least-privilege policies
- Use dynamic secrets where possible
- Regular backup and DR testing

## Related Skills

- [aws-secrets-manager](../[aws-secrets-manager](../../DevOps_and_Cloud/Cloud_Providers/aws-secrets-manager/SKILL.md)/) - AWS native secrets
- [sops-encryption](../[sops-encryption](../../DevOps_and_Cloud/Containers_and_Orchestration/sops-encryption/SKILL.md)/) - File encryption
- [kubernetes-hardening](../../hardening/[kubernetes-hardening](../../DevOps_and_Cloud/Containers_and_Orchestration/[kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)-hardening/SKILL.md)/) - K8s security
