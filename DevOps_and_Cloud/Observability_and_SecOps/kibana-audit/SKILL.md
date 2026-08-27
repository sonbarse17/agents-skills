---
name: kibana-audit
description: >
  Enable and configure Kibana audit logging for saved object access, logins, and
  space operations. Use when setting up Kibana audit, filtering events, or
  correlating Kibana and ES audit logs.
metadata:
  author: elastic
  version: 0.1.0
tags:
  - observability_and_secops
  - kibana-audit
depends_on: []
---

# Kibana [Audit](../../../AI_and_Agents/Operations/audit/SKILL.md) Logging

Enable and configure [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging for Kibana via `kibana.yml`. Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logs cover application-layer security
events that Elasticsearch does not see: saved object CRUD ([dashboards](../../Cloud_Providers/dashboards/SKILL.md), visualizations, index patterns, rules, cases),
login/logout, session expiry, space operations, and Kibana-level RBAC enforcement.

For Elasticsearch [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging (authentication failures, access grants/denials, security config changes), see
**[elasticsearch-audit](../elasticsearch-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)/SKILL.md)**. For authentication and API key management, see **[elasticsearch-authn](../../../Software_Engineering_and_Other/Databases/elasticsearch-authn/SKILL.md)**. For roles and user
management, see **[elasticsearch-authz](../elasticsearch-authz/SKILL.md)**.

For detailed event types, schema, and correlation queries, see
[../../../Global_References/kibana-audit_api-reference.md](../../../Global_References/kibana-audit_api-reference.md).

> **Deployment note:** Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) configuration differs across deployment types. See
> [Deployment Compatibility](#deployment-compatibility) for details.

## Jobs to Be Done

- Enable or disable Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging
- Configure [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) log output (rolling file, console)
- Filter out noisy events (e.g. `saved_object_find`)
- Investigate saved object access or deletion events
- Track Kibana login/logout and session activity
- Monitor space creation, modification, and deletion
- Correlate Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) events with Elasticsearch [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logs via `trace.id`
- Ship Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logs to Elasticsearch for unified querying

## Prerequisites

| Item                  | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| **Kibana access**     | Filesystem access to `kibana.yml` (self-managed) or Cloud console access (ECH) |
| **License**           | [Audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging requires a gold, platinum, enterprise, or trial license          |
| **Elasticsearch URL** | Cluster endpoint for correlation queries against `.security-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-*`           |

Prompt the user for any missing values.

## Enable Kibana [Audit](../../../AI_and_Agents/Operations/audit/SKILL.md) Logging

Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) is configured statically in `kibana.yml` (not via API). A Kibana restart is required after changes.

```yaml
xpack.security.[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).enabled: true
xpack.security.[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).appender:
  type: rolling-file
  fileName: /path/to/kibana/data/[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).log
  policy:
    type: time-interval
    interval: 24h
  strategy:
    type: numeric
    max: 10
```

To disable, set `xpack.security.[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).enabled` to `false` and restart Kibana.

### Appender types

| Type           | Description                                             |
| -------------- | ------------------------------------------------------- |
| `rolling-file` | Writes to a file with rotation policy. Recommended.     |
| `console`      | Writes to stdout. Useful for containerized deployments. |

## Event Types

Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) events use ECS format with the same core fields as ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) (`event.action`, `event.outcome`, `user.name`,
`trace.id`, `@timestamp`) plus Kibana-specific fields like `kibana.saved_object.type`, `kibana.saved_object.id`, and
`kibana.space_id`.

Key event actions:

| Event action                       | Description                                  | Category       |
| ---------------------------------- | -------------------------------------------- | -------------- |
| `saved_object_create`              | A saved object was created                   | database       |
| `saved_object_get`                 | A saved object was read                      | database       |
| `saved_object_update`              | A saved object was updated                   | database       |
| `saved_object_delete`              | A saved object was deleted                   | database       |
| `saved_object_find`                | A saved object search was performed          | database       |
| `saved_object_open_point_in_time`  | A PIT was opened on saved objects            | database       |
| `saved_object_close_point_in_time` | A PIT was closed on saved objects            | database       |
| `saved_object_resolve`             | A saved object was resolved (alias redirect) | database       |
| `login`                            | A user logged in (success or failure)        | authentication |
| `logout`                           | A user logged out                            | authentication |
| `session_cleanup`                  | An expired session was cleaned up            | authentication |
| `access_agreement_acknowledged`    | A user accepted the access agreement         | authentication |
| `space_create`                     | A Kibana space was created                   | web            |
| `space_update`                     | A Kibana space was updated                   | web            |
| `space_delete`                     | A Kibana space was deleted                   | web            |
| `space_get`                        | A Kibana space was retrieved                 | web            |

See [../../../Global_References/kibana-audit_api-reference.md](../../../Global_References/kibana-audit_api-reference.md) for the complete event schema.

## Filter Policies

Suppress noisy events using `ignore_filters` in `kibana.yml`:

```yaml
xpack.security.[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).ignore_filters:
  - actions: [saved_object_find]
    categories: [database]
```

| Filter field | Type | Description                |
| ------------ | ---- | -------------------------- |
| `actions`    | list | Event actions to ignore    |
| `categories` | list | Event categories to ignore |

An event is filtered out if it matches **all** specified fields within a single filter entry.

## Correlate with Elasticsearch [Audit](../../../AI_and_Agents/Operations/audit/SKILL.md) Logs

