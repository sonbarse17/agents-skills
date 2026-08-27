---
name: data-nosql-database
description: >
  Use this skill when asked about MongoDB, Cassandra, DynamoDB, Couchbase,
  CosmosDB, NoSQL, document database, wide-column, key-value, consistency model,
  CAP theorem, sharding, or denormalization. This skill enforces: NoSQL type
  selection (document, key-value, wide-column, graph), MongoDB aggregation
  pipeline and indexing, Cassandra data modeling with partition/clustering keys,
  DynamoDB single-table design with GSI/LSI, CAP theorem trade-offs, consistency
  models (eventual, strong, quorum), and denormalization patterns. Do NOT use
  for: relational schema design, graph database traversal, or full-text search
  configuration.
version: 1.0.0
author: j4flmao
license: MIT
compatibility:
  claude-code: true
  cursor: true
  codex: true
  windsurf: true
tags:
  - data
  - database
  - nosql
  - phase-11
depends_on: []
---

# Data NoSQL Database

## Purpose
Select and design NoSQL databases by access patterns, data shape, consistency requirements, and scale. Use document stores for flexible schemas, wide-column for high-scale writes, key-value for caching, and single-table designs for DynamoDB.

## Architecture / Decision Trees

### NoSQL Type Selection Decision Tree

```
What is the primary access pattern?
├── Complex queries with flexible filters, aggregations
│   └── Document store ([MongoDB](../../Backend/mongodb/SKILL.md), Couchbase)
├── Simple lookups by primary key, high throughput
│   ├── Key-value reads < 1KB → Redis (in-memory)
│   └── Larger payloads, durable → DynamoDB
├── High-volume writes, time-series data
│   └── Wide-column (Cassandra, Scylla, Bigtable)
├── Relationship-heavy traversals
│   └── Graph (Neo4j, Amazon Neptune)

What consistency model is required?
├── Strong consistency required → [MongoDB](../../Backend/mongodb/SKILL.md) (primary reads, majority write)
├── Tunable consistency → Cassandra (ONE/QUORUM/ALL per query)
├── Eventually consistent acceptable → DynamoDB (default eventual reads)
└── Strict serializable → Spanner, CosmosDB (Bounded Staleness)

What is the write volume?
├── < 10K writes/sec → [MongoDB](../../Backend/mongodb/SKILL.md), DynamoDB, any
├── 10K-100K writes/sec → Cassandra, Scylla, DynamoDB (on-demand)
├── 100K-1M writes/sec → Scylla, Cassandra (tuned), Bigtable
└── > 1M writes/sec → Scylla, Bigtable, custom partitioning

What is the data size per entity?
├── Small documents (< 16MB) → [MongoDB](../../Backend/mongodb/SKILL.md) (16MB doc limit)
├── Large blobs → Store in S3/GCS, reference in NoSQL
└── Variable size → DynamoDB (400KB item limit)
```

### Partition Key Design Decision Tree

```
What is the query pattern?
├── Always query by user/tenant ID
│   └── User/tenant ID as partition key
├── Query by time range within a partition
│   └── Partition: user/region, Sort/cluster: timestamp
├── Global queries across all partitions
│   └── GSI (DynamoDB), secondary index ([MongoDB](../../Backend/mongodb/SKILL.md))
├── Need time-series + evenly distributed writes
│   └── Compound partition key with time bucket + hashed shard key
└── Need geographic data locality
    └── Ranged shard key by region

Avoid:
├── Monotonically increasing keys (all writes to last shard)
├── Low-cardinality keys (jumbo partitions, hot spots)
├── Single-attribute keys for multi-tenant (all writes to one shard)
└── Frequently updated keys (cross-shard transactions)
```

## Agent Protocol

### Trigger
Exact user phrases: "[MongoDB](../../Backend/mongodb/SKILL.md)", "Cassandra", "DynamoDB", "Couchbase", "CosmosDB", "NoSQL", "document database", "wide-column", "key-value", "consistency model", "CAP theorem", "sharding", "denormalization", "single-table design", "GSI", "LSI", "aggregation pipeline", "CQL".

