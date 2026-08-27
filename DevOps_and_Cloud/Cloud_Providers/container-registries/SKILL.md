---
name: container-registries
description: Manage container registries including ECR, ACR, GCR, and Docker
  Hub. Push and pull images, configure authentication, set up repository
  policies, and implement image lifecycle management. Use when working with
  container image storage and distribution.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
tags:
  - cloud_providers
  - container-registries
depends_on: []
---

# Container Registries

Store, manage, and distribute container images across cloud and self-hosted registries.

## When to Use This Skill

Use this skill when:
- Pushing and pulling container images
- Configuring registry authentication
- Setting up image retention policies
- Managing private container registries
- Implementing image scanning and security

## Prerequisites

- [Docker](../../Containers_and_Orchestration/docker/SKILL.md) or [Podman](../../Containers_and_Orchestration/podman/SKILL.md) installed
- Cloud CLI tools (AWS CLI, az, gcloud) for respective registries
- Appropriate IAM permissions

## [Docker](../../Containers_and_Orchestration/docker/SKILL.md) Hub

### Authentication

```bash
# Login
[docker](../../Containers_and_Orchestration/docker/SKILL.md) login

# Login with token
echo "$DOCKER_TOKEN" | [docker](../../Containers_and_Orchestration/docker/SKILL.md) login -u username --password-stdin
```

### Push/Pull Images

```bash
# Tag image
[docker](../../Containers_and_Orchestration/docker/SKILL.md) tag myapp:latest username/myapp:latest

# Push
[docker](../../Containers_and_Orchestration/docker/SKILL.md) push username/myapp:latest

# Pull
[docker](../../Containers_and_Orchestration/docker/SKILL.md) pull username/myapp:latest
```

### Automated Builds

Configure in [Docker](../../Containers_and_Orchestration/docker/SKILL.md) Hub UI:
1. Connect [GitHub](../../CI_CD/github/SKILL.md)/Bitbucket repository
2. Set build rules (branch → tag mapping)
3. Configure build context and Dockerfile path

## Amazon ECR

### Setup

```bash
# Create repository
aws ecr create-repository \
  --repository-name myapp \
  --[image-scanning](../../../Security/image-scanning/SKILL.md)-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# Get registry URI
REGISTRY=$(aws ecr describe-repositories \
  --repository-names myapp \
  --query 'repositories[0].repositoryUri' \
  --output text | cut -d'/' -f1)
```

### Authentication

```bash
# Login ([Docker](../../Containers_and_Orchestration/docker/SKILL.md))
aws ecr get-login-password --region us-east-1 | \
  [docker](../../Containers_and_Orchestration/docker/SKILL.md) login --username AWS --password-stdin $REGISTRY

# Login with credential helper
# Add to ~/.[docker](../../Containers_and_Orchestration/docker/SKILL.md)/config.json:
{
  "credHelpers": {
    "123456789.dkr.ecr.us-east-1.amazonaws.com": "ecr-login"
  }
}
```

### Push/Pull

```bash
# Tag and push
[docker](../../Containers_and_Orchestration/docker/SKILL.md) tag myapp:latest $REGISTRY/myapp:latest
[docker](../../Containers_and_Orchestration/docker/SKILL.md) push $REGISTRY/myapp:latest

# Pull
[docker](../../Containers_and_Orchestration/docker/SKILL.md) pull $REGISTRY/myapp:latest
```

### Lifecycle Policy

```bash
# Create lifecycle policy
aws ecr put-lifecycle-policy \
  --repository-name myapp \
  --lifecycle-policy-text '{
    "rules": [
      {
        "rulePriority": 1,
        "description": "Keep last 10 images",
        "selection": {
          "tagStatus": "any",
          "countType": "imageCountMoreThan",
          "countNumber": 10
        },
        "action": {
          "type": "expire"
        }
      }
    ]
  }'
```

### Repository Policy

```bash
# Allow cross-account access
aws ecr set-repository-policy \
  --repository-name myapp \
  --policy-text '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "CrossAccountPull",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::OTHER_ACCOUNT:root"
        },
        "Action": [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
      }
    ]
  }'
```

