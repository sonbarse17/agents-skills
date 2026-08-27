---
name: azure-identity-ts
description: Authenticate to Azure services using Azure Identity library for
  JavaScript (@azure/identity). Use when configuring authentication with
  DefaultAzureCredential, managed identity, service principals, or interactive
  browser login.
license: MIT
metadata:
  author: Microsoft
  version: 1.0.0
  package: "@azure/identity"
tags:
  - skills
  - azure-identity-ts
depends_on: []
---

# Azure Identity library for [TypeScript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)

Authentication library for Azure SDK clients using Microsoft Entra ID.

## Installation

```bash
npm install @azure/identity

# For Visual Studio Code credential support
npm install @azure/identity-vscode
```

## Environment Variables

### Service Principal (Secret)

```bash
AZURE_TENANT_ID=<tenant-id>
AZURE_CLIENT_ID=<client-id>
AZURE_CLIENT_SECRET=<client-secret>
AZURE_TOKEN_CREDENTIALS=prod # Required only if DefaultAzureCredential is used in production
```

### Service Principal (Certificate)

```bash
AZURE_TENANT_ID=<tenant-id>
AZURE_CLIENT_ID=<client-id>
AZURE_CLIENT_CERTIFICATE_PATH=/path/to/cert.pem
AZURE_CLIENT_CERTIFICATE_PASSWORD=<optional-password>
```

### Workload Identity ([Kubernetes](../../../../Containers_and_Orchestration/kubernetes/SKILL.md))

```bash
AZURE_TENANT_ID=<tenant-id>
AZURE_CLIENT_ID=<client-id>
AZURE_FEDERATED_TOKEN_FILE=/var/run/secrets/tokens/azure-identity
```

## DefaultAzureCredential (Recommended for Local Development)

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { DefaultAzureCredential, ManagedIdentityCredential } from "@azure/identity";

// Local dev: DefaultAzureCredential. Production: set AZURE_TOKEN_CREDENTIALS=prod or AZURE_TOKEN_CREDENTIALS=<specific_credential>
const credential = new DefaultAzureCredential({requiredEnvVars: ["AZURE_TOKEN_CREDENTIALS"]});
// Or use a specific credential directly in production:
// See https://learn.microsoft.com/javascript/api/overview/azure/identity-readme?view=azure-node-latest#credential-classes
// const credential = new ManagedIdentityCredential();

// Use with any Azure SDK client
import { BlobServiceClient } from "@azure/storage-blob";
const blobClient = new BlobServiceClient(
  "https://<account>.blob.core.windows.net",
  credential
);
```

See [DefaultAzureCredential overview](https://aka.ms/azsdk/js/identity/credential-chains#defaultazurecredential-overview) for the current credential chain order and defaults.

## Managed Identity

### System-Assigned

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { ManagedIdentityCredential } from "@azure/identity";

const credential = new ManagedIdentityCredential();
```

### User-Assigned (by Client ID)

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
const credential = new ManagedIdentityCredential({
  clientId: "<user-assigned-client-id>"
});
```

### User-Assigned (by Resource ID)

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
const credential = new ManagedIdentityCredential({
  resourceId: "/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<name>"
});
```

### User-Assigned (by Object ID)

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
const credential = new ManagedIdentityCredential({
  objectId: "<user-assigned-object-id>"
});
```

## Service Principal

### Client Secret

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { ClientSecretCredential } from "@azure/identity";

const credential = new ClientSecretCredential(
  "<tenant-id>",
  "<client-id>",
  "<client-secret>"
);
```

### Client Certificate

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { ClientCertificateCredential } from "@azure/identity";

const credential = new ClientCertificateCredential(
  "<tenant-id>",
  "<client-id>",
  { certificatePath: "/path/to/cert.pem" }
);

// With password
const credentialWithPwd = new ClientCertificateCredential(
  "<tenant-id>",
  "<client-id>",
  { 
    certificatePath: "/path/to/cert.pem",
    certificatePassword: "<password>"
  }
);
```

## Interactive Authentication

### Browser-Based Login

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { InteractiveBrowserCredential } from "@azure/identity";

const credential = new InteractiveBrowserCredential({
  clientId: "<client-id>",
  tenantId: "<tenant-id>",
  loginHint: "user@example.com"
});
```