When Kibana makes requests to Elasticsearch on behalf of a user, both systems record the same `trace.id` (passed via the
`X-Opaque-Id` header). This is the primary key for correlating events across the two [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logs.

> **Prerequisite:** Elasticsearch [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) must be enabled via the cluster settings API. See the **[elasticsearch-audit](../elasticsearch-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)/SKILL.md)**
> skill for setup instructions, event types, and ES-specific filter policies.

### Correlation workflow

1. Find the suspicious event in the Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) log.
2. Extract its `trace.id` value.
3. Search the ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) index (`.security-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-*`) for all events with the same `trace.id`.
4. Review the combined timeline to understand what ES-level operations the Kibana action triggered.

The **[elasticsearch-audit](../elasticsearch-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)/SKILL.md)** skill also documents this workflow from the ES side — use it when starting from an ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md)
event and looking for the originating Kibana action.

### Search ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) by trace ID

Given a suspicious Kibana event (e.g. a saved object deletion), extract its `trace.id` and search the ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) index:

```bash
curl -X POST "${ELASTICSEARCH_URL}/.security-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-*/_search" \
  <auth_flags> \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "bool": {
        "filter": [
          { "term": { "trace.id": "'"${TRACE_ID}"'" } },
          { "range": { "@timestamp": { "gte": "now-24h" } } }
        ]
      }
    },
    "sort": [{ "@timestamp": { "order": "asc" } }]
  }'
```

Secondary correlation fields: `user.name`, `source.ip`, and `@timestamp` (time-window joins).

### Ship Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logs to Elasticsearch

To query Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) events alongside ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) events, ship the Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) log file to an Elasticsearch index using
Filebeat:

```yaml
filebeat.inputs:
  - type: log
    paths: ["/path/to/kibana/data/[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).log"]
    json.keys_under_root: true
    json.add_error_key: true

output.elasticsearch:
  hosts: ["https://localhost:9200"]
  index: "kibana-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-%{+yyyy.MM.dd}"
```

Once indexed, both `.security-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-*` (ES) and `kibana-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-*` (Kibana) can be searched together using a multi-index
query filtered by `trace.id`.

## Examples

### Enable Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) for compliance

**Request:** "Enable Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging and keep 10 rotated log files."

```yaml
xpack.security.[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).enabled: true
xpack.security.[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).appender:
  type: rolling-file
  fileName: /var/log/kibana/[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).log
  policy:
    type: time-interval
    interval: 24h
  strategy:
    type: numeric
    max: 10
```

Restart Kibana after applying.

### Investigate a deleted dashboard

**Request:** "Someone deleted a dashboard. Check the Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) log."

Search the Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) log (or the indexed `kibana-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-*` data) for `saved_object_delete` events with
`kibana.saved_object.type: dashboard`. Extract the `trace.id` and cross-reference with the ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) index to see the
underlying Elasticsearch operations.

### Reduce [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) noise from saved object searches

**Request:** "Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logs are too large because of constant saved_object_find events."

```yaml
xpack.security.[audit](../../../AI_and_Agents/Operations/audit/SKILL.md).ignore_filters:
  - actions: [saved_object_find]
    categories: [database]
```

This suppresses high-volume read operations while preserving create, update, and delete events.

## Guidelines

### Always enable alongside Elasticsearch [audit](../../../AI_and_Agents/Operations/audit/SKILL.md)

For full coverage, enable [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) in both `kibana.yml` and Elasticsearch. Without Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md), saved object access and
Kibana login events are invisible. Without ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md), cluster-level operations are invisible. See the
**[elasticsearch-audit](../elasticsearch-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)/SKILL.md)** skill for ES-side setup.

### Use trace.id for correlation

When investigating a Kibana event, always extract `trace.id` and search the ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) index (`.security-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-*`). This
reveals the full chain of operations triggered by a single Kibana action. See
[Correlate with Elasticsearch [Audit](../../../AI_and_Agents/Operations/audit/SKILL.md) Logs](#correlate-with-[elasticsearch-audit](../elasticsearch-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)/SKILL.md)-logs) above for queries.

### Filter noisy read events

`saved_object_find` generates very high volume on busy Kibana instances. Suppress it unless you specifically need to
[audit](../../../AI_and_Agents/Operations/audit/SKILL.md) read access.

### Ship logs to Elasticsearch for unified querying

Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logs are written to files by default. Ship them to Elasticsearch via Filebeat for programmatic querying
alongside ES [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) events.

### Rotate and retain appropriately

Configure rolling-file rotation to avoid filling the disk. A 30-90 day retention is typical for compliance.

## Deployment Compatibility

| Capability                  | Self-managed | ECH          | [Serverless](../../Containers_and_Orchestration/serverless/SKILL.md)    |
| --------------------------- | ------------ | ------------ | ------------- |
| Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) (`kibana.yml`) | Yes          | Via Cloud UI | Not available |
| Rolling-file appender       | Yes          | Via Cloud UI | Not available |
| Console appender            | Yes          | Yes          | Not available |
| Ignore filters              | Yes          | Via Cloud UI | Not available |
| Correlate via `trace.id`    | Yes          | Yes          | Not available |
| Ship to ES via Filebeat     | Yes          | Yes          | Not available |

**ECH notes:** Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) is enabled via the deployment edit page in the Cloud console. Log files are accessible
through the Cloud console deployment logs.

**[Serverless](../../Containers_and_Orchestration/serverless/SKILL.md) notes:**

- Kibana [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging is not user-configurable on [Serverless](../../Containers_and_Orchestration/serverless/SKILL.md). Security events are managed by Elastic as part of the
  platform.
- If a user asks about Kibana auditing on [Serverless](../../Containers_and_Orchestration/serverless/SKILL.md), direct them to the Elastic Cloud console or their account team.

