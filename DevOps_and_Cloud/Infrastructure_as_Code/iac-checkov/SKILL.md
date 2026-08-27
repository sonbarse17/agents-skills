---
name: iac-checkov
description: >
  Infrastructure as Code (IaC) security scanning using Checkov with 750+
  built-in policies for Terraform, CloudFormation, Kubernetes, Dockerfile, and
  ARM templates. Use when: (1) Scanning IaC files for security misconfigurations
  and compliance violations, (2) Validating cloud infrastructure against CIS,
  PCI-DSS, HIPAA, and SOC2 benchmarks, (3) Detecting secrets and hardcoded
  credentials in IaC, (4) Implementing policy-as-code in CI/CD pipelines, (5)
  Generating compliance reports with remediation guidance for cloud security
  posture management.
version: 0.1.0
maintainer: SirAppSec
category: devsecops
tags:
  - iac
  - checkov
  - terraform
  - kubernetes
  - cloudformation
  - compliance
  - policy-as-code
  - cloud-security
frameworks:
  - PCI-DSS
  - HIPAA
  - SOC2
  - NIST
  - GDPR
dependencies:
  python: ">=3.8"
  packages:
    - checkov
references:
  - https://www.checkov.io/
  - https://github.com/bridgecrewio/checkov
  - https://docs.paloaltonetworks.com/prisma/prisma-cloud
depends_on: []
---

# Infrastructure as Code Security with Checkov

## Overview

Checkov is a static code analysis tool that scans Infrastructure as Code (IaC) files for security misconfigurations
and compliance violations before deployment. With 750+ built-in policies, Checkov helps prevent cloud security issues
by detecting problems in Terraform, [CloudFormation](../cloudformation/SKILL.md), [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md), Dockerfiles, Helm charts, and ARM templates.

Checkov performs graph-based scanning to understand resource relationships and detect complex misconfigurations that
span multiple resources, making it more powerful than simple pattern matching.

## Quick Start

### Install Checkov

```bash
# Via pip
pip install checkov

# Via Homebrew (macOS)
brew install checkov

# Via [Docker](../../Containers_and_Orchestration/docker/SKILL.md)
[docker](../../Containers_and_Orchestration/docker/SKILL.md) pull bridgecrew/checkov
```

### Scan Terraform Directory

```bash
# Scan all Terraform files in directory
checkov -d ./terraform

# Scan specific file
checkov -f ./terraform/main.tf

# Scan with specific framework
checkov -d ./infrastructure --framework terraform
```

### Scan [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) Manifests

```bash
# Scan [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) YAML files
checkov -d ./k8s --framework [kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md)

# Scan Helm chart
checkov -d ./helm-chart --framework helm
```

### Scan [CloudFormation](../cloudformation/SKILL.md) Template

```bash
# Scan [CloudFormation](../cloudformation/SKILL.md) template
checkov -f ./[cloudformation](../cloudformation/SKILL.md)/template.yaml --framework [cloudformation](../cloudformation/SKILL.md)
```

## Core Workflow

### Step 1: Understand Scan Scope

Identify IaC files and frameworks to scan:

```bash
# Supported frameworks
checkov --list-frameworks

# Output:
# terraform, [cloudformation](../cloudformation/SKILL.md), [kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md), dockerfile, helm,
# [serverless](../../Containers_and_Orchestration/serverless/SKILL.md), arm, secrets, [ansible](../ansible/SKILL.md), github_actions, gitlab_ci
```

**Scope Considerations:**
- Scan entire infrastructure directory for comprehensive coverage
- Focus on specific frameworks during initial adoption
- Exclude generated or vendor files
- Include both production and non-production configurations

### Step 2: Run Basic Scan

Execute Checkov with appropriate output format:

```bash
# CLI output (human-readable)
checkov -d ./terraform

# JSON output (for automation)
checkov -d ./terraform -o json

# Multiple output formats
checkov -d ./terraform -o cli -o json -o sarif

# Save output to file
checkov -d ./terraform -o json --output-file-path ./reports
```

**What Checkov Detects:**
- Security misconfigurations (unencrypted resources, public access)
- Compliance violations (CIS benchmarks, industry standards)
- Secrets and hardcoded credentials
- Missing security controls (logging, [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md), encryption)
- Insecure network configurations
- Resource relationship issues (via graph analysis)