## Azure Container Registry (ACR)

### Setup

```bash
# Create registry
az acr create \
  --resource-group mygroup \
  --name myregistry \
  --sku Standard \
  --admin-enabled false

# Get login server
az acr show --name myregistry --query loginServer -o tsv
```

### Authentication

```bash
# Login with Azure CLI
az acr login --name myregistry

# Login with service principal
[docker](../../Containers_and_Orchestration/docker/SKILL.md) login myregistry.azurecr.io \
  -u $SP_APP_ID \
  -p $SP_PASSWORD

# Get access token
az acr login --name myregistry --expose-token
```

### Push/Pull

```bash
# Tag and push
[docker](../../Containers_and_Orchestration/docker/SKILL.md) tag myapp:latest myregistry.azurecr.io/myapp:latest
[docker](../../Containers_and_Orchestration/docker/SKILL.md) push myregistry.azurecr.io/myapp:latest

# ACR Build (build in cloud)
az acr build \
  --registry myregistry \
  --image myapp:latest \
  --file Dockerfile .
```

### Retention Policy

```bash
# Enable retention policy
az acr config retention update \
  --registry myregistry \
  --status enabled \
  --days 30 \
  --type UntaggedManifests
```

### Geo-Replication

```bash
# Enable replication
az acr replication create \
  --registry myregistry \
  --location westeurope

# List replications
az acr replication list --registry myregistry
```

## Google Container Registry (GCR) / Artifact Registry

### Setup (Artifact Registry)

```bash
# Create repository
gcloud artifacts repositories create myrepo \
  --repository-format=[docker](../../Containers_and_Orchestration/docker/SKILL.md) \
  --location=us-central1 \
  --description="[Docker](../../Containers_and_Orchestration/docker/SKILL.md) repository"
```

### Authentication

```bash
# Configure [Docker](../../Containers_and_Orchestration/docker/SKILL.md) auth
gcloud auth configure-[docker](../../Containers_and_Orchestration/docker/SKILL.md) us-central1-[docker](../../Containers_and_Orchestration/docker/SKILL.md).pkg.dev

# Or use credential helper
gcloud auth print-access-token | \
  [docker](../../Containers_and_Orchestration/docker/SKILL.md) login -u oauth2accesstoken --password-stdin \
  https://us-central1-[docker](../../Containers_and_Orchestration/docker/SKILL.md).pkg.dev
```

### Push/Pull

```bash
# Tag for Artifact Registry
[docker](../../Containers_and_Orchestration/docker/SKILL.md) tag myapp:latest \
  us-central1-[docker](../../Containers_and_Orchestration/docker/SKILL.md).pkg.dev/PROJECT_ID/myrepo/myapp:latest

# Push
[docker](../../Containers_and_Orchestration/docker/SKILL.md) push us-central1-[docker](../../Containers_and_Orchestration/docker/SKILL.md).pkg.dev/PROJECT_ID/myrepo/myapp:latest

# Pull
[docker](../../Containers_and_Orchestration/docker/SKILL.md) pull us-central1-[docker](../../Containers_and_Orchestration/docker/SKILL.md).pkg.dev/PROJECT_ID/myrepo/myapp:latest
```

### Cleanup Policy

```bash
# Create cleanup policy
gcloud artifacts repositories set-cleanup-policies myrepo \
  --location=us-central1 \
  --policy=policy.json

# policy.json
{
  "name": "delete-old",
  "action": {"type": "Delete"},
  "condition": {
    "olderThan": "30d",
    "tagState": "untagged"
  }
}
```

## [GitHub](../../CI_CD/github/SKILL.md) Container Registry (GHCR)

### Authentication

```bash
# Login with PAT
echo "$GITHUB_TOKEN" | [docker](../../Containers_and_Orchestration/docker/SKILL.md) login ghcr.io -u USERNAME --password-stdin
```

### Push/Pull

