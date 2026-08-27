---
name: azure-storage-queue-ts
description: |
  Azure Queue Storage JavaScript/TypeScript SDK (@azure/storage-queue) for message queue operations. Use for sending, receiving, peeking, and deleting messages in queues. Supports visibility timeout, message encoding, and batch operations. Triggers: "queue storage", "@azure/storage-queue", "QueueServiceClient", "QueueClient", "send message", "receive message", "dequeue", "visibility timeout".
license: MIT
metadata:
  author: Microsoft
  version: "1.0.0"
  package: '@azure/storage-queue'
---

# @azure/storage-queue ([TypeScript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)/JavaScript)

SDK for Azure Queue Storage operations — send, receive, peek, and manage messages in queues.

## Installation

```bash
npm install @azure/storage-queue @azure/identity
```

**Current Version**: 12.x  
**Node.js**: >= 18.0.0

## Environment Variables

```bash
AZURE_STORAGE_ACCOUNT_NAME=<account-name>
AZURE_STORAGE_ACCOUNT_KEY=<account-key>
# OR connection string
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_TOKEN_CREDENTIALS=prod # Required only if DefaultAzureCredential is used in production
```

## Authentication

### Microsoft Entra Token Credential (Recommended)

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { QueueServiceClient } from "@azure/storage-queue";
import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";

// Local dev: DefaultAzureCredential. Production: set AZURE_TOKEN_CREDENTIALS=prod or AZURE_TOKEN_CREDENTIALS=<specific_credential>
const credential = new DefaultAzureCredential({requiredEnvVars: ["AZURE_TOKEN_CREDENTIALS"]});
// Or use a specific credential directly in production:
// See https://learn.microsoft.com/javascript/api/overview/azure/identity-readme?view=azure-node-latest#credential-classes
// const credential = new ManagedIdentityCredential();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const client = new QueueServiceClient(
  `https://${accountName}.queue.core.windows.net`,
  credential
);
```

### Connection String

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { QueueServiceClient } from "@azure/storage-queue";

const client = QueueServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);
```

### StorageSharedKeyCredential (Node.js only)

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { QueueServiceClient, StorageSharedKeyCredential } from "@azure/storage-queue";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const client = new QueueServiceClient(
  `https://${accountName}.queue.core.windows.net`,
  sharedKeyCredential
);
```

### SAS Token

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { QueueServiceClient } from "@azure/storage-queue";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN!;

const client = new QueueServiceClient(
  `https://${accountName}.queue.core.windows.net${sasToken}`
);
```

## Client Hierarchy

```
QueueServiceClient (account level)
└── QueueClient (queue level)
    └── Messages (send, receive, peek, delete)
```

## Queue Operations

### Create Queue

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
const queueClient = client.getQueueClient("my-queue");
await queueClient.create();

// Or create if not exists
await queueClient.createIfNotExists();
```

### List Queues

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
for await (const queue of client.listQueues()) {
  console.log(queue.name);
}

// With prefix filter
for await (const queue of client.listQueues({ prefix: "task-" })) {
  console.log(queue.name);
}
```

### Delete Queue

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
await queueClient.delete();

// Or delete if exists
await queueClient.deleteIfExists();
```

### Get Queue Properties

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
const properties = await queueClient.getProperties();
console.log("Approximate message count:", properties.approximateMessagesCount);
console.log("Metadata:", properties.metadata);
```

### Set Queue Metadata

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
await queueClient.setMetadata({
  department: "engineering",
  priority: "high",
});
```

## Message Operations

### Send Message

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
const queueClient = client.getQueueClient("my-queue");

// Simple message
await queueClient.sendMessage("Hello, World!");

// With options
await queueClient.sendMessage("Delayed message", {
  visibilityTimeout: 60, // Hidden for 60 seconds
  messageTimeToLive: 3600, // Expires in 1 hour
});

// JSON message (must be string)
const task = { type: "process", data: { id: 123 } };
await queueClient.sendMessage(JSON.stringify(task));
```

### Receive Messages

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
// Receive up to 32 messages (default: 1)
const response = await queueClient.receiveMessages({
  numberOfMessages: 10,
  visibilityTimeout: 30, // 30 seconds to process
});

for (const message of response.receivedMessageItems) {
  console.log("Message ID:", message.messageId);
  console.log("Content:", message.messageText);
  console.log("Dequeue Count:", message.dequeueCount);
  console.log("Pop Receipt:", message.popReceipt);
  
  // Process the message...
  
  // Delete after processing
  await queueClient.deleteMessage(message.messageId, message.popReceipt);
}
```

