---
name: azure-monitor-opentelemetry-ts
description: Instrument applications with Azure Monitor and OpenTelemetry for JavaScript (@azure/monitor-opentelemetry). Use when adding distributed tracing, metrics, and logs to Node.js applications with Application Insights.
license: MIT
metadata:
  author: Microsoft
  version: "1.0.0"
  package: '@azure/monitor-opentelemetry'
---

# Azure Monitor [OpenTelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) SDK for [TypeScript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)

Auto-instrument Node.js applications with distributed tracing, metrics, and logs.

## Installation

```bash
# Distro (recommended - auto-instrumentation)
npm install @azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)

# Low-level exporters (custom [OpenTelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md) setup)
npm install @azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter

# Custom logs ingestion
npm install @azure/monitor-ingestion
```

## Environment Variables

```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=...
AZURE_TOKEN_CREDENTIALS=prod # Required only if DefaultAzureCredential is used in production
```

## Quick Start (Auto-Instrumentation)

**IMPORTANT:** Call `useAzureMonitor()` BEFORE importing other modules.

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { useAzureMonitor } from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)";

useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  }
});

// Now import your application
import express from "express";
const app = express();
```

## ESM Support (Node.js 18.19+)

```bash
node --import @azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/loader ./dist/index.js
```

**package.json:**
```json
{
  "scripts": {
    "start": "node --import @azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/loader ./dist/index.js"
  }
}
```

## Full Configuration

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { useAzureMonitor, AzureMonitorOpenTelemetryOptions } from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)";
import { resourceFromAttributes } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/resources";

const options: AzureMonitorOpenTelemetryOptions = {
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    storageDirectory: "/path/to/offline/storage",
    disableOfflineStorage: false
  },
  
  // Sampling
  samplingRatio: 1.0,  // 0-1, percentage of traces
  
  // Features
  enableLiveMetrics: true,
  enableStandardMetrics: true,
  enablePerformanceCounters: true,
  
  // Instrumentation libraries
  instrumentationOptions: {
    azureSdk: { enabled: true },
    http: { enabled: true },
    [mongoDb](../../../Software_Engineering_and_Other/Backend/mongodb/SKILL.md): { enabled: true },
    [mySql](../../../Software_Engineering_and_Other/Backend/mysql/SKILL.md): { enabled: true },
    [postgreSql](../../../Software_Engineering_and_Other/Backend/postgresql/SKILL.md): { enabled: true },
    redis: { enabled: true },
    bunyan: { enabled: false },
    winston: { enabled: false }
  },
  
  // Custom resource
  resource: resourceFromAttributes({ "service.name": "my-service" })
};

useAzureMonitor(options);
```

## Custom Traces

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { trace } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/api";

const tracer = trace.getTracer("my-tracer");

const span = tracer.startSpan("doWork");
try {
  span.setAttribute("component", "worker");
  span.setAttribute("operation.id", "42");
  span.addEvent("processing started");
  
  // Your work here
  
} catch (error) {
  span.recordException(error as Error);
  span.setStatus({ code: 2, message: (error as Error).message });
} finally {
  span.end();
}
```

## Custom Metrics

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { metrics } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/api";

const meter = metrics.getMeter("my-meter");

// Counter
const counter = meter.createCounter("requests_total");
counter.add(1, { route: "/api/users", method: "GET" });

// Histogram
const histogram = meter.createHistogram("request_duration_ms");
histogram.record(150, { route: "/api/users" });

// Observable Gauge
const gauge = meter.createObservableGauge("active_connections");
gauge.addCallback((result) => {
  result.observe(getActiveConnections(), { pool: "main" });
});
```

## Manual Exporter Setup

### Trace Exporter

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { AzureMonitorTraceExporter } from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter";
import { NodeTracerProvider, BatchSpanProcessor } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/sdk-trace-node";

const exporter = new AzureMonitorTraceExporter({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
});

const provider = new NodeTracerProvider({
  spanProcessors: [new BatchSpanProcessor(exporter)]
});

provider.register();
```

### Metric Exporter

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { AzureMonitorMetricExporter } from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter";
import { PeriodicExportingMetricReader, MeterProvider } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/sdk-metrics";
import { metrics } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/api";

const exporter = new AzureMonitorMetricExporter({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
});

const meterProvider = new MeterProvider({
  readers: [new PeriodicExportingMetricReader({ exporter })]
});

metrics.setGlobalMeterProvider(meterProvider);
```

