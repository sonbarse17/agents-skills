---
name: appinsights-instrumentation
description: "Guidance for instrumenting webapps with Azure Application
  Insights. Provides telemetry patterns, SDK setup, and configuration
  references. WHEN: how to instrument app, App Insights SDK, telemetry patterns,
  what is App Insights, Application Insights guidance, instrumentation examples,
  APM best practices."
license: MIT
metadata:
  author: Microsoft
  version: 1.2.1
tags:
  - cloud_providers
  - appinsights-instrumentation
depends_on: []
---

# AppInsights Instrumentation Guide

This skill provides **guidance and reference material** for instrumenting webapps with Azure Application Insights.

> **⛔ ADDING COMPONENTS?**
>
> If the user wants to **add App Insights to their app**, invoke **[azure-prepare](../[azure-prepare](../azure-skills/skills/azure-prepare/SKILL.md)/SKILL.md)** instead.
> This skill provides reference material—[azure-prepare](../[azure-prepare](../azure-skills/skills/azure-prepare/SKILL.md)/SKILL.md) orchestrates the actual changes.

## When to Use This Skill

- User asks **how** to instrument (guidance, patterns, examples)
- User needs SDK setup instructions
- [azure-prepare](../[azure-prepare](../azure-skills/skills/azure-prepare/SKILL.md)/SKILL.md) invokes this skill during research phase
- User wants to understand App Insights concepts

## When to Use [azure-prepare](../[azure-prepare](../azure-skills/skills/azure-prepare/SKILL.md)/SKILL.md) Instead

- User says "add telemetry to my app"
- User says "add App Insights" 
- User wants to modify their project
- Any request to change/add components

## Prerequisites

The app in the workspace must be one of these kinds

- An ASP.NET Core app hosted in Azure
- A Node.js app hosted in Azure

## Guidelines

### Collect context information

Find out the (programming language, application framework, hosting) tuple of the application the user is trying to add telemetry support in. This determines how the application can be instrumented. Read the source code to make an educated guess. Confirm with the user on anything you don't know. You must always ask the user where the application is hosted (e.g. on a personal computer, in an Azure App Service as code, in an Azure App Service as container, in an Azure Container App, etc.). 

### Prefer auto-instrument if possible

If the app is a C# ASP.NET Core app hosted in Azure App Service, use [AUTO guide](../../../Global_References/auto.md) to help user auto-instrument the app.

### Manually instrument

Manually instrument the app by creating the AppInsights resource and update the app's code. 

#### Create AppInsights resource

Use one of the following options that fits the environment.

- Add AppInsights to existing Bicep template. See [examples/appinsights.bicep](examples/appinsights.bicep) for what to add. This is the best option if there are existing Bicep template files in the workspace.
- Use Azure CLI. See [scripts/appinsights.ps1](scripts/appinsights.ps1) for what Azure CLI command to execute to create the App Insights resource.

No matter which option you choose, recommend the user to create the App Insights resource in a meaningful resource group that makes managing resources easier. A good candidate will be the same resource group that contains the resources for the hosted app in Azure.

#### Modify application code

- If the app is an ASP.NET Core app, see [ASPNETCORE guide](../../../Global_References/aspnetcore.md) for how to modify the C# code.
- If the app is a Node.js app, see [NODEJS guide](../../../Global_References/nodejs.md) for how to modify the JavaScript/[TypeScript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md) code.
- If the app is a [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) app, see [PYTHON guide](../../../Global_References/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md).md) for how to modify the [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) code.

## SDK Quick References

- **[OpenTelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) Distro**: [Python](references/sdk/[azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-py](../[azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-py](../azure-sdk-[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/skills/azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-py/SKILL.md)/SKILL.md).md) | [TypeScript](references/sdk/[azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-ts](../[azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-ts](../azure-sdk-[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)/skills/azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-ts/SKILL.md)/SKILL.md).md)
- **[OpenTelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) Exporter**: [Python](references/sdk/[azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-py](../[azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-py](../azure-sdk-[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/skills/azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-py/SKILL.md)/SKILL.md).md) | [Java](references/sdk/[azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-java](../[azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-java](../azure-sdk-java/skills/azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-java/SKILL.md)/SKILL.md).md)

## Platform-Specific Guides

- **Container Apps**: [Observability Guide](../../../Global_References/container-apps.md)

