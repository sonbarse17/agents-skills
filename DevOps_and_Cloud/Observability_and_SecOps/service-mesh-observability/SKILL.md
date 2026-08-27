---
name: service-mesh-observability
description: Implement comprehensive observability for service meshes including distributed tracing, metrics, and visualization. Use when setting up mesh monitoring, debugging latency issues, or implementing SLOs for service communication.
---

# Service Mesh [Observability](../observability/SKILL.md)

Complete guide to [observability](../observability/SKILL.md) patterns for Istio, Linkerd, and service mesh deployments.

## When to Use This Skill

- Setting up distributed tracing across services
- Implementing service mesh metrics and [dashboards](../../Cloud_Providers/dashboards/SKILL.md)
- Debugging latency and error issues
- Defining SLOs for service communication
- Visualizing service dependencies
- Troubleshooting mesh connectivity

## Core Concepts

### 1. Three Pillars of [Observability](../observability/SKILL.md)

```
┌─────────────────────────────────────────────────────┐
│                  [Observability](../observability/SKILL.md)                       │
├─────────────────┬─────────────────┬─────────────────┤
│     Metrics     │     Traces      │      Logs       │
│                 │                 │                 │
│ • Request rate  │ • Span context  │ • Access logs   │
│ • Error rate    │ • Latency       │ • Error details │
│ • Latency P50   │ • Dependencies  │ • Debug info    │
│ • Saturation    │ • Bottlenecks   │ • [Audit](../../../AI_and_Agents/Operations/audit/SKILL.md) trail   │
└─────────────────┴─────────────────┴─────────────────┘
```

### 2. Golden Signals for Mesh

| Signal         | Description               | Alert Threshold   |
| -------------- | ------------------------- | ----------------- |
| **Latency**    | Request duration P50, P99 | P99 > 500ms       |
| **Traffic**    | Requests per second       | Anomaly detection |
| **Errors**     | 5xx error rate            | > 1%              |
| **Saturation** | Resource utilization      | > 80%             |

## Templates and detailed worked examples

Full template library and detailed worked examples live in `../../../Global_References/[service-mesh](../service-mesh/SKILL.md)-observability_details.md`. Read that file when you need the concrete templates.

## Best Practices

### Do's

- **Sample appropriately** - 100% in dev, 1-10% in prod
- **Use trace context** - Propagate headers consistently
- **Set up alerts** - For golden signals
- **Correlate metrics/traces** - Use exemplars
- **Retain strategically** - Hot/cold storage tiers

### Don'ts

- **Don't over-sample** - Storage costs add up
- **Don't ignore cardinality** - Limit label values
- **Don't skip [dashboards](../../Cloud_Providers/dashboards/SKILL.md)** - Visualize dependencies
- **Don't forget costs** - Monitor [observability](../observability/SKILL.md) costs