### Log Exporter

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { AzureMonitorLogExporter } from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter";
import { BatchLogRecordProcessor, LoggerProvider } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/sdk-logs";
import { logs } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/api-logs";

const exporter = new AzureMonitorLogExporter({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
});

const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(exporter));

logs.setGlobalLoggerProvider(loggerProvider);
```

## Custom Logs Ingestion

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";
import { LogsIngestionClient, isAggregateLogsUploadError } from "@azure/monitor-ingestion";

const endpoint = "https://<dce>.ingest.monitor.azure.com";
const ruleId = "<data-collection-rule-id>";
const streamName = "Custom-MyTable_CL";

// Local dev: DefaultAzureCredential. Production: set AZURE_TOKEN_CREDENTIALS=prod or AZURE_TOKEN_CREDENTIALS=<specific_credential>
const credential = new DefaultAzureCredential({requiredEnvVars: ["AZURE_TOKEN_CREDENTIALS"]});
// Or use a specific credential directly in production:
// See https://learn.microsoft.com/javascript/api/overview/azure/identity-readme?view=azure-node-latest#credential-classes
// const credential = new ManagedIdentityCredential();

const client = new LogsIngestionClient(endpoint, credential);

const logs = [
  {
    Time: new Date().toISOString(),
    Computer: "Server1",
    Message: "Application started",
    Level: "Information"
  }
];

try {
  await client.upload(ruleId, streamName, logs);
} catch (error) {
  if (isAggregateLogsUploadError(error)) {
    for (const uploadError of error.errors) {
      console.error("Failed logs:", uploadError.failedLogs);
    }
  }
}
```

## Custom Span Processor

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { SpanProcessor, ReadableSpan } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/sdk-trace-base";
import { Span, Context, SpanKind, TraceFlags } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/api";
import { useAzureMonitor } from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)";

class FilteringSpanProcessor implements SpanProcessor {
  forceFlush(): Promise<void> { return Promise.resolve(); }
  shutdown(): Promise<void> { return Promise.resolve(); }
  onStart(span: Span, context: Context): void {}
  
  onEnd(span: ReadableSpan): void {
    // Add custom attributes
    span.attributes["CustomDimension"] = "value";
    
    // Filter out internal spans
    if (span.kind === SpanKind.INTERNAL) {
      span.spanContext().traceFlags = TraceFlags.NONE;
    }
  }
}

useAzureMonitor({
  spanProcessors: [new FilteringSpanProcessor()]
});
```

## Sampling

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { ApplicationInsightsSampler } from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter";
import { NodeTracerProvider } from "@[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/sdk-trace-node";

// Sample 75% of traces
const sampler = new ApplicationInsightsSampler(0.75);

const provider = new NodeTracerProvider({ sampler });
```

## Shutdown

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { useAzureMonitor, shutdownAzureMonitor } from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)";

useAzureMonitor();

// On application shutdown
process.on("SIGTERM", async () => {
  await shutdownAzureMonitor();
  process.exit(0);
});
```

## Key Types

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import {
  useAzureMonitor,
  shutdownAzureMonitor,
  AzureMonitorOpenTelemetryOptions,
  InstrumentationOptions
} from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)";

import {
  AzureMonitorTraceExporter,
  AzureMonitorMetricExporter,
  AzureMonitorLogExporter,
  ApplicationInsightsSampler,
  AzureMonitorExporterOptions
} from "@azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter";

import {
  LogsIngestionClient,
  isAggregateLogsUploadError
} from "@azure/monitor-ingestion";
```

## Best Practices

1. **Call useAzureMonitor() first** - Before importing other modules
2. **Use ESM loader for ESM projects** - `--import @azure/monitor-[opentelemetry](../../Observability_and_SecOps/opentelemetry/SKILL.md)/loader`
3. **Enable offline storage** - For reliable telemetry in disconnected scenarios
4. **Set sampling ratio** - For high-traffic applications
5. **Add custom dimensions** - Use span processors for enrichment
6. **Graceful shutdown** - Call `shutdownAzureMonitor()` to flush telemetry
