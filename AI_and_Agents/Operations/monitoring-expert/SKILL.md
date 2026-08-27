---
name: monitoring-expert
description: Configures monitoring systems, implements structured logging
  pipelines, creates Prometheus/Grafana dashboards, defines alerting rules, and
  instruments distributed tracing. Implements Prometheus/Grafana stacks,
  conducts load testing, performs application profiling, and plans
  infrastructure capacity. Use when setting up application monitoring, adding
  observability to services, debugging production issues with
  logs/metrics/traces, running load tests with k6 or Artillery, profiling
  CPU/memory bottlenecks, or forecasting capacity needs.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: 1.1.0
  domain: devops
  triggers: monitoring, observability, logging, metrics, tracing, alerting,
    Prometheus, Grafana, DataDog, APM, performance testing, load testing,
    profiling, capacity planning, bottleneck
  role: specialist
  scope: implementation
  output-format: code
  related-skills: devops-engineer, debugging-wizard, architecture-designer
tags:
  - operations
  - monitoring-expert
depends_on: []
---

# [Monitoring](../../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) Expert

[Observability](../../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md) and performance specialist implementing comprehensive [monitoring](../../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md), [alerting](../../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md), tracing, and performance testing systems.

## Core Workflow

1. **Assess** — Identify what needs [monitoring](../../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) (SLIs, critical paths, business metrics)
2. **Instrument** — Add logging, metrics, and traces to the application (see examples below)
3. **Collect** — Configure aggregation and storage (Prometheus scrape, log shipper, OTLP endpoint); verify data arrives before proceeding
4. **Visualize** — Build [dashboards](../../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md) using RED (Rate/Errors/Duration) or USE (Utilization/Saturation/Errors) methods
5. **Alert** — Define threshold and anomaly alerts on critical paths; validate no false-positive flood before shipping

## Quick-Start Examples

### Structured Logging (Node.js / Pino)
```js
import pino from 'pino';

const logger = pino({ level: 'info' });

// Good — structured fields, includes correlation ID
logger.info({ requestId: req.id, userId: req.user.id, durationMs: elapsed }, 'order.created');

// Bad — string interpolation, no correlation
console.log(`Order created for user ${userId}`);
```

### Prometheus Metrics (Node.js)
```js
import { Counter, Histogram, register } from 'prom-client';

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Instrument a route
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
    end();
  });
  next();
});

// Expose scrape endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### [OpenTelemetry](../../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md) Tracing (Node.js)
```js
import { NodeSDK } from '@[opentelemetry](../../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md)/sdk-node';
import { OTLPTraceExporter } from '@[opentelemetry](../../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md)/exporter-trace-otlp-http';
import { trace } from '@[opentelemetry](../../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md)/api';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://jaeger:4318/v1/traces' }),
});
sdk.start();

// Manual span around a critical operation
const tracer = trace.getTracer('order-service');
async function processOrder(orderId) {
  const span = tracer.startSpan('order.process');
  span.setAttribute('order.id', orderId);
  try {
    const result = await db.saveOrder(orderId);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw err;
  } finally {
    span.end();
  }
}
```

### Prometheus [Alerting](../../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md) Rule
```yaml
groups:
  - name: api.rules
    rules:
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m])
          / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Error rate above 5% on {{ $labels.route }}"
```

### k6 Load Test
```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp up
    { duration: '5m', target: 50 },   // sustained load
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95th percentile < 500 ms
    http_req_failed:   ['rate<0.01'],  // error rate < 1%
  },
};

export default function () {
  const res = http.get('https://api.example.com/orders');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

## Reference Guide

Load detailed guidance based on context:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Logging | `../../../Global_References/structured-logging.md` | Pino, JSON logging |
| Metrics | `../../../Global_References/prometheus-metrics.md` | Counter, Histogram, Gauge |
| Tracing | `../../../Global_References/[opentelemetry](../../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md).md` | [OpenTelemetry](../../../DevOps_and_Cloud/Observability_and_SecOps/opentelemetry/SKILL.md), spans |
| [Alerting](../../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md) | `../../../Global_References/[alerting](../../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md)-rules.md` | Prometheus alerts |
| [Dashboards](../../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md) | `../../../Global_References/[dashboards](../../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md).md` | RED/USE method, Grafana |
| Performance Testing | `../../../Global_References/[monitoring](../../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md)-expert_performance-testing.md` | Load testing, k6, Artillery, benchmarks |
| [Profiling](../../../Software_Engineering_and_Other/Frontend/profiling/SKILL.md) | `../../../Global_References/application-[profiling](../../../Software_Engineering_and_Other/Frontend/profiling/SKILL.md).md` | CPU/memory [profiling](../../../Software_Engineering_and_Other/Frontend/profiling/SKILL.md), bottlenecks |
| [Capacity](../../Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) Planning | `../../../Global_References/[capacity-planning](../../../DevOps_and_Cloud/Observability_and_SecOps/[capacity](../../Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)-planning/SKILL.md).md` | Scaling, forecasting, budgets |

## Constraints

### MUST DO
- Use structured logging (JSON)
- Include request IDs for correlation
- Set up alerts for critical paths
- Monitor business metrics, not just technical
- Use appropriate metric types (counter/gauge/histogram)
- Implement health check endpoints

### MUST NOT DO
- Log sensitive data (passwords, tokens, PII)
- Alert on every error (alert fatigue)
- Use string interpolation in logs (use structured fields)
- Skip correlation IDs in distributed systems

[Documentation](https://jeffallan.[github](../../../DevOps_and_Cloud/CI_CD/github/SKILL.md).io/claude-skills/skills/devops/[monitoring](../../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md)-expert/)

