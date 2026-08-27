---
name: prometheus-configuration
description: Set up Prometheus for comprehensive metric collection, storage, and monitoring of infrastructure and applications. Use when implementing metrics collection, setting up monitoring infrastructure, or configuring alerting systems.
---

# Prometheus Configuration

Complete guide to Prometheus setup, metric collection, scrape configuration, and recording rules.

## Purpose

Configure Prometheus for comprehensive metric collection, [alerting](../alerting/SKILL.md), and [monitoring](../monitoring/SKILL.md) of infrastructure and applications.

## When to Use

- Set up Prometheus [monitoring](../monitoring/SKILL.md)
- Configure metric scraping
- Create recording rules
- Design alert rules
- Implement service discovery

## Detailed patterns and worked examples

Detailed pattern documentation lives in `../../../Global_References/prometheus-configuration_details.md`. Read that file when the navigation tier above is insufficient.

## Best Practices

1. **Use consistent naming** for metrics (prefix_name_unit)
2. **Set appropriate scrape intervals** (15-60s typical)
3. **Use recording rules** for expensive queries
4. **Implement high availability** (multiple Prometheus instances)
5. **Configure retention** based on storage [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../../Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../capacity/SKILL.md)/SKILL.md)/SKILL.md)
6. **Use relabeling** for metric cleanup
7. **Monitor Prometheus itself**
8. **Implement federation** for large deployments
9. **Use Thanos/Cortex** for long-term storage
10. **Document custom metrics**

## Troubleshooting

**Check scrape targets:**

```bash
curl http://localhost:9090/api/v1/targets
```

**Check configuration:**

```bash
curl http://localhost:9090/api/v1/status/config
```

**Test query:**

```bash
curl 'http://localhost:9090/api/v1/query?query=up'
```


## Related Skills

- `[grafana-dashboards](../grafana-[dashboards](../../Cloud_Providers/dashboards/SKILL.md)/SKILL.md)` - For visualization
- `[slo-implementation](../slo-implementation/SKILL.md)` - For SLO [monitoring](../monitoring/SKILL.md)
- `[distributed-tracing](../distributed-tracing/SKILL.md)` - For request tracing