### Step 3: Filter and Prioritize Findings

Focus on critical issues first:

```bash
# Show only high severity issues
checkov -d ./terraform --check CKV_AWS_*

# Skip specific checks (false positives)
checkov -d ./terraform --skip-check CKV_AWS_8,CKV_AWS_21

# Check against specific compliance framework
checkov -d ./terraform --compact --framework terraform \
  --check CIS_AWS,CIS_AZURE

# Run only checks with specific severity
checkov -d ./terraform --check HIGH,CRITICAL
```

**Severity Levels:**
- **CRITICAL**: Immediate security risks (public S3 buckets, unencrypted databases)
- **HIGH**: Significant security concerns (missing MFA, weak encryption)
- **MEDIUM**: Important security best practices (missing tags, logging disabled)
- **LOW**: Recommendations and hardening (resource naming conventions)

### Step 4: Suppress False Positives

Use inline suppression for legitimate exceptions:

```hcl
# Terraform example
resource "aws_s3_bucket" "example" {
  # checkov:skip=CKV_AWS_18:This bucket is intentionally public for static website
  bucket = "my-public-website"
  acl    = "public-read"
}
```

```yaml
# [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) example
apiVersion: v1
kind: Pod
metadata:
  name: privileged-pod
  annotations:
    checkov.io/skip: CKV_K8S_16=Legacy application requires privileged mode
spec:
  containers:
  - name: app
    securityContext:
      privileged: true
```

See `../../../Global_References/suppression_guide.md` for comprehensive suppression strategies.

### Step 5: Create Custom Policies

Define organization-specific policies:

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
# custom_checks/require_s3_versioning.py
from checkov.terraform.checks.resource.base_resource_check import BaseResourceCheck
from checkov.common.models.enums import CheckResult, CheckCategories

class S3BucketVersioning(BaseResourceCheck):
    def __init__(self):
        name = "Ensure S3 bucket has versioning enabled"
        id = "CKV_AWS_CUSTOM_001"
        supported_resources = ['aws_s3_bucket']
        categories = [CheckCategories.BACKUP_AND_RECOVERY]
        super().__init__(name=name, id=id, categories=categories,
                         supported_resources=supported_resources)

    def scan_resource_conf(self, conf):
        if 'versioning' in conf:
            if conf['versioning'][0].get('enabled') == [True]:
                return CheckResult.PASSED
        return CheckResult.FAILED

check = S3BucketVersioning()
```

Run with custom policies:

```bash
checkov -d ./terraform --external-checks-dir ./custom_checks
```

See `../../../Global_References/custom_policies.md` for advanced policy development.

### Step 6: Generate Compliance Reports

Create reports for [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) and compliance:

```bash
# Generate comprehensive report
checkov -d ./terraform \
  -o cli -o json -o junitxml \
  --output-file-path ./compliance-reports \
  --repo-id my-infrastructure \
  --branch main

# CycloneDX SBOM for IaC
checkov -d ./terraform -o cyclonedx

# SARIF for [GitHub](../../CI_CD/github/SKILL.md) Security
checkov -d ./terraform -o sarif --output-file-path ./sarif-report.json
```

**Report Types:**
- **CLI**: Human-readable console output
- **JSON**: Machine-readable for automation
- **JUnit XML**: CI/CD integration ([Jenkins](../../CI_CD/jenkins/SKILL.md), GitLab)
- **SARIF**: [GitHub](../../CI_CD/github/SKILL.md)/Azure DevOps Security tab
- **CycloneDX**: Software Bill of Materials for IaC

Map findings to compliance frameworks using `../../../Global_References/iac-checkov_compliance_mapping.md`.

## CI/CD Integration

### [GitHub](../../CI_CD/github/SKILL.md) Actions

Add Checkov scanning to pull request checks:

```yaml
# .[github](../../CI_CD/github/SKILL.md)/workflows/checkov.yml
name: Checkov IaC Security Scan
on: [push, pull_request]

jobs:
  checkov-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: infrastructure/
          framework: terraform
          output_format: sarif
          output_file_path: checkov-results.sarif
          soft_fail: false

      - name: Upload SARIF Report
        if: always()
        uses: [github](../../CI_CD/github/SKILL.md)/codeql-action/upload-sarif@v2
        with:
          sarif_file: checkov-results.sarif
