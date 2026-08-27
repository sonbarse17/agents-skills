---
name: azure-monitor-opentelemetry-exporter-java
description: |
  Azure Monitor OpenTelemetry Exporter for Java. Export OpenTelemetry traces, metrics, and logs to Azure Monitor/Application Insights.
  Triggers: "AzureMonitorExporter java", "opentelemetry azure java", "application insights java otel", "azure monitor tracing java".
  Note: This package is DEPRECATED. Migrate to azure-monitor-opentelemetry-autoconfigure.
license: MIT
metadata:
  author: Microsoft
  version: "1.0.0"
  package: com.azure:azure-monitor-opentelemetry-exporter
---

# Azure Monitor [OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) Exporter for Java

> **⚠️ DEPRECATION NOTICE**: This package is deprecated. Migrate to `azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-autoconfigure`.
>
> See [Migration Guide](https://[github](../../../../CI_CD/github/SKILL.md).com/Azure/azure-sdk-for-java/blob/main/sdk/monitor/azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter/MIGRATION.md) for detailed instructions.

Export [OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) telemetry data to Azure Monitor / Application Insights.

## Installation (Deprecated)

```xml
<dependency>
    <groupId>com.azure</groupId>
    <artifactId>azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter</artifactId>
    <version>1.0.0-beta.x</version>
</dependency>
```

## Recommended: Use Autoconfigure Instead

```xml
<dependency>
    <groupId>com.azure</groupId>
    <artifactId>azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-autoconfigure</artifactId>
    <version>LATEST</version>
</dependency>
```

## Environment Variables

```bash
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/
```

## Basic Setup with Autoconfigure (Recommended)

### Using Environment Variable

```java
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.autoconfigure.AutoConfiguredOpenTelemetrySdkBuilder;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).api.[OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md);
import com.azure.monitor.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).exporter.AzureMonitorExporter;

// Connection string from APPLICATIONINSIGHTS_CONNECTION_STRING env var
AutoConfiguredOpenTelemetrySdkBuilder sdkBuilder = AutoConfiguredOpenTelemetrySdk.builder();
AzureMonitorExporter.[customize](../../../../../AI_and_Agents/Infrastructure/deploy-model/[customize](../../../azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)(sdkBuilder);
[OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) [openTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) = sdkBuilder.build().getOpenTelemetrySdk();
```

### With Explicit Connection String

```java
AutoConfiguredOpenTelemetrySdkBuilder sdkBuilder = AutoConfiguredOpenTelemetrySdk.builder();
AzureMonitorExporter.[customize](../../../../../AI_and_Agents/Infrastructure/deploy-model/[customize](../../../azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)(sdkBuilder, "{connection-string}");
[OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) [openTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) = sdkBuilder.build().getOpenTelemetrySdk();
```

## Creating Spans

```java
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).api.trace.Tracer;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).api.trace.Span;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).context.Scope;

// Get tracer
Tracer tracer = [openTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).getTracer("com.example.myapp");

// Create span
Span span = tracer.spanBuilder("myOperation").startSpan();

try (Scope scope = span.makeCurrent()) {
    // Your application logic
    doWork();
} catch (Throwable t) {
    span.recordException(t);
    throw t;
} finally {
    span.end();
}
```

## Adding Span Attributes

```java
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).api.common.AttributeKey;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).api.common.Attributes;

Span span = tracer.spanBuilder("processOrder")
    .setAttribute("order.id", "12345")
    .setAttribute("customer.tier", "premium")
    .startSpan();

try (Scope scope = span.makeCurrent()) {
    // Add attributes during execution
    span.setAttribute("items.count", 3);
    span.setAttribute("total.amount", 99.99);
    
    processOrder();
} finally {
    span.end();
}
```

## Custom Span Processor

```java
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.trace.SpanProcessor;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.trace.ReadWriteSpan;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).sdk.trace.ReadableSpan;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).context.Context;

private static final AttributeKey<String> CUSTOM_ATTR = AttributeKey.stringKey("custom.attribute");

SpanProcessor customProcessor = new SpanProcessor() {
    @Override
    public void onStart(Context context, ReadWriteSpan span) {
        // Add custom attribute to every span
        span.setAttribute(CUSTOM_ATTR, "customValue");
    }

    @Override
    public boolean isStartRequired() {
        return true;
    }

    @Override
    public void onEnd(ReadableSpan span) {
        // Post-processing if needed
    }

    @Override
    public boolean isEndRequired() {
        return false;
    }
};

// Register processor
AutoConfiguredOpenTelemetrySdkBuilder sdkBuilder = AutoConfiguredOpenTelemetrySdk.builder();
AzureMonitorExporter.[customize](../../../../../AI_and_Agents/Infrastructure/deploy-model/[customize](../../../azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md)(sdkBuilder);

sdkBuilder.addTracerProviderCustomizer(
    (sdkTracerProviderBuilder, configProperties) -> 
        sdkTracerProviderBuilder.addSpanProcessor(customProcessor)
);

[OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) [openTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) = sdkBuilder.build().getOpenTelemetrySdk();
```

## Nested Spans

```java
public void parentOperation() {
    Span parentSpan = tracer.spanBuilder("parentOperation").startSpan();
    try (Scope scope = parentSpan.makeCurrent()) {
        childOperation();
    } finally {
        parentSpan.end();
    }
}

public void childOperation() {
    // Automatically links to parent via Context
    Span childSpan = tracer.spanBuilder("childOperation").startSpan();
    try (Scope scope = childSpan.makeCurrent()) {
        // Child work
    } finally {
        childSpan.end();
    }
}
```

## Recording Exceptions

```java
Span span = tracer.spanBuilder("riskyOperation").startSpan();
try (Scope scope = span.makeCurrent()) {
    performRiskyWork();
} catch (Exception e) {
    span.recordException(e);
    span.setStatus(StatusCode.ERROR, e.getMessage());
    throw e;
} finally {
    span.end();
}
```

## Metrics (via [OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md))

```java
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).api.metrics.Meter;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).api.metrics.LongCounter;
import io.[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).api.metrics.LongHistogram;

Meter meter = [openTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).getMeter("com.example.myapp");

// Counter
LongCounter requestCounter = meter.counterBuilder("http.requests")
    .setDescription("Total HTTP requests")
    .setUnit("requests")
    .build();

requestCounter.add(1, Attributes.of(
    AttributeKey.stringKey("http.method"), "GET",
    AttributeKey.longKey("http.status_code"), 200L
));

// Histogram
LongHistogram latencyHistogram = meter.histogramBuilder("http.latency")
    .setDescription("Request latency")
    .setUnit("ms")
    .ofLongs()
    .build();

latencyHistogram.record(150, Attributes.of(
    AttributeKey.stringKey("http.route"), "/api/users"
));
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| Connection String | Application Insights connection string with instrumentation key |
| Tracer | Creates spans for distributed tracing |
| Span | Represents a unit of work with timing and attributes |
| SpanProcessor | Intercepts span lifecycle for customization |
| Exporter | Sends telemetry to Azure Monitor |

## Migration to Autoconfigure

The `azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-autoconfigure` package provides:
- Automatic instrumentation of common libraries
- Simplified configuration
- Better integration with [OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) SDK

### Migration Steps

1. Replace dependency:
   ```xml
   <!-- Remove -->
   <dependency>
       <groupId>com.azure</groupId>
       <artifactId>azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter</artifactId>
   </dependency>
   
   <!-- Add -->
   <dependency>
       <groupId>com.azure</groupId>
       <artifactId>azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-autoconfigure</artifactId>
   </dependency>
   ```

2. Update initialization code per [Migration Guide](https://[github](../../../../CI_CD/github/SKILL.md).com/Azure/azure-sdk-for-java/blob/main/sdk/monitor/azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter/MIGRATION.md)

## Best Practices

1. **Use autoconfigure** — Migrate to `azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-autoconfigure`
2. **Set meaningful span names** — Use descriptive operation names
3. **Add relevant attributes** — Include contextual data for debugging
4. **Handle exceptions** — Always record exceptions on spans
5. **Use semantic conventions** — Follow [OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) semantic conventions
6. **End spans in finally** — Ensure spans are always ended
7. **Use try-with-resources** — Scope management with try-with-resources pattern

## Reference Links

| Resource | URL |
|----------|-----|
| Maven Package | https://central.sonatype.com/artifact/com.azure/azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter |
| [GitHub](../../../../CI_CD/github/SKILL.md) | https://[github](../../../../CI_CD/github/SKILL.md).com/Azure/azure-sdk-for-java/tree/main/sdk/monitor/azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter |
| Migration Guide | https://[github](../../../../CI_CD/github/SKILL.md).com/Azure/azure-sdk-for-java/blob/main/sdk/monitor/azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-exporter/MIGRATION.md |
| Autoconfigure Package | https://central.sonatype.com/artifact/com.azure/azure-monitor-[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md)-autoconfigure |
| [OpenTelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md) Java | https://[opentelemetry](../../../../Observability_and_SecOps/opentelemetry/SKILL.md).io/docs/languages/java/ |
| Application Insights | https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview |
