---
name: azure-monitor-opentelemetry-exporter-py
description: >
  Azure Monitor OpenTelemetry Exporter for Python. Use for low-level
  OpenTelemetry export to Application Insights.

  Triggers: "azure-monitor-opentelemetry-exporter", "AzureMonitorTraceExporter",
  "AzureMonitorMetricExporter", "AzureMonitorLogExporter".
license: MIT
metadata:
  author: Microsoft
  version: 1.0.0
  package: azure-monitor-opentelemetry-exporter
tags:
  - cloud_providers
  - azure-monitor-opentelemetry-exporter-py
depends_on: []
---

# Azure Monitor [OpenTelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) Exporter for [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)

Low-level exporter for sending [OpenTelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) traces, metrics, and logs to Application Insights.

## Installation

```bash
pip install azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter
```

## Environment Variables

```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/  # Required for all auth methods
AZURE_TOKEN_CREDENTIALS=prod # Required only if DefaultAzureCredential is used in production
```

## Authentication & Lifecycle

> **🔑 Two rules apply to every code sample below:**
>
> 1. **Prefer `DefaultAzureCredential` for ingestion auth when supported.** `APPLICATIONINSIGHTS_CONNECTION_STRING` identifies the target Application Insights resource, and `credential=DefaultAzureCredential(...)` provides Microsoft Entra authentication.
>    - Local dev: `DefaultAzureCredential` works as-is.
>    - Production: set `AZURE_TOKEN_CREDENTIALS=prod` (or `AZURE_TOKEN_CREDENTIALS=<specific_credential>`) to constrain the credential chain to production-safe credentials.
> 2. **Providers are not context managers.** Flush and shut down telemetry providers explicitly at process exit so buffers are exported deterministically.
>
> Snippets may abbreviate this setup, but production code should always follow both rules.

## When to Use

| Scenario | Use |
|----------|-----|
| Quick setup, auto-instrumentation | `azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)` (distro) |
| Custom [OpenTelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) pipeline | `azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter` (this) |
| Fine-grained control over telemetry | `azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter` (this) |

## Trace Exporter

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from azure.identity import DefaultAzureCredential
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) import trace
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.trace import TracerProvider
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.trace.export import BatchSpanProcessor
from azure.monitor.[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter import AzureMonitorTraceExporter

# Reads APPLICATIONINSIGHTS_CONNECTION_STRING from env to identify the resource;
# DefaultAzureCredential authenticates ingestion via Microsoft Entra ID.
exporter = AzureMonitorTraceExporter(
    credential=DefaultAzureCredential(),
)

# Configure tracer provider
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(exporter)
)

# Use tracer
tracer = trace.get_tracer(__name__)
with tracer.start_as_current_span("my-span"):
    print("Hello, World!")
```

## Metric Exporter

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from azure.identity import DefaultAzureCredential
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) import metrics
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.metrics import MeterProvider
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.metrics.export import PeriodicExportingMetricReader
from azure.monitor.[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter import AzureMonitorMetricExporter

# Reads APPLICATIONINSIGHTS_CONNECTION_STRING from env; AAD-authenticated ingestion via DefaultAzureCredential.
exporter = AzureMonitorMetricExporter(
    credential=DefaultAzureCredential(),
)

# Configure meter provider
reader = PeriodicExportingMetricReader(exporter, export_interval_millis=60000)
metrics.set_meter_provider(MeterProvider(metric_readers=[reader]))

# Use meter
meter = metrics.get_meter(__name__)
counter = meter.create_counter("requests_total")
counter.add(1, {"route": "/api/users"})
```