```

### Pre-[Commit](../../CI_CD/commit/SKILL.md) Hook

Prevent committing insecure IaC:

```yaml
# .pre-[commit](../../CI_CD/commit/SKILL.md)-config.yaml
repos:
  - repo: https://[github](../../CI_CD/github/SKILL.md).com/bridgecrewio/checkov
    rev: 2.5.0
    hooks:
      - id: checkov
        args: [--soft-fail]
        files: \.(tf|yaml|yml|json)$
```

Install pre-[commit](../../CI_CD/commit/SKILL.md) hooks:

```bash
pip install pre-[commit](../../CI_CD/commit/SKILL.md)
pre-[commit](../../CI_CD/commit/SKILL.md) install
```

### GitLab CI

```yaml
# .[gitlab-ci](../../CI_CD/gitlab-ci/SKILL.md).yml
checkov_scan:
  image: bridgecrew/checkov:latest
  stage: security
  script:
    - checkov -d ./terraform -o json -o junitxml
      --output-file-path $CI_PROJECT_DIR/checkov-report
  artifacts:
    reports:
      junit: checkov-report/results_junitxml.xml
    paths:
      - checkov-report/
    when: always
```

### [Jenkins](../../CI_CD/jenkins/SKILL.md) Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    stages {
        stage('Checkov Scan') {
            steps {
                sh 'pip install checkov'
                sh '''
                    checkov -d ./terraform \
                      -o cli -o junitxml \
                      --output-file-path ./reports
                '''
            }
        }
    }
    post {
        always {
            junit 'reports/results_junitxml.xml'
        }
    }
}
```

See `assets/` directory for complete CI/CD templates.

## Framework-Specific Workflows

### Terraform

**Scan Terraform with Variable Files:**

```bash
# Scan with tfvars
checkov -d ./terraform --var-file ./terraform.tfvars

# Download and scan external modules
checkov -d ./terraform --download-external-modules true

# Skip Terraform plan files
checkov -d ./terraform --skip-path terraform.tfstate
```

**Common Terraform Checks:**
- CKV_AWS_19: Ensure S3 bucket has server-side encryption
- CKV_AWS_21: Ensure S3 bucket has versioning enabled
- CKV_AWS_23: Ensure Security Group ingress is not open to 0.0.0.0/0
- CKV_AWS_40: Ensure IAM policies don't use wildcard actions
- CKV_AWS_61: Ensure RDS database has encryption at rest enabled

### [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md)

**Scan [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) Manifests:**

```bash
# Scan all YAML manifests
checkov -d ./k8s --framework [kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md)

# Scan Helm chart
checkov -d ./helm-chart --framework helm

# Scan [kustomize](../../Containers_and_Orchestration/kustomize/SKILL.md) output
[kustomize](../../Containers_and_Orchestration/kustomize/SKILL.md) build ./overlay/prod | checkov -f - --framework [kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md)
```

**Common [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) Checks:**
- CKV_K8S_8: Ensure Liveness Probe is configured
- CKV_K8S_10: Ensure CPU requests are set
- CKV_K8S_11: Ensure CPU limits are set
- CKV_K8S_14: Ensure container image is not latest
- CKV_K8S_16: Ensure container is not privileged
- CKV_K8S_22: Ensure read-only root filesystem
- CKV_K8S_28: Ensure container capabilities are minimized

### [CloudFormation](../cloudformation/SKILL.md)

**Scan [CloudFormation](../cloudformation/SKILL.md) Templates:**

```bash
# Scan [CloudFormation](../cloudformation/SKILL.md) template
checkov -f ./[cloudformation](../cloudformation/SKILL.md)/stack.yaml --framework [cloudformation](../cloudformation/SKILL.md)

# Scan AWS SAM template
checkov -f ./sam-template.yaml --framework [serverless](../../Containers_and_Orchestration/serverless/SKILL.md)
```

### Dockerfile

**Scan Dockerfiles for Security Issues:**

```bash
# Scan Dockerfile
checkov -f ./Dockerfile --framework dockerfile

# Common issues detected:
# - Running as root user
# - Using :latest tag
# - Missing HEALTHCHECK
# - Exposing sensitive ports
```

## Baseline and Drift Detection

### Create Security Baseline

Establish baseline for existing infrastructure:

```bash
# Create baseline (first scan)
checkov -d ./terraform --create-baseline

# This creates .checkov.baseline file with current findings
```