### Peek Messages

Peek without removing from queue (no visibility timeout).

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
const response = await queueClient.peekMessages({
  numberOfMessages: 5,
});

for (const message of response.peekedMessageItems) {
  console.log("Message ID:", message.messageId);
  console.log("Content:", message.messageText);
  // Note: No popReceipt - cannot delete peeked messages
}
```

### Update Message

Extend visibility timeout or update content.

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
// Receive a message
const response = await queueClient.receiveMessages();
const message = response.receivedMessageItems[0];

if (message) {
  // Update content and extend visibility
  const updateResponse = await queueClient.updateMessage(
    message.messageId,
    message.popReceipt,
    "Updated content",
    60 // New visibility timeout in seconds
  );
  
  // Use new popReceipt for subsequent operations
  console.log("New pop receipt:", updateResponse.popReceipt);
}
```

### Delete Message

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
// After receiving
const response = await queueClient.receiveMessages();
const message = response.receivedMessageItems[0];

if (message) {
  await queueClient.deleteMessage(message.messageId, message.popReceipt);
}
```

### Clear All Messages

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
await queueClient.clearMessages();
```

## Message Processing Patterns

### Basic Worker Pattern

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
async function processQueue(queueClient: QueueClient): Promise<void> {
  while (true) {
    const response = await queueClient.receiveMessages({
      numberOfMessages: 10,
      visibilityTimeout: 30,
    });

    if (response.receivedMessageItems.length === 0) {
      // No messages, wait before polling again
      await sleep(5000);
      continue;
    }

    for (const message of response.receivedMessageItems) {
      try {
        await processMessage(message.messageText);
        await queueClient.deleteMessage(message.messageId, message.popReceipt);
      } catch (error) {
        console.error(`Failed to process message ${message.messageId}:`, error);
        // Message will become visible again after timeout
      }
    }
  }
}