## Log Exporter

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
import logging
from azure.identity import DefaultAzureCredential
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)._logs import set_logger_provider
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk._logs import LoggerProvider, LoggingHandler
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk._logs.export import BatchLogRecordProcessor
from azure.monitor.[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter import AzureMonitorLogExporter

# Reads APPLICATIONINSIGHTS_CONNECTION_STRING from env; AAD-authenticated ingestion via DefaultAzureCredential.
exporter = AzureMonitorLogExporter(
    credential=DefaultAzureCredential(),
)

# Configure logger provider
logger_provider = LoggerProvider()
logger_provider.add_log_record_processor(BatchLogRecordProcessor(exporter))
set_logger_provider(logger_provider)

# Add handler to [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md) logging
handler = LoggingHandler(level=logging.INFO, logger_provider=logger_provider)
logging.getLogger().addHandler(handler)

# Use logging
logger = logging.getLogger(__name__)
logger.info("This will be sent to Application Insights")
```

## From Environment Variable

Exporters read `APPLICATIONINSIGHTS_CONNECTION_STRING` automatically:

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from azure.identity import DefaultAzureCredential
from azure.monitor.[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter import AzureMonitorTraceExporter

# Connection string from environment; AAD-authenticated ingestion via DefaultAzureCredential.
exporter = AzureMonitorTraceExporter(
    credential=DefaultAzureCredential(),
)
```

## Azure AD Authentication

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from azure.identity import DefaultAzureCredential, ManagedIdentityCredential
from azure.monitor.[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter import AzureMonitorTraceExporter

# Local dev: DefaultAzureCredential. Production: set AZURE_TOKEN_CREDENTIALS=prod or AZURE_TOKEN_CREDENTIALS=<specific_credential>
credential = DefaultAzureCredential(require_envvar=True)
# Or use a specific credential directly in production:
# See https://learn.microsoft.com/[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/api/overview/azure/identity-readme?view=azure-[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)#credential-classes
# credential = ManagedIdentityCredential()

exporter = AzureMonitorTraceExporter(
    credential=credential
)
```

## Sampling

Use `ApplicationInsightsSampler` for consistent sampling:

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.trace import TracerProvider
from [opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.trace.sampling import ParentBasedTraceIdRatio
from azure.monitor.[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter import ApplicationInsightsSampler

# Sample 10% of traces
sampler = ApplicationInsightsSampler(sampling_ratio=0.1)

trace.set_tracer_provider(TracerProvider(sampler=sampler))
```

## Offline Storage

Configure offline storage for retry:

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from azure.identity import DefaultAzureCredential
from azure.monitor.[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter import AzureMonitorTraceExporter

exporter = AzureMonitorTraceExporter(
    credential=DefaultAzureCredential(),
    storage_directory="/path/to/storage",  # Custom storage path
    disable_offline_storage=False  # Enable retry (default)
)
```

## Disable Offline Storage

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
exporter = AzureMonitorTraceExporter(
    credential=DefaultAzureCredential(),
    disable_offline_storage=True  # No retry on failure
)
```

## Sovereign Clouds

```[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)
from azure.identity import AzureAuthorityHosts, DefaultAzureCredential
from azure.monitor.[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter import AzureMonitorTraceExporter

# Azure Government
credential = DefaultAzureCredential(authority=AzureAuthorityHosts.AZURE_GOVERNMENT)
exporter = AzureMonitorTraceExporter(
    connection_string="InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.us/",
    credential=credential
)
```

## Exporter Types

| Exporter | Telemetry Type | Application Insights Table |
|----------|---------------|---------------------------|
| `AzureMonitorTraceExporter` | Traces/Spans | requests, dependencies, exceptions |
| `AzureMonitorMetricExporter` | Metrics | customMetrics, performanceCounters |
| `AzureMonitorLogExporter` | Logs | traces, customEvents |

## Configuration Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `connection_string` | Application Insights connection string | From env var |
| `credential` | Azure credential for AAD auth | None |
| `disable_offline_storage` | Disable retry storage | False |
| `storage_directory` | Custom storage path | Temp directory |

## Best Practices

1. **Pick sync OR async and stay consistent.** Do not mix `azure.xxx` sync clients with `azure.xxx.aio` async clients in the same call path. Choose one mode per module.
2. **Call `provider.shutdown()` / `force_flush()` at process exit to flush telemetry — providers are not context managers.**
3. **Use BatchSpanProcessor** for production (not SimpleSpanProcessor)
4. **Use ApplicationInsightsSampler** for consistent sampling across services
5. **Enable offline storage** for reliability in production
6. **Use Microsoft Entra authentication** instead of instrumentation keys
7. **Set export intervals** appropriate for your workload
8. **Use the distro** (`azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)`) unless you need custom pipelines

## Reference Files

| File | Contents |
|------|----------|
| [../../../Global_References/azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-py_capabilities.md](../../../Global_References/azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-py_capabilities.md) | Additional non-hero capabilities, operation-group coverage, and production checklists. |
| [../../../Global_References/azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-py_non-hero-scenarios.md](../../../Global_References/azure-monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter-py_non-hero-scenarios.md) | Dedicated non-hero examples for secondary/advanced scenarios. |