### Detect New Issues (Drift)

Compare subsequent scans against baseline:

```bash
# Compare against baseline - only fail on NEW issues
checkov -d ./terraform --baseline .checkov.baseline

# This allows existing issues while preventing new ones
```

**Use Cases:**
- Gradual remediation of legacy infrastructure
- Focus on preventing new security debt
- Phased compliance adoption

## Secret Scanning

Detect hardcoded secrets in IaC:

```bash
# Enable secrets scanning
checkov -d ./terraform --framework secrets

# Common secrets detected:
# - AWS access keys
# - API tokens
# - Private keys
# - Database passwords
# - Generic secrets (high entropy strings)
```

## Security Considerations

- **Policy Suppression Governance**: Require security team approval for suppressing CRITICAL/HIGH findings
- **CI/CD Failure Thresholds**: Configure `--hard-fail-on` for severity levels that should block deployment
- **Custom Policy Management**: Version control custom policies and review changes
- **Compliance Alignment**: Map organizational requirements to Checkov policies
- **Secrets Management**: Never [commit](../../CI_CD/commit/SKILL.md) secrets; use secret managers and rotation policies
- **[Audit](../../../AI_and_Agents/Operations/audit/SKILL.md) Logging**: Log all scan results and policy suppressions for compliance audits
- **False Positive Review**: Regularly review suppressed findings to ensure they remain valid
- **Policy Updates**: Keep Checkov updated to receive new security policies

## Bundled Resources

### Scripts (`scripts/`)

- `checkov_scan.py` - Comprehensive scanning script with multiple frameworks and output formats
- `checkov_terraform_scan.sh` - Terraform-specific scanning with variable file support
- `checkov_k8s_scan.sh` - [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) manifest scanning with cluster comparison
- `checkov_baseline_create.sh` - Baseline creation and drift detection workflow
- `checkov_compliance_report.py` - Generate compliance reports (CIS, PCI-DSS, HIPAA, SOC2)
- `ci_integration.sh` - CI/CD integration examples for multiple platforms

### References (`references/`)

- `compliance_mapping.md` - Mapping of Checkov checks to CIS, PCI-DSS, HIPAA, SOC2, NIST
- `custom_policies.md` - Guide for writing custom [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) and YAML policies
- `suppression_guide.md` - Best practices for suppressing false positives
- `terraform_checks.md` - Comprehensive list of Terraform checks with remediation
- `kubernetes_checks.md` - [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md) security checks and pod security standards
- `cloudformation_checks.md` - [CloudFormation](../cloudformation/SKILL.md) security checks with examples

### Assets (`assets/`)

- `checkov_config.yaml` - Checkov configuration file template
- `github_actions.yml` - Complete [GitHub](../../CI_CD/github/SKILL.md) Actions workflow
- `gitlab_ci.yml` - Complete GitLab CI pipeline
- `jenkins_pipeline.groovy` - [Jenkins](../../CI_CD/jenkins/SKILL.md) pipeline template
- `pre_commit_config.yaml` - Pre-[commit](../../CI_CD/commit/SKILL.md) hook configuration
- `custom_policy_template.py` - Template for custom [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) policies
- `policy_metadata.yaml` - Policy metadata for organization-specific policies

## Common Patterns

### Pattern 1: Progressive Compliance Adoption

Gradually increase security posture:

```bash
# Phase 1: Scan without failing (awareness)
checkov -d ./terraform --soft-fail

# Phase 2: Fail only on CRITICAL issues
checkov -d ./terraform --hard-fail-on CRITICAL

# Phase 3: Fail on CRITICAL and HIGH
checkov -d ./terraform --hard-fail-on CRITICAL,HIGH

# Phase 4: Full enforcement with baseline
checkov -d ./terraform --baseline .checkov.baseline
```

### Pattern 2: Multi-Framework Infrastructure

Scan complete infrastructure stack:

```bash
# Use bundled script for comprehensive scanning
python3 scripts/checkov_scan.py \
  --infrastructure-dir ./infrastructure \
  --frameworks terraform,[kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md),dockerfile \
  --output-dir ./security-reports \
  --compliance CIS,PCI-DSS
```

### Pattern 3: [Policy-as-Code](../../../Security/policy-as-code/SKILL.md) Repository

Maintain centralized policy repository:

