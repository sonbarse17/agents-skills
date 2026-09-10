---
name: Event Driven Architecture
description: Best practices for Kafka/RabbitMQ message brokering and event sourcing.
tags:
  - patterns
  - event-driven-architecture
depends_on:
  - mermaid
  - go
  - github
---

# Event Driven Architecture

## Core Concepts
- **Message Brokering**: Decouples producers and consumers.
- **Event Sourcing**: State is determined by a sequence of events.

## Diagram
```[mermaid](../../../../Product_and_Business/content-and-docs/mermaid/SKILL.md)
%%{init: {"theme": "default", "flowchart": {"useMaxWidth": false}}}%%
flowchart TD
    A[Producer] --> B(Message Broker)
    B --> C[Consumer 1]
    B --> D[Consumer 2]
    B --> E[(Event Store)]
```

## Go Example (Kafka Producer)
```go
package main

import (
    "[github](../../../../DevOps_and_Cloud/ci-cd/github-actions/other/github/SKILL.md).com/confluentinc/confluent-kafka-go/kafka"
    "log"
)

func produceEvent(topic, message string) {
    p, _ := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": "localhost"})
    defer p.Close()

    p.Produce(&kafka.Message{
        TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
        Value:          []byte(message),
    }, nil)
    p.Flush(15 * 1000)
    log.Println("Event produced")
}
```
