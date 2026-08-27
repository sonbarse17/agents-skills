---
name: deploy-model
description: "Unified Azure OpenAI model deployment skill with intelligent intent-based routing. Handles quick preset deployments, fully customized deployments (version/SKU/capacity/RAI policy), and capacity discovery across regions and projects. USE FOR: deploy model, deploy gpt, create deployment, model deployment, deploy openai model, set up model, provision model, find capacity, check model availability, where can I deploy, best region for model, capacity analysis. DO NOT USE FOR: listing existing deployments (use foundry_models_deployments_list MCP tool), deleting deployments, agent creation (use agent/create), project creation (use project/create)."
license: MIT
metadata:
  author: Microsoft
  version: "1.0.0"
---

# Deploy Model

> **Scope — read this first.** This skill creates model deployments **out-of-band** via Azure CLI / MCP / portal. For azd-managed Foundry projects (those scaffolded from `azd ai agent init`), declare deployments in `azure.yaml services.ai-project.deployments[]` instead — `azd ai agent init` writes the entry from the sample manifest and `azd provision` creates the deployment through Bicep. See [foundry-agent/create/create-hosted.md](../../foundry-agent/create/create-hosted.md) for the Golden Path. Use this skill only for: (a) Foundry projects not managed by an azd project, (b) ad-hoc deployments outside the azd lifecycle.

Unified entry point for all Azure OpenAI model deployment workflows. Analyzes user intent and routes to the appropriate deployment mode.

## Quick Reference

| Mode | When to Use | Sub-Skill |
|------|-------------|-----------|
| **[Preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)** | Quick deployment, no customization needed | [preset/SKILL.md]([preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)/SKILL.md) |
| **[Customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)** | Full control: version, SKU, [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md), RAI policy | [customize/SKILL.md]([customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)/SKILL.md) |
| **[Capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) Discovery** | Find where you can deploy with specific [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) | [capacity/SKILL.md]([capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)/SKILL.md) |

## Intent Detection

Analyze the user's prompt and route to the correct mode:

```
User Prompt
    │
    ├─ Simple deployment (no modifiers)
    │  "deploy gpt-4o", "set up a model"
    │  └─> [PRESET]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md) mode
    │
    ├─ Customization keywords present
    │  "custom settings", "choose version", "select SKU",
    │  "set [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) to X", "configure content filter",
    │  "PTU deployment", "with specific quota"
    │  └─> [CUSTOMIZE]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md) mode
    │
    ├─ [Capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)/availability query
    │  "find where I can deploy", "check [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)",
    │  "which region has X [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)", "best region for 10K TPM",
    │  "where is this model available"
    │  └─> [CAPACITY]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) DISCOVERY mode
    │
    └─ Ambiguous (has [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) target + deploy intent)
       "deploy gpt-4o with 10K [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) to best region"
       └─> [CAPACITY]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) DISCOVERY first → then [PRESET]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md) or [CUSTOMIZE]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)
```

### Routing Rules

| Signal in Prompt | Route To | Reason |
|------------------|----------|--------|
| Just model name, no options | **[Preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)** | User wants quick deployment |
| "custom", "configure", "choose", "select" | **[Customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)** | User wants control |
| "find", "check", "where", "which region", "available" | **[Capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)** | User wants discovery |
| Specific [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) number + "best region" | **[Capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) → [Preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)** | Discover then deploy quickly |
| Specific [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) number + "custom" keywords | **[Capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) → [Customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)** | Discover then deploy with options |
| "PTU", "provisioned throughput" | **[Customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)** | PTU requires SKU selection |
| "optimal region", "best region" (no [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) target) | **[Preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)** | Region optimization is [preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)'s specialty |

### Multi-Mode Chaining

Some prompts require two modes in sequence:

**Pattern: [Capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) → Deploy**
When a user specifies a [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) requirement AND wants deployment:
1. Run **[Capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) Discovery** to find regions/projects with sufficient quota
2. Present findings to user
3. Ask: "Would you like to deploy with **quick defaults** or **[customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md) settings**?"
4. Route to **[Preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)** or **[Customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)** based on answer

> 💡 **Tip:** If unsure which mode the user wants, default to **[Preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)** (quick deployment). Users who want customization will typically use explicit keywords like "custom", "configure", or "with specific settings".

## Project Selection (All Modes)

Before any deployment, resolve which project to deploy to. This applies to **all** modes ([preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md), [customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md), and after [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) discovery).

### Resolution Order

1. **Check `PROJECT_RESOURCE_ID` env var** — if set, use it as the default
2. **Check user prompt** — if user named a specific project or region, use that
3. **If neither** — query the user's projects and suggest the current one

### Confirmation Step (Required)

**Always confirm the target before deploying.** Show the user what will be used and give them a chance to change it:

```
Deploying to:
  Project:  <project-name>
  Region:   <region>
  Resource: <resource-group>

Is this correct? Or choose a different project:
  1. ✅ Yes, deploy here (default)
  2. 📋 Show me other projects in this region
  3. 🌍 Choose a different region
```

If user picks option 2, show top 5 projects in that region:

```
Projects in <region>:
  1. project-alpha (rg-alpha)
  2. project-beta (rg-beta)
  3. project-gamma (rg-gamma)
  ...
```

> ⚠️ **Never deploy without showing the user which project will be used.** This prevents accidental deployments to the wrong resource.

## Pre-Deployment Validation (All Modes)

Before presenting any deployment options (SKU, [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)), always validate both of these:

1. **Model supports the SKU** — query the model catalog to confirm the selected model+version supports the target SKU:
   ```bash
   az cognitiveservices model list --location <region> --subscription <sub-id> -o json
   ```
   Filter for the model, extract `.model.skus[].name` to get supported SKUs.

2. **Subscription has available quota** — check that the user's subscription has unallocated quota for the SKU+model combination:
   ```bash
   az cognitiveservices usage list --location <region> --subscription <sub-id> -o json
   ```
   Match by usage name pattern `OpenAI.<SKU>.<model-name>` (e.g., `OpenAI.GlobalStandard.gpt-4o`). Compute `available = limit - currentValue`.

> ⚠️ **Warning:** Only present options that pass both checks. Do NOT show hardcoded SKU lists — always query dynamically. SKUs with 0 available quota should be shown as ❌ informational items, not selectable options.

> 💡 **Quota management:** For quota increase requests, usage [monitoring](../../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md), and troubleshooting quota errors, defer to the [quota skill](../../quota/quota.md) instead of duplicating that guidance inline.

## Prerequisites

All deployment modes require:
- Azure CLI installed and authenticated (`az login`)
- Active Azure subscription with deployment permissions
- Microsoft Foundry project resource ID (or agent will help discover it via `PROJECT_RESOURCE_ID` env var)

## Sub-Skills

- **[preset/SKILL.md]([preset]([preset](../../Models_and_FineTuning/[preset](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/preset/SKILL.md)/SKILL.md)/SKILL.md)/SKILL.md)** — Quick deployment to optimal region with sensible defaults
- **[customize/SKILL.md]([customize]([customize](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)/SKILL.md)** — Interactive guided flow with full configuration control
- **[capacity/SKILL.md]([capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)/SKILL.md)** — Discover available [capacity]([capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) across regions and projects
