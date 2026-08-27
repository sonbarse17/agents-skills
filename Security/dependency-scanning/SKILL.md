---
name: dependency-scanning
description: Scan package dependencies for known vulnerabilities using Snyk,
  Dependabot, and OWASP Dependency-Check. Identify and remediate vulnerable
  libraries in your software supply chain. Use when managing third-party
  dependencies or implementing software composition analysis.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
tags:
  - security
  - dependency-scanning
depends_on: []
---

# Dependency Scanning

Identify vulnerabilities in third-party dependencies and libraries.

## When to Use This Skill

Use this skill when:
- Managing third-party dependencies
- Implementing software composition analysis
- Meeting compliance requirements
- Securing the software supply chain
- Automating vulnerability detection

## Prerequisites

- Package manifest files (package.json, requirements.txt, etc.)
- CI/CD pipeline access
- Dependency scanning tool

## Tool Comparison

| Tool | Type | Languages | Best For |
|------|------|-----------|----------|
| Snyk | Commercial/Free | Many | Comprehensive SCA |
| Dependabot | Free ([GitHub](../../DevOps_and_Cloud/CI_CD/github/SKILL.md)) | Many | Automated PRs |
| OWASP Dep-Check | OSS | Many | Free scanning |
| npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md) | Built-in | Node.js | Quick checks |
| pip-[audit](../../AI_and_Agents/Operations/audit/SKILL.md) | OSS | [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md) | [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md) projects |
| Trivy | OSS | Many | Container deps |

## Snyk

### CLI Usage

```bash
# Install
npm install -g snyk

# Authenticate
snyk auth

# Test project
snyk test

# Monitor project (track over time)
snyk monitor

# Test specific manifest
snyk test --file=package.json
snyk test --file=requirements.txt

# Output formats
snyk test --json > snyk-results.json
snyk test --sarif > snyk-results.sarif

# Fix vulnerabilities
snyk fix

# Ignore vulnerability
snyk ignore --id=SNYK-JS-LODASH-567746 --expiry=2024-12-31 --reason="No exploit path"
```

### CI Integration

```yaml
# .[github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md)/workflows/snyk.yml
name: Snyk Security

on:
  push:
    branches: [main]
  pull_request:

jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Upload results to [GitHub](../../DevOps_and_Cloud/CI_CD/github/SKILL.md)
        uses: [github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md)/codeql-action/upload-sarif@v3
        with:
          sarif_file: snyk.sarif
```

### Policy File

```yaml
# .snyk
version: v1.25.0
ignore:
  SNYK-JS-LODASH-567746:
    - '*':
        reason: No user input reaches this function
        expires: 2024-12-31
        created: 2024-01-15

  'snyk:lic:npm:gpl-3.0':
    - '*':
        reason: Internal use only
        
patch: {}
```

## [GitHub](../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Dependabot

### Configuration

```yaml
# .[github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md)/dependabot.yml
version: 2
updates:
  # JavaScript/Node.js
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    ignore:
      - dependency-name: "aws-sdk"
        update-types: ["version-update:semver-major"]
    groups:
      development-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"

  # [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "daily"
    
  # [Docker](../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)
  - package-ecosystem: "[docker](../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md)"
    directory: "/"
    schedule:
      interval: "weekly"
    
  # [GitHub](../../DevOps_and_Cloud/CI_CD/github/SKILL.md) Actions
  - package-ecosystem: "[github-actions](../../DevOps_and_Cloud/CI_CD/[github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md)-actions/SKILL.md)"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Security Alerts

```yaml
# Automated security updates
# Enable in repository Settings > Security > Dependabot

# Dependabot will automatically:
# - Create PRs for vulnerable dependencies
# - Update to patched versions
# - Provide CVE details in PR description
```

## OWASP Dependency-Check

### Installation

```bash
# Download
wget https://[github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md).com/jeremylong/DependencyCheck/releases/download/v9.0.0/dependency-check-9.0.0-release.zip
unzip dependency-check-9.0.0-release.zip

# Or via Homebrew
brew install dependency-check
```

### Usage

```bash
# Scan project
dependency-check --project "MyProject" \
  --scan /path/to/project \
  --out /path/to/reports \
  --format HTML \
  --format JSON

# With specific analyzers
dependency-check --project "MyProject" \
  --scan . \
  --enableExperimental \
  --disableRetireJS

# CI configuration
dependency-check --project "MyProject" \
  --scan . \
  --format JSON \
  --failOnCVSS 7 \
  --suppression suppression.xml
```

### Suppression File

```xml
<!-- suppression.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<suppressions xmlns="https://jeremylong.[github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md).io/DependencyCheck/dependency-suppression.1.3.xsd">
  <suppress>
    <notes>False positive - not using vulnerable function</notes>
    <packageUrl regex="true">^pkg:npm/lodash@.*$</packageUrl>
    <cve>CVE-2021-23337</cve>
  </suppress>
  
  <suppress until="2024-12-31">
    <notes>Risk accepted - mitigated by WAF</notes>
    <cpe>cpe:/a:apache:struts:2.5.0</cpe>
    <vulnerabilityName>CVE-2023-12345</vulnerabilityName>
  </suppress>
