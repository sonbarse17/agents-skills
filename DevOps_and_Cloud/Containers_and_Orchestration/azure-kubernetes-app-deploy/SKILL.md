---
name: azure-kubernetes-app-deploy
license: MIT
metadata:
  author: Microsoft
  version: 1.0.0
description: "Use when deploying an existing web application or API to an
  already-running Azure Kubernetes Service cluster. Detects the framework,
  generates a Dockerfile and Kubernetes manifests, validates against AKS
  Deployment Safeguards, and deploys with verification. WHEN: deploy app to AKS,
  deploy to existing AKS cluster, containerize app for Kubernetes, generate K8s
  manifests for Azure, set up CI/CD for AKS, my AKS deployment is failing
  safeguard checks, I have a Django/Express/Spring Boot app to run on AKS. DO
  NOT USE FOR: creating or provisioning an AKS cluster (use azure-kubernetes),
  assessing migration to AKS Automatic (use
  azure-kubernetes-automatic-readiness), or deploying to non-AKS targets like
  Web Apps, Container Apps, or Functions."
tags:
  - containers_and_orchestration
  - azure-kubernetes-app-deploy
depends_on: []
---

# Deploy to AKS

**Use when:** deploying a web app/API to AKS; containerizing for [Kubernetes](../kubernetes/SKILL.md); generating manifests; AKS CI/CD; DS001–DS013 failures.

**Not for:** provisioning clusters (`[azure-kubernetes](../../Cloud_Providers/azure-skills/skills/[azure-kubernetes](../azure-[kubernetes](../kubernetes/SKILL.md)/SKILL.md)/SKILL.md)`), AKS Automatic readiness (`[azure-[kubernetes](../kubernetes/SKILL.md)-automatic-readiness](../../Cloud_Providers/azure-skills/skills/[azure-kubernetes](../../Cloud_Providers/azure-skills/skills/[azure-kubernetes](../azure-[kubernetes](../kubernetes/SKILL.md)/SKILL.md)/SKILL.md)/[azure-[kubernetes](../kubernetes/SKILL.md)-automatic-readiness](../[azure-kubernetes](../../Cloud_Providers/azure-skills/skills/[azure-kubernetes](../azure-[kubernetes](../kubernetes/SKILL.md)/SKILL.md)/SKILL.md)/[azure-[kubernetes](../kubernetes/SKILL.md)-automatic-readiness](../[azure-kubernetes](../../Cloud_Providers/azure-skills/skills/[azure-kubernetes](../azure-[kubernetes](../kubernetes/SKILL.md)/SKILL.md)/SKILL.md)-automatic-readiness/SKILL.md)/SKILL.md)/SKILL.md)`), non-AKS targets.

## Workflow

Requires: existing AKS cluster, `az login`, `[kubectl](../kubectl/SKILL.md)` configured. Follow `phases/quick-deploy.md`. On failure: `../../../Global_References/rollback.md`.

## References

- [detection.md](./../../../Global_References/detection.md) — framework/port/health detection
- [safeguards.md](./../../../Global_References/safeguards.md) — DS001-DS013 checklist
- [workload-identity.md](./../../../Global_References/workload-identity.md) — Workload Identity setup
- [rollback.md](./../../../Global_References/rollback.md) — recovery procedures
- [base-images.md](./../../../Global_References/base-images.md) — base image policy and `<LATEST_STABLE_*>` resolution

## Knowledge Packs

Load `knowledge-packs/frameworks/<framework>.md` per detected framework. Available: `spring-boot`, `express`, `nextjs`, `fastapi`, `django`, `nestjs`, `aspnet-core`, `go`, `flask`

## Templates

`templates/` (dockerfiles/, k8s/, [github-actions](../../CI_CD/[github](../../CI_CD/github/SKILL.md)-actions/SKILL.md)/, [mermaid](../../../Product_and_Business/mermaid/SKILL.md)/).

