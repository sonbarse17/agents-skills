---
name: azure-storage
description: "Azure Storage Services including Blob Storage, File Shares, Queue
  Storage, Table Storage, and Data Lake. Answers questions about storage access
  tiers (hot, cool, cold, archive), when to use each tier, and tier comparison.
  Provides object storage, SMB file shares, async messaging, NoSQL key-value,
  and big data analytics. Includes lifecycle management. USE FOR: blob storage,
  file shares, queue storage, table storage, data lake, upload files, download
  blobs, storage accounts, access tiers, storage tiers, hot cool cold archive,
  storage tier comparison, when to use storage tiers, lifecycle management,
  Azure Storage concepts. DO NOT USE FOR: SQL databases, Cosmos DB (use
  azure-prepare), messaging with Event Hubs or Service Bus (use
  azure-messaging)."
license: MIT
metadata:
  author: Microsoft
  version: 1.2.1
tags:
  - cloud_providers
  - azure-storage
depends_on: []
---

# Azure Storage Services

## Services

| Service | Use When | MCP Tools | CLI |
|---------|----------|-----------|-----|
| Blob Storage | Objects, files, backups, static content | `azure__storage` | `az storage blob` |
| File Shares | SMB file shares, lift-and-shift | - | `az storage file` |
| Queue Storage | Async messaging, task queues | - | `az storage queue` |
| Table Storage | NoSQL key-value (consider Cosmos DB) | - | `az storage table` |
| Data Lake | Big data analytics, hierarchical namespace | - | `az storage fs` |

## MCP Server (Preferred)

When Azure MCP is enabled:

- `azure__storage` with command `storage_account_list` - List storage accounts
- `azure__storage` with command `storage_container_list` - List containers in account
- `azure__storage` with command `storage_blob_list` - List blobs in container
- `azure__storage` with command `storage_blob_get` - Download blob content
- `azure__storage` with command `storage_blob_put` - Upload blob content

**If Azure MCP is not enabled:** Run `/azure:setup` or enable via `/mcp`.

## CLI Fallback

```bash
# List storage accounts
az storage account list --output table

# List containers
az storage container list --account-name ACCOUNT --output table

# List blobs
az storage blob list --account-name ACCOUNT --container-name CONTAINER --output table

# Download blob
az storage blob download --account-name ACCOUNT --container-name CONTAINER --name BLOB --file LOCAL_PATH

# Upload blob
az storage blob upload --account-name ACCOUNT --container-name CONTAINER --name BLOB --file LOCAL_PATH
```

## Storage Account Tiers

| Tier | Use Case | Performance |
|------|----------|-------------|
| Standard | General purpose, backup | Milliseconds |
| Premium | Databases, high IOPS | Sub-millisecond |

## Blob Access Tiers

| Tier | Access Frequency | Cost |
|------|-----------------|------|
| Hot | Frequent | Higher storage, lower access |
| Cool | Infrequent (30+ days) | Lower storage, higher access |
| Cold | Rare (90+ days) | Lower still |
| Archive | Rarely (180+ days) | Lowest storage, rehydration required |

## Redundancy Options

| Type | Durability | Use Case |
|------|------------|----------|
| LRS | 11 nines | Dev/test, recreatable data |
| ZRS | 12 nines | Regional high availability |
| GRS | 16 nines | Disaster recovery |
| GZRS | 16 nines | Best durability |

## Service Details

For deep documentation on specific services:

- Blob storage patterns and lifecycle -> [Blob Storage documentation](https://learn.microsoft.com/azure/storage/blobs/storage-blobs-overview)
- File shares and Azure File Sync -> [Azure Files documentation](https://learn.microsoft.com/azure/storage/files/storage-files-introduction)
- Queue patterns and poison handling -> [Queue Storage documentation](https://learn.microsoft.com/azure/storage/queues/storage-queues-introduction)

## SDK Quick References

For building applications with Azure Storage SDKs, see the condensed guides:

- **Blob Storage**: [Python](references/sdk/[azure-storage-blob-py](../azure-sdk-[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/skills/[azure-storage-blob-py](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-blob-py/SKILL.md)/SKILL.md).md) | [TypeScript](references/sdk/[azure-storage-blob-ts](../azure-sdk-[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)/skills/[azure-storage-blob-ts](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-blob-ts/SKILL.md)/SKILL.md).md) | [Java](references/sdk/[azure-storage-blob-java](../azure-sdk-java/skills/[azure-storage-blob-java](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-blob-java/SKILL.md)/SKILL.md).md) | [Rust](references/sdk/[azure-storage-blob-rust](../azure-sdk-rust/skills/[azure-storage-blob-rust](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-blob-rust/SKILL.md)/SKILL.md).md)
- **Queue Storage**: [Python](references/sdk/[azure-storage-queue-py](../azure-sdk-[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/skills/[azure-storage-queue-py](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-queue-py/SKILL.md)/SKILL.md).md) | [TypeScript](references/sdk/[azure-storage-queue-ts](../azure-sdk-[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)/skills/[azure-storage-queue-ts](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-queue-ts/SKILL.md)/SKILL.md).md)
- **File Shares**: [Python](references/sdk/[azure-storage-file-share-py](../azure-sdk-[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/skills/[azure-storage-file-share-py](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-file-share-py/SKILL.md)/SKILL.md).md) | [TypeScript](references/sdk/[azure-storage-file-share-ts](../azure-sdk-[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)/skills/[azure-storage-file-share-ts](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-file-share-ts/SKILL.md)/SKILL.md).md)
- **Data Lake**: [Python](references/sdk/[azure-storage-file-datalake-py](../azure-sdk-[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/skills/[azure-storage-file-datalake-py](../[azure-storage](../azure-skills/skills/azure-storage/SKILL.md)-file-datalake-py/SKILL.md)/SKILL.md).md)
- **Tables**: [Python](references/sdk/[azure-data-tables-py](../[azure-data-tables-py](../azure-sdk-[python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/skills/azure-data-tables-py/SKILL.md)/SKILL.md).md) | [Java](references/sdk/[azure-data-tables-java](../[azure-data-tables-java](../azure-sdk-java/skills/azure-data-tables-java/SKILL.md)/SKILL.md).md)

For full package listing across all languages, see [SDK Usage Guide](../../../Global_References/sdk-usage.md).

## Azure SDKs

For building applications that interact with Azure Storage programmatically, Azure provides SDK packages in multiple languages (.NET, Java, JavaScript, [Python](../../../Software_Engineering_and_Other/Languages/python/SKILL.md), Go, Rust). See [SDK Usage Guide](../../../Global_References/sdk-usage.md) for package names, installation commands, and quick start examples.

