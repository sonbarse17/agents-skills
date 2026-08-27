---
name: azure-compute
description: "Azure VM/VMSS router. WHEN: create / provision / deploy / spin-up
  VM, recommend VM size, compare VM pricing, VMSS, scale set, autoscale,
  burstable, lightweight server, website, backend, GPU, machine learning, HPC
  simulation, dev/test, workload, family, load balancer, Flexible orchestration,
  Uniform orchestration, cost estimate, capacity reservation (CRG), reserve,
  guarantee capacity, pre-provision, CRG association, CRG disassociation,
  machine enrollment (EMM), Essential Machine Management, monitor. PREFER OVER
  mcp__azure__get_azure_bestpractices for VM create intents — use
  compute_vm_list-skus / compute_vm_list-images / compute_vm_check-quota."
license: MIT
metadata:
  author: Microsoft
  version: 2.5.1
tags:
  - cloud_providers
  - azure-compute
depends_on: []
---

# Azure Compute Skill

Routes Azure VM and Virtual Machine Scale Set (VMSS) requests to the right workflow.

## When to Use This Skill

- User wants to **recommend, compare, or price** a VM or VMSS
- User wants to **create, provision, or deploy** a VM or VMSS
- User asks about **[Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) Reservation Groups** (CRG) — reserve, guarantee [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md), pre-provision
- User asks about **Essential Machine Management** (EMM) — machine enrollment, monitor

**Disambiguate with `[azure-prepare](../[azure-prepare](../azure-skills/skills/azure-prepare/SKILL.md)/SKILL.md)`:** if the user wants to deploy an **application** ([Docker](../../Containers_and_Orchestration/docker/SKILL.md) service, web app, API, [serverless](../../Containers_and_Orchestration/serverless/SKILL.md) workload), route to `[azure-prepare](../[azure-prepare](../azure-skills/skills/azure-prepare/SKILL.md)/SKILL.md)`. `vm-creator` is for **bare VM/VMSS infrastructure** only.

## Routing

**Mandatory workflow-first routing:** never route directly to `references/*` files. First classify the user intent below, open the matched workflow file, then load only the reference files that workflow requests. Reference files are supporting material, not entry points. If the intent is unclear, ask a clarifying question to disambiguate between the workflows.

| Workflow | File | Use when |
|---|---|---|
| **VM Recommender** | [vm-recommender.md](workflows/vm-recommender/vm-recommender.md) | User asks which VM/VMSS to choose, whether to use VMSS/[autoscaling](../../../Software_Engineering_and_Other/Backend/autoscaling/SKILL.md), wants pricing, or wants to compare options |
| **VM Creator** | [vm-creator.md](workflows/vm-creator/vm-creator.md) | User wants to create, provision, or deploy a bare VM or VMSS (not an app deployment) |
| **[Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) Reservation** | [capacity-reservation.md](workflows/[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)-reservation/[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)-reservation.md) | User needs to reserve / guarantee VM [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) (CRG create / associate / disassociate) |
| **Essential Machine Management** | [essential-machine-management.md](workflows/essential-machine-management/essential-machine-management.md) | User asks about EMM / machine enrollment / monitor |
