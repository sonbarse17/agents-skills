---
name: observability-edot-python-migrate
description: >
  Migrate a Python application from the classic Elastic APM Python agent to the
  EDOT Python agent. Use when switching from elastic-apm to
  elastic-opentelemetry.
metadata:
  author: elastic
  version: 0.1.0
tags:
  - observability_and_secops
  - edot-python-migrate
depends_on: []
---

# EDOT [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) Migration

Read the migration guide before making changes:

- [Migration guide](https://www.elastic.co/docs/reference/[opentelemetry](../opentelemetry/SKILL.md)/edot-sdks/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/migration)
- [EDOT [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) setup](https://www.elastic.co/docs/reference/[opentelemetry](../opentelemetry/SKILL.md)/edot-sdks/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/setup)
- [EDOT [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) configuration](https://www.elastic.co/docs/reference/[opentelemetry](../opentelemetry/SKILL.md)/edot-sdks/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/configuration)

## Guidelines

1. Remove ALL classic APM references: `elastic-apm` from requirements, `ElasticAPM(app)` / `elasticapm.contrib.*` from
   application code, `app.config['ELASTIC_APM']` blocks, and all `ELASTIC_APM_*` env vars
1. Install `elastic-[opentelemetry](../opentelemetry/SKILL.md)` via pip (add to `requirements.txt` or equivalent)
1. Run `edot-bootstrap --action=install` during image build to install auto-instrumentation packages for detected
   libraries
1. Wrap the application entrypoint with `[opentelemetry](../opentelemetry/SKILL.md)-instrument` — e.g. `[opentelemetry](../opentelemetry/SKILL.md)-instrument gunicorn app:app`.
   Without this, no telemetry is collected
1. Set exactly three required environment variables:
   - `OTEL_SERVICE_NAME` (replaces `ELASTIC_APM_SERVICE_NAME`)
   - `OTEL_EXPORTER_OTLP_ENDPOINT` — must be the **managed OTLP endpoint** or **EDOT Collector** URL. Do NOT reuse the
     old `ELASTIC_APM_SERVER_URL` value. Never use an APM Server URL (no `apm-server`, no `:8200`, no
     `/intake/v2/events`)
   - `OTEL_EXPORTER_OTLP_HEADERS` — `"Authorization=ApiKey <key>"` or `"Authorization=Bearer <token>"` (replaces
     `ELASTIC_APM_SECRET_TOKEN`)
1. Do NOT set `OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER`, or `OTEL_LOGS_EXPORTER` — the defaults are already
   correct
1. Never run both classic `elastic-apm` and EDOT on the same application

## Examples

See the [EDOT [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) migration guide](https://www.elastic.co/docs/reference/[opentelemetry](../opentelemetry/SKILL.md)/edot-sdks/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/migration)
for complete examples.