### Input Context
Before activating, verify:
- Access patterns (known queries, write volume, read volume)
- Consistency requirements (strong, eventual, tunable)
- Data shape (nested documents, flat rows, time-series)
- Scale requirements (GB/TB/PB, throughput, latency SLAs)
- Team expertise (SQL background, NoSQL experience)
- Cloud vs on-premise deployment

### Output Artifact
NoSQL data model with access patterns, sharding strategy, consistency configuration, and platform-specific DDL.

### Response Format
```javascript
// [MongoDB](../../Backend/mongodb/SKILL.md) schema + indexes + aggregation
```
```cql
// Cassandra table DDL + compaction
```
```json
// DynamoDB table config + GSI/LSI
```
```yaml
# Consistency configuration
# Sharding strategy
```

No preamble. No postamble. No explanations. No filler/hedging/transitions. Compress output — why use many token when few do trick.

### Completion Criteria
- [ ] NoSQL type selected based on access patterns and data shape
- [ ] Data model designed around known queries (query-first approach)
- [ ] Sharding/partition key chosen to avoid hot spots
- [ ] Secondary indexes designed (GSI, LSI, [MongoDB](../../Backend/mongodb/SKILL.md) secondary)
- [ ] Consistency model configured per operation
- [ ] Denormalization applied for read performance
- [ ] Write path optimized (compaction, write isolation)

### Max Response Length
300 lines of schema and configuration.

## Workflow

### Step 1: NoSQL Type Selection
Document ([MongoDB](../../Backend/mongodb/SKILL.md), Couchbase): nested data, flexible schema, complex queries. Wide-column (Cassandra, Scylla): high-volume writes, time-series, predictable queries by partition key. Key-value (Redis, DynamoDB): simple lookups, caching, session store. Graph (Neo4j): relationships are first-class. Decision matrix: write volume, query complexity, consistency needs, schema flexibility.

| Pattern | Read Latency | Write Throughput | Query Flexibility | Consistency |
|---------|-------------|-----------------|-------------------|-------------|
| Document | Low | Medium | High | Tunable |
| Wide-column | Low | Very High | Low (by PK) | Tunable |
| Key-value | Very Low | Very High | Very Low | Configurable |
| Graph | Medium | Low | Very High (traversals) | Often strict |

### Step 2: Data Modeling (Query-First)
Map all access patterns before designing schemas. For every query define: partition key, sort/clustering key, filter conditions, projected attributes, consistency requirement. DynamoDB: single-table design with entity type attribute and hierarchical keys. [MongoDB](../../Backend/mongodb/SKILL.md): embed for contained sub-items, reference for shared entities. Cassandra: one table per query pattern.

```json
// DynamoDB single-table: order + customer in one table
{
  "PK": "CUST#123",
  "SK": "ORDER#2025-03-15#ORD-001",
  "entity_type": "order",
  "customer_name": "Acme Corp",
  "total": 250.00,
  "status": "shipped",
  "items": ["PROD-A", "PROD-B"],
  "GSI1PK": "STATUS#shipped",
  "GSI1SK": "2025-03-15"
}
```

### Step 3: Sharding and Partitioning
[MongoDB](../../Backend/mongodb/SKILL.md): shard key with high cardinality, low frequency, non-monotonic (hashed shard key for time-series). Cassandra: partition key distribution determines data placement; use compound partition keys for even distribution. DynamoDB: partition key hashed internally; use adaptive [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) for hot partitions. Avoid: monotonically increasing keys (all writes to one shard), low-cardinality keys (jumbo partitions).

```javascript
// [MongoDB](../../Backend/mongodb/SKILL.md) shard key: hashed for even distribution
sh.shardCollection("shop.orders", { "order_id": "hashed" })

// [MongoDB](../../Backend/mongodb/SKILL.md) shard key: ranged for geographic queries
sh.shardCollection("analytics.events", { "region": 1, "timestamp": -1 })
```