```
policies/
├── custom_checks/
│   ├── aws/
│   │   ├── require_encryption.py
│   │   └── require_tags.py
│   ├── [kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md)/
│   │   └── require_psp.py
├── .checkov.yaml          # Global config
└── suppression_list.txt   # Approved suppressions
```

### Pattern 4: Compliance-Driven Scanning

Focus on specific compliance requirements:

```bash
# CIS AWS Foundations Benchmark
checkov -d ./terraform --check CIS_AWS

# PCI-DSS compliance
checkov -d ./terraform --framework terraform \
  --check CKV_AWS_19,CKV_AWS_21,CKV_AWS_61 \
  -o json --output-file-path ./pci-dss-report

# HIPAA compliance
checkov -d ./terraform --framework terraform \
  --compact --check CKV_AWS_17,CKV_AWS_19,CKV_AWS_61,CKV_AWS_93
```

## Integration Points

- **CI/CD**: [GitHub](../../CI_CD/github/SKILL.md) Actions, GitLab CI, [Jenkins](../../CI_CD/jenkins/SKILL.md), Azure DevOps, [CircleCI](../../CI_CD/circleci/SKILL.md), Bitbucket Pipelines
- **Version Control**: Pre-[commit](../../CI_CD/commit/SKILL.md) hooks, pull request checks, branch protection rules
- **Cloud Platforms**: AWS, Azure, GCP, OCI, Alibaba Cloud
- **IaC Tools**: Terraform, Terragrunt, [CloudFormation](../cloudformation/SKILL.md), ARM, [Pulumi](../pulumi/SKILL.md)
- **Container Orchestration**: [Kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md), [OpenShift](../../Containers_and_Orchestration/openshift/SKILL.md), EKS, GKE, AKS
- **Policy Engines**: OPA (Open Policy Agent), Sentinel
- **Security Platforms**: Prisma Cloud, Bridgecrew Platform
- **SIEM/Logging**: Export findings to Splunk, Elasticsearch, CloudWatch

## Troubleshooting

### Issue: Too Many Findings Overwhelming Team

**Solution**: Use progressive adoption with baselines:

```bash
# Create baseline with current state
checkov -d ./terraform --create-baseline

# Only fail on new issues
checkov -d ./terraform --baseline .checkov.baseline --soft-fail-on LOW,MEDIUM
```

### Issue: False Positives for Legitimate Use Cases

**Solution**: Use inline suppressions with justification:

```hcl
# Provide clear business justification
resource "aws_security_group" "allow_office" {
  # checkov:skip=CKV_AWS_23:Office IP range needs SSH access for developers
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/24"]  # Office IP range
  }
}
```

### Issue: Scan Takes Too Long

**Solution**: Optimize scan scope:

```bash
# Skip unnecessary paths
checkov -d ./terraform \
  --skip-path .terraform/ \
  --skip-path modules/vendor/ \
  --skip-framework secrets

# Use compact output
checkov -d ./terraform --compact --quiet
```

### Issue: Custom Policies Not Loading

**Solution**: Verify policy structure and loading:

```bash
# Check policy syntax
python3 custom_checks/my_policy.py

# Ensure proper directory structure
checkov -d ./terraform \
  --external-checks-dir ./custom_checks \
  --list

# Debug with verbose output
checkov -d ./terraform --external-checks-dir ./custom_checks -v
```

### Issue: Integration with Private Terraform Modules

**Solution**: Configure module access:

```bash
# Set up Terraform credentials
export TF_TOKEN_app_terraform_io="your-token"

# Download external modules
checkov -d ./terraform --download-external-modules true

# Or scan after terraform init
cd ./terraform && terraform init
checkov -d .
```

## References

- [Checkov Documentation](https://www.checkov.io/)
- [Checkov [GitHub](../../CI_CD/github/SKILL.md) Repository](https://[github](../../CI_CD/github/SKILL.md).com/bridgecrewio/checkov)
- [CIS Benchmarks](https://www.cisecurity.org/[cis-benchmarks](../../Observability_and_SecOps/cis-benchmarks/SKILL.md)/)
- [Terraform Security Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [Kubernetes Pod Security Standards](https://[kubernetes](../../Containers_and_Orchestration/kubernetes/SKILL.md).io/docs/concepts/security/pod-security-standards/)
- [AWS Security Best Practices](https://aws.amazon.com/security/security-resources/)

