---
name: devsecops
description: Apply DevSecOps practices, focusing on automated SAST/DAST scanning
  within CI/CD pipelines.
tags:
  - security
  - devsecops
depends_on: []
---
# DevSecOps: Automated Security Scanning

Embed security directly into CI/CD pipelines to catch vulnerabilities early. Focus on Static Application Security Testing (SAST), Dynamic Application Security Testing (DAST), and Secret Scanning.

## Pipeline Architecture

```[mermaid](../../Product_and_Business/mermaid/SKILL.md)
%%{init: {"theme": "default", "flowchart": {"useMaxWidth": false}}}%%
flowchart TD
    A[Push Code] --> B[Lint & Unit Test]
    B --> C{Security Scans}
    C -->|SAST| D[Semgrep / CodeQL]
    C -->|Secrets| E[TruffleHog / Gitleaks]
    C -->|Dependencies| F[Dependabot / Trivy]
    D & E & F --> G{Gate}
    G -->|Pass| H[Build Image]
    G -->|Fail| I[Block PR]
    H --> J[DAST Scan]
    J --> K[Deploy]
```

## [GitHub](../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Actions Example (SAST & Secrets)

```yaml
name: DevSecOps Pipeline
on: [push, pull_request]

jobs:
  security-scans:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Secret Scanning (TruffleHog)
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ [github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md).event.repository.default_branch }}
          head: HEAD
          extra_args: --only-verified

      - name: SAST Scanning (Semgrep)
        uses: returntocorp/semgrep-action@v1
        with:
          config: "p/default"
```