```cql
// Cassandra compound partition key with clustering
CREATE TABLE orders_by_customer (
    customer_id TEXT,
    order_month TEXT,
    order_id TIMEUUID,
    total DECIMAL,
    status TEXT,
    PRIMARY KEY ((customer_id, order_month), order_id)
) WITH CLUSTERING ORDER BY (order_id DESC);
```

### Step 4: Secondary Indexes
[MongoDB](../../Backend/mongodb/SKILL.md): single-field, compound, multikey (arrays), text, geospatial, hashed. Use partial indexes to reduce index size. DynamoDB GSI: alternative partition key, eventually consistent by default, projected attributes control cost. LSI: same partition key, different sort key, strongly consistent, 5 per table. Cassandra secondary indexes: local (per node) for low-cardinality columns; SASI (deprecated) for full-text. Prefer materialized views over indexes in Cassandra.

```json
{
  "TableName": "orders",
  "KeySchema": [
    { "AttributeName": "customer_id", "KeyType": "HASH" },
    { "AttributeName": "order_date", "KeyType": "RANGE" }
  ],
  "GlobalSecondaryIndexes": [{
    "IndexName": "GSI-Status-Date",
    "KeySchema": [
      { "AttributeName": "status", "KeyType": "HASH" },
      { "AttributeName": "shipped_date", "KeyType": "RANGE" }
    ],
    "Projection": { "ProjectionType": "INCLUDE", "NonKeyAttributes": ["total"] }
  }]
}
```

### Step 5: Consistency and CAP
CAP trade-off: partition tolerance is mandatory (P), choose consistency (CP) or availability (AP). [MongoDB](../../Backend/mongodb/SKILL.md): primary reads (strong), secondary reads (eventual), majority write concern. Cassandra: ONE (high availability), QUORUM (balanced), ALL (strong). DynamoDB: eventually consistent reads (default), strongly consistent reads (1 WCU headroom). Use quorum-based reads for critical data, eventual for [dashboards](../../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md).

```yaml
# [MongoDB](../../Backend/mongodb/SKILL.md) write concern
writeConcern:
  w: majority
  j: true
  wtimeout: 5000

# Cassandra consistency per query
SELECT * FROM orders WHERE customer_id = '123'
  USING CONSISTENCY LOCAL_QUORUM;
```

### Step 6: Denormalization Patterns
Computed fields: store aggregates (order count, total spent) to avoid joins. Complex attributes: embed line items in orders, comments in posts. Cross-entity data: duplicate customer name in each order for fast listing. Pre-joined data: create materialized join tables. Path enumeration: store full category path. Pre-joined data eliminates read-time joins at the cost of write-time complexity.

```javascript
// [MongoDB](../../Backend/mongodb/SKILL.md) embedded items
{
  "_id": "order:123",
  "customer": { "id": "cust:456", "name": "Acme", "email": "acme@co" },
  "items": [
    { "product_id": "p:1", "name": "Widget", "qty": 2, "price": 10.00 }
  ],
  "total": 20.00
}
```

### Step 7: Aggregation and Analytics
[MongoDB](../../Backend/mongodb/SKILL.md) aggregation pipeline stages: $match (filter early), $project (shape documents), $group (group by key), $sort (order results), $limit/$skip (pagination), $unwind (deconstruct arrays), $lookup (join across collections), $bucket (histogram), $facet (multi-faceted aggregation). Performance: use indexes for $match and $sort stages; $lookup requires index on foreign collection; avoid $unwind on large arrays; use allowDiskUse for memory-intensive pipelines. Use $merge to output aggregation results to a new collection.

```javascript
// Order analytics with facet
db.orders.aggregate([
    { $match: { created_at: { $gte: ISODate("2025-01-01") } } },
    { $facet: {
        by_status: [
            { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$total" } } }
        ],
        by_region: [
            { $lookup: { from: "customers", localField: "customer_id", foreignField: "_id", as: "customer" } },
            { $unwind: "$customer" },
            { $group: { _id: "$customer.region", count: { $sum: 1 }, revenue: { $sum: "$total" } } }
        ],
        daily_trend: [
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]
    } }
]);
```