async function processMessage(content: string): Promise<void> {
  const task = JSON.parse(content);
  // Process task...
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### Poison Message Handling

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
const MAX_DEQUEUE_COUNT = 5;

async function processWithPoisonHandling(
  queueClient: QueueClient,
  poisonQueueClient: QueueClient
): Promise<void> {
  const response = await queueClient.receiveMessages({
    numberOfMessages: 10,
    visibilityTimeout: 30,
  });

  for (const message of response.receivedMessageItems) {
    if (message.dequeueCount > MAX_DEQUEUE_COUNT) {
      // Move to poison queue
      await poisonQueueClient.sendMessage(message.messageText);
      await queueClient.deleteMessage(message.messageId, message.popReceipt);
      console.log(`Moved message ${message.messageId} to poison queue`);
      continue;
    }

    try {
      await processMessage(message.messageText);
      await queueClient.deleteMessage(message.messageId, message.popReceipt);
    } catch (error) {
      console.error(`Processing failed (attempt ${message.dequeueCount}):`, error);
    }
  }
}
```

### Batch Processing with Visibility Extension

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
async function processBatchWithExtension(queueClient: QueueClient): Promise<void> {
  const response = await queueClient.receiveMessages({
    numberOfMessages: 1,
    visibilityTimeout: 60,
  });

  const message = response.receivedMessageItems[0];
  if (!message) return;

  let popReceipt = message.popReceipt;

  // Start visibility extension timer
  const extensionInterval = setInterval(async () => {
    try {
      const updateResponse = await queueClient.updateMessage(
        message.messageId,
        popReceipt,
        message.messageText,
        60 // Extend by another 60 seconds
      );
      popReceipt = updateResponse.popReceipt;
    } catch (error) {
      console.error("Failed to extend visibility:", error);
    }
  }, 45000); // Extend every 45 seconds

  try {
    await longRunningProcess(message.messageText);
    await queueClient.deleteMessage(message.messageId, popReceipt);
  } finally {
    clearInterval(extensionInterval);
  }
}
```

## Message Encoding

By default, messages are Base64 encoded. You can [customize](../../../../../AI_and_Agents/Infrastructure/deploy-model/[customize](../../../azure-skills/skills/microsoft-foundry/models/deploy-model/[customize](../../../../../Software_Engineering_and_Other/Miscellaneous/customize/SKILL.md)/SKILL.md)/SKILL.md) this:

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { QueueClient } from "@azure/storage-queue";

// Custom encoder/decoder for plain text
const queueClient = new QueueClient(
  `https://${accountName}.queue.core.windows.net/my-queue`,
  credential,
  {
    messageEncoding: "text", // "base64" (default) or "text"
  }
);

// Or with custom encoder
const customQueueClient = new QueueClient(
  `https://${accountName}.queue.core.windows.net/my-queue`,
  credential,
  {
    messageEncoding: {
      encode: (message: string) => Buffer.from(message).toString("base64"),
      decode: (message: string) => Buffer.from(message, "base64").toString(),
    },
  }
);
```

## SAS Token Generation (Node.js only)

### Generate Queue SAS

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import {
  QueueSASPermissions,
  generateQueueSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const sasToken = generateQueueSASQueryParameters(
  {
    queueName: "my-queue",
    permissions: QueueSASPermissions.parse("raup"), // read, add, update, process
    startsOn: new Date(),
    expiresOn: new Date(Date.now() + 3600 * 1000), // 1 hour
  },
  sharedKeyCredential
).toString();

const sasUrl = `https://${accountName}.queue.core.windows.net/my-queue?${sasToken}`;
```

### Generate Account SAS

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import {
  AccountSASPermissions,
  AccountSASResourceTypes,
  AccountSASServices,
  generateAccountSASQueryParameters,
} from "@azure/storage-queue";

const sasToken = generateAccountSASQueryParameters(
  {
    services: AccountSASServices.parse("q").toString(), // queue
    resourceTypes: AccountSASResourceTypes.parse("sco").toString(),
    permissions: AccountSASPermissions.parse("rwdlacupi"),
    expiresOn: new Date(Date.now() + 24 * 3600 * 1000),
  },
  sharedKeyCredential
).toString();
```

## Error Handling

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { RestError } from "@azure/storage-queue";

try {
  await queueClient.sendMessage("test");
} catch (error) {
  if (error instanceof RestError) {
    switch (error.statusCode) {
      case 404:
        console.log("Queue not found");
        break;
      case 400:
        console.log("Bad request - message too large or invalid");
        break;
      case 403:
        console.log("Access denied");
        break;
      case 409:
        console.log("Queue already exists or being deleted");
        break;
      default:
        console.error(`Storage error ${error.statusCode}: ${error.message}`);
    }
  }
  throw error;
}
```

## [TypeScript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md) Types Reference

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import {
  // Clients
  QueueServiceClient,
  QueueClient,

  // Authentication
  StorageSharedKeyCredential,
  AnonymousCredential,

  // SAS
  QueueSASPermissions,
  AccountSASPermissions,
  AccountSASServices,
  AccountSASResourceTypes,
  generateQueueSASQueryParameters,
  generateAccountSASQueryParameters,

  // Messages
  DequeuedMessageItem,
  PeekedMessageItem,
  QueueSendMessageResponse,
  QueueReceiveMessageResponse,
  QueueUpdateMessageResponse,

  // Queue
  QueueItem,
  QueueGetPropertiesResponse,

  // Errors
  RestError,
} from "@azure/storage-queue";
```

## Message Limits

| Limit | Value |
|-------|-------|
| Max message size | 64 KB |
| Max visibility timeout | 7 days |
| Max time-to-live | 7 days (or -1 for infinite) |
| Max messages per receive | 32 |
| Default visibility timeout | 30 seconds |

## Best Practices

1. **Use `DefaultAzureCredential` for local development; use `ManagedIdentityCredential` or `WorkloadIdentityCredential` for production**
2. **Always delete after processing** — Prevent duplicate processing
3. **Handle poison messages** — Move failed messages to a dead-letter queue
4. **Use appropriate visibility timeout** — Set based on expected processing time
5. **Extend visibility for long tasks** — Update message to prevent timeout
6. **Use JSON for structured data** — Serialize objects to JSON strings
7. **Check dequeueCount** — Detect repeatedly failing messages
8. **Use batch receive** — Receive multiple messages for efficiency

## Platform Differences

| Feature | Node.js | Browser |
|---------|---------|---------|
| `StorageSharedKeyCredential` | ✅ | ❌ |
| SAS generation | ✅ | ❌ |
| DefaultAzureCredential | ✅ | ❌ |
| Anonymous/SAS access | ✅ | ✅ |
| All message operations | ✅ | ✅ |