```bash
# Tag
[docker](../../Containers_and_Orchestration/docker/SKILL.md) tag myapp:latest ghcr.io/OWNER/myapp:latest

# Push
[docker](../../Containers_and_Orchestration/docker/SKILL.md) push ghcr.io/OWNER/myapp:latest

# Pull
[docker](../../Containers_and_Orchestration/docker/SKILL.md) pull ghcr.io/OWNER/myapp:latest
```

### Visibility Settings

Configure in [GitHub](../../CI_CD/github/SKILL.md):
1. Go to package settings
2. Change visibility (public/private)
3. Manage access for teams/users

## Self-Hosted Registry

### Deploy with [Docker](../../Containers_and_Orchestration/docker/SKILL.md)

```bash
# Run registry
[docker](../../Containers_and_Orchestration/docker/SKILL.md) run -d -p 5000:5000 \
  --name registry \
  -v registry-data:/var/lib/registry \
  registry:2

# Configure TLS
[docker](../../Containers_and_Orchestration/docker/SKILL.md) run -d -p 443:5000 \
  --name registry \
  -v /certs:/certs \
  -v registry-data:/var/lib/registry \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
  registry:2
```

### Harbor Registry

```bash
# Download Harbor
wget https://[github](../../CI_CD/github/SKILL.md).com/goharbor/harbor/releases/download/v2.9.0/harbor-online-installer-v2.9.0.tgz
tar xzvf harbor-online-installer-v2.9.0.tgz

# Configure harbor.yml
# Set hostname, https certificate, admin password

# Install
./install.sh --with-trivy --with-chartmuseum
```

## Image Security

### Vulnerability Scanning

```bash
# ECR - Enable scan on push
aws ecr put-[image-scanning](../../../Security/image-scanning/SKILL.md)-configuration \
  --repository-name myapp \
  --[image-scanning](../../../Security/image-scanning/SKILL.md)-configuration scanOnPush=true

# Get scan results
aws ecr describe-image-scan-findings \
  --repository-name myapp \
  --image-id imageTag=latest

# ACR - Scan with Defender
az acr task create \
  --registry myregistry \
  --name scan-images \
  --cmd "mcr.microsoft.com/azure-cli az acr run-scan"
```

### Image Signing

```bash
# Enable content trust
export DOCKER_CONTENT_TRUST=1

# Sign image on push
[docker](../../Containers_and_Orchestration/docker/SKILL.md) push myregistry/myapp:latest

# Verify signature
[docker](../../Containers_and_Orchestration/docker/SKILL.md) trust inspect myregistry/myapp:latest
```

## Common Issues

### Issue: Authentication Expired
**Problem**: Push/pull fails with auth error
**Solution**: Re-run login command, check credential helper

### Issue: Image Not Found
**Problem**: Pull fails with manifest unknown
**Solution**: Verify tag exists, check registry URL

### Issue: Push Permission Denied
**Problem**: Cannot push to repository
**Solution**: Check IAM permissions, verify repository exists

### Issue: Rate Limiting ([Docker](../../Containers_and_Orchestration/docker/SKILL.md) Hub)
**Problem**: Too many requests error
**Solution**: Authenticate for higher limits, use pull-through cache

## Best Practices

- Enable vulnerability scanning on all repositories
- Implement lifecycle policies to manage storage costs
- Use immutable tags for production images
- Configure cross-region replication for availability
- Use service accounts/principals for CI/CD authentication
- Enable [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging for compliance
- Implement image signing for supply chain security
- Use pull-through cache to avoid rate limits

## Related Skills

- [docker-management](../[docker-management](../../Containers_and_Orchestration/[docker](../../Containers_and_Orchestration/docker/SKILL.md)-management/SKILL.md)/) - Building images
- [container-scanning](../../../security/scanning/[container-scanning](../../Containers_and_Orchestration/container-scanning/SKILL.md)/) - Security scanning
- [aws-iam](../../../infrastructure/cloud-aws/[aws-iam](../aws-iam/SKILL.md)/) - AWS permissions
