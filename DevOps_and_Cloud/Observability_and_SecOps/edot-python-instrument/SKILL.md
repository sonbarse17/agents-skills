---
name: observability-edot-python-instrument
description: >
  Instrument a Python application with the Elastic Distribution of OpenTelemetry
  (EDOT) Python agent for automatic tracing, metrics, and logs. Use when adding
  observability to a Python service that has no existing APM agent.
metadata:
  author: elastic
  version: 0.1.0
tags:
  - observability_and_secops
  - edot-python-instrument
depends_on: []
---

# EDOT [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) Instrumentation

Read the setup guide before making changes:

- [EDOT [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) setup](https://www.elastic.co/docs/reference/[opentelemetry](../opentelemetry/SKILL.md)/edot-sdks/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/setup)
- [EDOT [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) configuration](https://www.elastic.co/docs/reference/[opentelemetry](../opentelemetry/SKILL.md)/edot-sdks/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/configuration)
- [OpenTelemetry [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) auto-instrumentation](https://[opentelemetry](../opentelemetry/SKILL.md).io/docs/zero-code/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/)

## Guidelines

1. Install `elastic-[opentelemetry](../opentelemetry/SKILL.md)` via pip (add to `requirements.txt` or equivalent)
1. Run `edot-bootstrap --action=install` during image build to install auto-instrumentation packages for detected
   libraries
1. Wrap the application entrypoint with `[opentelemetry](../opentelemetry/SKILL.md)-instrument` — e.g. `[opentelemetry](../opentelemetry/SKILL.md)-instrument gunicorn app:app` or
   `[opentelemetry](../opentelemetry/SKILL.md)-instrument [python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) app.py`. Without this, no telemetry is collected
1. Set exactly three required environment variables:
   - `OTEL_SERVICE_NAME`
   - `OTEL_EXPORTER_OTLP_ENDPOINT` — must be the **managed OTLP endpoint** or **EDOT Collector** URL. Never use an APM
     Server URL (no `apm-server`, no `:8200`, no `/intake/v2/events`)
   - `OTEL_EXPORTER_OTLP_HEADERS` — `"Authorization=ApiKey <key>"` or `"Authorization=Bearer <token>"`
1. Do NOT set `OTEL_TRACES_EXPORTER`, `OTEL_METRICS_EXPORTER`, or `OTEL_LOGS_EXPORTER` — the defaults are already
   correct
1. Do NOT add code-level SDK setup (no `TracerProvider`, no `configure_azure_monitor`, etc.) —
   `[opentelemetry](../opentelemetry/SKILL.md)-instrument` handles everything
1. Never run both classic `elastic-apm` and EDOT on the same application

## Examples

See the [EDOT [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) setup guide](https://www.elastic.co/docs/reference/[opentelemetry](../opentelemetry/SKILL.md)/edot-sdks/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/setup) for
complete examples.