### Step 8: Backup and Restoration Strategies
[MongoDB](../../Backend/mongodb/SKILL.md): mongodump for logical backups (slower, cross-version), file-system snapshots for fast physical backups (EBS snapshots, LVM), Ops Manager for continuous backup with point-in-time recovery. Cassandra: nodetool snapshot for hard-link snapshots, incremental backups with incremental_backups=true, [commit](../../../DevOps_and_Cloud/CI_CD/commit/SKILL.md) log archiving for point-in-time recovery. DynamoDB: on-demand backup (full copy), point-in-time recovery (PITR) for last 35 days, cross-region replication for DR.

```yaml
# Cassandra backup configuration
incremental_backups: true
commitlog_archiving:
  properties_dir: /etc/cassandra/commitlog_archiving.properties
  archive_command: "cp %path /backup/commitlog/%name"
  restore_command: "cp /backup/commitlog/%name %path"
```

### Step 9: Security and Access Control
[MongoDB](../../Backend/mongodb/SKILL.md): SCRAM-SHA-256 authentication, x.509 certificate auth, LDAP/Kerberos integration, field-level encryption, [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging. Cassandra: role-based access control with CQL GRANT/REVOKE, mTLS for inter-node encryption, system_auth keyspace replication across all datacenters. DynamoDB: IAM policies for table-level access, VPC endpoints for network isolation, KMS encryption at rest, DAX encryption in transit.

```cql
-- Cassandra RBAC
CREATE ROLE app_user WITH PASSWORD = 'secure_password' AND LOGIN = true;
GRANT SELECT ON KEYSPACE shop TO app_user;
GRANT MODIFY ON TABLE shop.orders TO app_user;
```

## Rules (updated)

### Write Path Optimization
[MongoDB](../../Backend/mongodb/SKILL.md): bulk writes, ordered=false for best-effort, journaled writes. Cassandra: compaction strategy determines write amplification (STCS for write-heavy, LCS for read-heavy, TWCS for time-series). DynamoDB: provisioned [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) with auto-scaling, burst [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) for spikes. Write isolation: avoid read-before-write patterns (conditional updates in DynamoDB, upserts in Cassandra).

```cql
// Cassandra compaction: TimeWindowCompactionStrategy for time-series
CREATE TABLE sensor_readings (
    sensor_id TEXT,
    day TEXT,
    ts TIMESTAMP,
    value DOUBLE,
    PRIMARY KEY ((sensor_id, day), ts)
) WITH CLUSTERING ORDER BY (ts DESC)
  AND compaction = {
    'class': 'TimeWindowCompactionStrategy',
    'compaction_window_size': 1,
    'compaction_window_unit': 'DAYS'
  };
```

## Common Pitfalls

### Pitfall 1: Relational Thinking in NoSQL
Designing normalized schemas with foreign keys and expecting joins. NoSQL requires denormalization and embedding. [MongoDB](../../Backend/mongodb/SKILL.md) supports $lookup but it's slow. DynamoDB has no joins. Cassandra has no joins.

### Pitfall 2: Poor Shard Key Selection
Using monotonically increasing keys (timestamps, auto-increment IDs) as shard keys. All writes go to the last shard, creating a hot spot. Use hashed shard keys for time-series data.

### Pitfall 3: Overusing Secondary Indexes
Secondary indexes in wide-column stores (Cassandra SASI, [MongoDB](../../Backend/mongodb/SKILL.md) slow queries) are often slower than full scans. Prefer query-by-design (one table per access pattern in Cassandra, GSIs in DynamoDB).

### Pitfall 4: Ignoring Item Size Limits
[MongoDB](../../Backend/mongodb/SKILL.md) has a 16MB document limit. DynamoDB has a 400KB item limit. Exceeding these causes write failures. Plan for large items (gridFS for [MongoDB](../../Backend/mongodb/SKILL.md), S3 references for DynamoDB).

### Pitfall 5: Cross-Partition Queries in Cassandra
Cassandra WHERE clauses can only filter on partition key + clustering columns. Any non-key filter requires ALLOW FILTERING (full scan). Design tables per query pattern.

### Pitfall 6: No [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) Planning for DynamoDB
Using on-demand [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) for predictable workloads costs significantly more. Provisioned [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) with auto-scaling reduces costs 50-70%.

### Pitfall 7: [MongoDB](../../Backend/mongodb/SKILL.md) Without Indexes
Queries without indexes cause collection scans, blocking reads on large collections. Always index query fields. Use explain() to verify index usage.

### Pitfall 8: Over-normalization in DynamoDB
Creating separate tables per entity type loses the single-table design benefits. Use composite keys (PK/SK) with entity_type attribute for multi-entity access.

### Pitfall 9: Ignoring Compaction in Cassandra
Default compaction (SizeTieredCompactionStrategy) causes write amplification and disk space bloat. Use TimeWindowCompactionStrategy for time-series, LeveledCompactionStrategy for read-heavy.

### Pitfall 10: Inconsistent Consistency Configuration
Using different consistency levels for read and write without understanding the implications. Write concern w:majority with read concern local can read uncommitted data.

## Best Practices

- Design data model around access patterns, not data shape. Query-first design.
- Use single-table design in DynamoDB. Entity type attribute, composite PK/SK.
- One table per query pattern in Cassandra. Each table optimized for one access path.
- Embed related data in [MongoDB](../../Backend/mongodb/SKILL.md) when accessed together. Reference when shared.
- Choose shard key with high cardinality and even distribution. Hash time-series keys.
- Prefer Global Secondary Indexes over Local Secondary Indexes in DynamoDB.
- Use compound partition keys in Cassandra for even distribution.
- Set write concern to majority for durability in [MongoDB](../../Backend/mongodb/SKILL.md).
- Use TimeWindowCompactionStrategy for time-series data in Cassandra.
- Enable auto-scaling for DynamoDB provisioned [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../../../DevOps_and_Cloud/Cloud_Providers/azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../../DevOps_and_Cloud/Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md). Monitor consumption.
- Create indexes for all query patterns in [MongoDB](../../Backend/mongodb/SKILL.md). Use explain() to verify.
- Use bulk writes for high-volume inserts. ordered:false for best-effort.
- Test with production-scale data volumes, not synthetic small datasets.
- Monitor hot partitions with CloudWatch / [MongoDB](../../Backend/mongodb/SKILL.md) Atlas metrics.
- Enable point-in-time recovery for DynamoDB (last 35 days).
- Use on-demand backup for schema changes, PITR for operational recovery.

## Compared With

### [MongoDB](../../Backend/mongodb/SKILL.md) vs DynamoDB
[MongoDB](../../Backend/mongodb/SKILL.md) offers richer queries (aggregation pipeline, text search, geospatial) with flexible schema. DynamoDB offers single-digit-millisecond latency at any scale with auto-scaling. Choose [MongoDB](../../Backend/mongodb/SKILL.md) for complex querying. Choose DynamoDB for predictable key-value access with auto-scaling.

### Cassandra vs [MongoDB](../../Backend/mongodb/SKILL.md)
Cassandra writes are faster and scale linearly with nodes. [MongoDB](../../Backend/mongodb/SKILL.md) reads are more flexible (any field, any filter). Cassandra has no joins, no aggregations, no secondary indexes (in practice). [MongoDB](../../Backend/mongodb/SKILL.md) has full query support. Choose Cassandra for write-heavy, no-compromise scalability. Choose [MongoDB](../../Backend/mongodb/SKILL.md) for developer productivity.

### DynamoDB vs Cassandra
DynamoDB is fully managed with auto-scaling, no ops overhead. Cassandra requires operational expertise (compaction, repairs, gossip management). DynamoDB has 400KB item limit, 1MB query limit, and no joins. Cassandra has 2GB cell limit but no practical query size limit. Choose DynamoDB for managed simplicity. Choose Cassandra for multi-region, multi-[datacenter](../../Miscellaneous/datacenter/SKILL.md) control.

### Document vs Wide-Column vs Key-Value
Document stores: flexible schema, rich queries, medium scale. Wide-column: rigid schema by partition key, massive scale, time-series. Key-value: simplest model, fastest lookups, caching. Choose document for general purpose. Choose wide-column for write-heavy time-series. Choose key-value for caching and session management.

## Performance Considerations

- [MongoDB](../../Backend/mongodb/SKILL.md): WiredTiger cache 50% of RAM minus 1GB. Indexes fit in RAM for best performance.
- [MongoDB](../../Backend/mongodb/SKILL.md): Aggregation pipeline $match and $sort use indexes. $lookup requires index on foreign field.
- [MongoDB](../../Backend/mongodb/SKILL.md): Batch inserts: 10K-100K documents per batch. ordered:false for best throughput.
- DynamoDB: One strongly consistent read consumes 1 RCU (4KB). One eventually consistent read consumes 0.5 RCU.
- DynamoDB: One write consumes 1 WCU (1KB). Items > 1KB cost proportionally more.
- DynamoDB: Query returns max 1MB. Pagination required for larger results. Use LastEvaluatedKey.
- DynamoDB: GSI writes are eventually consistent. Writes to main table propagate asynchronously.
- Cassandra: Write throughput scales linearly with node count. 10K writes/sec per node typical.
- Cassandra: Read repair chance: default 10%. Increase for read-heavy, decrease for write-heavy.
- Cassandra: Hinted handoff stores writes for downed nodes up to 3 hours by default.
- Latency targets: DynamoDB single-digit ms, Cassandra 1-5ms per node, [MongoDB](../../Backend/mongodb/SKILL.md) 1-10ms indexed.
- Throughput: DynamoDB on-demand 4K write/sec/partition, read 8K/sec/partition. Cassandra 10K/sec/node.

### NoSQL Use Case Decision Tree

```
Data access pattern?
├── Key-value lookups by primary key
│   ├── High throughput, low latency (< 5ms)
│   │   └── DynamoDB or Redis
│   └── Simple caching, session management
│       └── Redis (in-memory, TTL-based expiry)
├── Document-oriented, flexible schema
│   ├── Rich queries, aggregations, indexes
│   │   └── [MongoDB](../../Backend/mongodb/SKILL.md) (flexible schema, secondary indexes)
│   └── Embedded sub-documents, hierarchical data
│       └── [MongoDB](../../Backend/mongodb/SKILL.md) (embedding avoids joins)
├── Wide-column, time-series, massive write throughput
│   ├── Time-series event data
│   │   └── Cassandra (partition by time bucket, cluster by entity)
│   └── IoT sensor data, write-heavy workloads
│       └── Cassandra (linear scale, no single point of contention)
├── Graph, relationship-heavy
│   ├── Social network, recommendation engine
│   │   └── Neo4j (property graph model, traversal queries)
│   └── Fraud detection, network analysis
│       └── Neptune or Neo4j
└── Search, full-text
    └── Elasticsearch (inverted index, relevance scoring)
```

### Data Modeling Patterns by Database

#### DynamoDB Single-Table Design

```[python](../../Languages/python/SKILL.md)
# Single-table design for e-commerce
# PK: entity type + ID, SK: relationship/sort key
items = {
    # Customer entity
    {"PK": "CUSTOMER#123", "SK": "METADATA", "name": "Alice", "email": "alice@org.com", "tier": "gold"},
    
    # Customer's orders
    {"PK": "CUSTOMER#123", "SK": "ORDER#2026-05-01#ORD001", "order_total": 150.00, "status": "shipped"},
    {"PK": "CUSTOMER#123", "SK": "ORDER#2026-05-15#ORD002", "order_total": 75.00, "status": "pending"},
    
    # Customer's addresses
    {"PK": "CUSTOMER#123", "SK": "ADDR#HOME", "street": "123 Main St", "city": "Portland"},
    
    # Order entity (GSI for order lookup)
    {"PK": "ORDER#ORD001", "SK": "METADATA", "customer_id": "123", "total": 150.00, "status": "shipped"},
    {"PK": "ORDER#ORD001", "SK": "ITEM#PROD-A", "product": "Widget", "price": 100.00, "qty": 1},
    {"PK": "ORDER#ORD001", "SK": "ITEM#PROD-B", "product": "Gadget", "price": 50.00, "qty": 1},
}

# Access patterns:
# Get customer + all orders: Query(PK="CUSTOMER#123")
# Get customer orders by date: Query(PK="CUSTOMER#123", SK begins_with("ORDER#2026-05"))
# Get order details: Query(PK="ORDER#ORD001")
# GSI on status for all orders by status
```

#### [MongoDB](../../Backend/mongodb/SKILL.md) Embedding vs Referencing Decision

```
How is the data accessed?
├── Sub-document accessed WITH parent (always together)
│   └── Embed (e.g., order items in order document)
├── Sub-document independent, but small cardinality
│   └── Embed (e.g., addresses in customer document)
├── Sub-document independent, large cardinality
│   └── Reference with DBRef or manual ID (e.g., orders per customer)
├── Many-to-many relationships
│   └── Reference array (e.g., product categories)
└── Growing unbounded array
    └── Reference (e.g., customer activity log → separate collection)
```

#### Cassandra Data Modeling

```yaml
cassandra_modeling:
  rule: "One table per query pattern"
  example:
    query_pattern_1: "Get orders by customer_id ordered by order_date DESC"
    table: |
      CREATE TABLE orders_by_customer (
        customer_id TEXT,
        order_date DATE,
        order_id UUID,
        total DECIMAL,
        status TEXT,
        PRIMARY KEY (customer_id, order_date, order_id)
      ) WITH CLUSTERING ORDER BY (order_date DESC, order_id ASC);
    
    query_pattern_2: "Get orders by status and date range"
    table: |
      CREATE TABLE orders_by_status (
        status TEXT,
        order_date DATE,
        customer_id TEXT,
        order_id UUID,
        total DECIMAL,
        PRIMARY KEY ((status, order_date), customer_id, order_id)
      );
      
  denormalization:
    - "Duplicate data across tables — disk is cheap, joins are impossible"
    - "Update in batch when source data changes"
    - "Use Materialized Views for automatic denormalization (limited)"
```

## Rules: model around known access patterns, never data shape
- Single-table design in DynamoDB for all related entities
- One table per query pattern in Cassandra
- Embed in [MongoDB](../../Backend/mongodb/SKILL.md) when sub-documents are accessed together
- Shard key must have high cardinality and even distribution
- Hashed shard keys for time-series to prevent hot spots
- Use eventual consistency for read-heavy [dashboards](../../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md)
- Strong consistency for critical financial data
- Denormalize to avoid reads spanning partitions
- No cross-partition queries in Cassandra
- Choose NoSQL type by access pattern: KV for lookups, document for flexibility, wide-column for writes
- Model for access patterns before data shape — NoSQL is query-first design

## References
  - ../../../Global_References/document-db.md — Document Database Reference
  - ../../../Global_References/dynamodb-couchbase.md — DynamoDB and Couchbase Reference
  - ../../../Global_References/[mongodb](../../Backend/mongodb/SKILL.md)-cassandra.md — [MongoDB](../../Backend/mongodb/SKILL.md) and Cassandra Reference
  - ../../../Global_References/nosql-cap-theorem.md — NoSQL CAP Theorem
  - ../../../Global_References/nosql-[performance-tuning](../../Frontend/performance-tuning/SKILL.md).md — NoSQL Performance Tuning
  - ../../../Global_References/wide-column.md — Wide-Column Database Reference
  - ../../../Global_References/nosql-[data-modeling](../../../Data_Engineering/data-modeling/SKILL.md).md — Data modeling patterns for NoSQL databases
  - ../../../Global_References/nosql-query-optimization.md — Query optimization and indexing strategies
## Handoff
`[data-graph-database](../graph-database/SKILL.md)` for relationship-heavy queries
`[data-search-engine](../search-engine/SKILL.md)` for full-text search over NoSQL data