</suppressions>
```

### Maven Integration

```xml
<!-- pom.xml -->
<plugin>
  <groupId>org.owasp</groupId>
  <artifactId>dependency-check-maven</artifactId>
  <version>9.0.0</version>
  <configuration>
    <failBuildOnCVSS>7</failBuildOnCVSS>
    <suppressionFiles>
      <suppressionFile>suppression.xml</suppressionFile>
    </suppressionFiles>
  </configuration>
  <executions>
    <execution>
      <goals>
        <goal>check</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

## Language-Specific Tools

### Node.js (npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md))

```bash
# Run [audit](../../AI_and_Agents/Operations/audit/SKILL.md)
npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md)

# JSON output
npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md) --json

# Fix automatically
npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md) fix

# Fix with breaking changes
npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md) fix --force

# Production only
npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md) --production
```

### [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md) (pip-[audit](../../AI_and_Agents/Operations/audit/SKILL.md))

```bash
# Install
pip install pip-[audit](../../AI_and_Agents/Operations/audit/SKILL.md)

# Scan installed packages
pip-[audit](../../AI_and_Agents/Operations/audit/SKILL.md)

# Scan requirements file
pip-[audit](../../AI_and_Agents/Operations/audit/SKILL.md) -r requirements.txt

# Output formats
pip-[audit](../../AI_and_Agents/Operations/audit/SKILL.md) --format json
pip-[audit](../../AI_and_Agents/Operations/audit/SKILL.md) --format cyclonedx-json

# Fix vulnerabilities
pip-[audit](../../AI_and_Agents/Operations/audit/SKILL.md) --fix
```

### Go (govulncheck)

```bash
# Install
go install golang.org/x/vuln/cmd/govulncheck@latest

# Scan project
govulncheck ./...

# JSON output
govulncheck -json ./...
```

### Ruby (bundler-[audit](../../AI_and_Agents/Operations/audit/SKILL.md))

```bash
# Install
gem install bundler-[audit](../../AI_and_Agents/Operations/audit/SKILL.md)

# Update database
bundle-[audit](../../AI_and_Agents/Operations/audit/SKILL.md) update

# Run [audit](../../AI_and_Agents/Operations/audit/SKILL.md)
bundle-[audit](../../AI_and_Agents/Operations/audit/SKILL.md) check

# Output format
bundle-[audit](../../AI_and_Agents/Operations/audit/SKILL.md) check --format json
```

## SBOM Generation

### CycloneDX

```bash
# Node.js
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# [Python](../../Software_Engineering_and_Other/Languages/python/SKILL.md)
pip install cyclonedx-bom
cyclonedx-py -o sbom.json

# Go
go install [github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md).com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest
cyclonedx-gomod mod -json > sbom.json
```

### Syft

```bash
# Install
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s

# Generate SBOM
syft dir:/path/to/project -o cyclonedx-json > sbom.json
syft dir:/path/to/project -o spdx-json > sbom-spdx.json

# From container
syft myimage:latest -o cyclonedx-json > sbom.json
```

## CI/CD Pipeline

```yaml
# Comprehensive dependency scanning
name: Dependency Security

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 8 * * *'

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md)
        run: npm [audit](../../AI_and_Agents/Operations/audit/SKILL.md) --[audit](../../AI_and_Agents/Operations/audit/SKILL.md)-level=high

      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          
      - name: Generate SBOM
        run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json

      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.json
```

## Common Issues

### Issue: Too Many Alerts
**Problem**: Overwhelmed by vulnerability count
**Solution**: Prioritize by exploitability, filter by severity

### Issue: No Fix Available
**Problem**: Vulnerable dependency has no patch
**Solution**: Consider alternatives, implement compensating controls

### Issue: Breaking Updates
**Problem**: Security fix breaks functionality
**Solution**: Review changelogs, test thoroughly, use lockfiles

## Best Practices

- Scan on every build
- Use lockfiles for reproducibility
- Set severity thresholds
- Generate and track SBOMs
- Document exceptions properly
- Update dependencies regularly
- Monitor for new vulnerabilities
- Automate PR creation for updates

## Related Skills

- [sast-scanning](../[sast-scanning](../sast-scanning/SKILL.md)/) - Code vulnerabilities
- [container-scanning](../[container-scanning](../../DevOps_and_Cloud/Containers_and_Orchestration/container-scanning/SKILL.md)/) - Container dependencies
- [github-actions](../../../devops/ci-cd/[github-actions](../../DevOps_and_Cloud/CI_CD/[github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md)-actions/SKILL.md)/) - CI integration