### Device Code Flow

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { DeviceCodeCredential } from "@azure/identity";

const credential = new DeviceCodeCredential({
  clientId: "<client-id>",
  tenantId: "<tenant-id>",
  userPromptCallback: (info) => {
    console.log(info.message);
    // "To sign in, use a web browser to open..."
  }
});
```

## Custom Credential Chain

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { 
  ChainedTokenCredential,
  ManagedIdentityCredential,
  AzureCliCredential
} from "@azure/identity";

// Try managed identity first, fall back to CLI
const credential = new ChainedTokenCredential(
  new ManagedIdentityCredential(),
  new AzureCliCredential()
);
```

## Developer Credentials

### Visual Studio Code

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { useIdentityPlugin, VisualStudioCodeCredential } from "@azure/identity";
import { vsCodePlugin } from "@azure/identity-vscode";

useIdentityPlugin(vsCodePlugin);

const credential = new VisualStudioCodeCredential();
```

### Azure CLI

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { AzureCliCredential } from "@azure/identity";

const credential = new AzureCliCredential();
// Uses: az login
```

### Azure Developer CLI

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { AzureDeveloperCliCredential } from "@azure/identity";

const credential = new AzureDeveloperCliCredential();
// Uses: azd auth login
```

### Azure PowerShell

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { AzurePowerShellCredential } from "@azure/identity";

const credential = new AzurePowerShellCredential();
// Uses: Connect-AzAccount
```

## Sovereign Clouds

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { ClientSecretCredential, AzureAuthorityHosts } from "@azure/identity";

// Azure Government
const credential = new ClientSecretCredential(
  "<tenant>", "<client>", "<secret>",
  { authorityHost: AzureAuthorityHosts.AzureGovernment }
);

// Azure China
const credentialChina = new ClientSecretCredential(
  "<tenant>", "<client>", "<secret>",
  { authorityHost: AzureAuthorityHosts.AzureChina }
);
```

## Bearer Token Provider

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";

const credential = new DefaultAzureCredential({requiredEnvVars: ["AZURE_TOKEN_CREDENTIALS"]});

// Create a function that returns tokens
const getAccessToken = getBearerTokenProvider(
  credential,
  "https://cognitiveservices.azure.com/.default"
);

// Use with APIs that need bearer tokens
const token = await getAccessToken();
```

## Key Types

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import type { 
  TokenCredential, 
  AccessToken, 
  GetTokenOptions 
} from "@azure/core-auth";

import {
  DefaultAzureCredential,
  DefaultAzureCredentialOptions,
  ManagedIdentityCredential,
  ClientSecretCredential,
  ClientCertificateCredential,
  InteractiveBrowserCredential,
  ChainedTokenCredential,
  AzureCliCredential,
  AzurePowerShellCredential,
  AzureDeveloperCliCredential,
  DeviceCodeCredential,
  AzureAuthorityHosts
} from "@azure/identity";
```

## Custom Credential Implementation

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import type { TokenCredential, AccessToken, GetTokenOptions } from "@azure/core-auth";

class CustomCredential implements TokenCredential {
  async getToken(
    scopes: string | string[],
    options?: GetTokenOptions
  ): Promise<AccessToken | null> {
    // Custom token acquisition logic
    return {
      token: "<access-token>",
      expiresOnTimestamp: Date.now() + 3600000
    };
  }
}
```

## Debugging

```[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
import { setLogLevel, AzureLogger } from "@azure/logger";

setLogLevel("verbose");

// Custom log handler
AzureLogger.log = (...args) => {
  console.log("[Azure]", ...args);
};
```

## Best Practices

1. **Use `DefaultAzureCredential` for local development; use `ManagedIdentityCredential` or `WorkloadIdentityCredential` for production**
2. **Never hardcode credentials** - Use environment variables or managed identity
3. **Prefer managed identity** - No secrets to manage in production
4. **Scope credentials appropriately** - Use user-assigned identity for multi-tenant scenarios
5. **Handle token refresh** - Azure SDK handles this automatically
6. **Use ChainedTokenCredential** - For custom fallback scenarios
