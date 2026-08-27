---
name: azure-mgmt-fabric-dotnet
description: >
  Azure Resource Manager SDK for Fabric in .NET. Use for MANAGEMENT PLANE
  operations: provisioning, scaling, suspending/resuming Microsoft Fabric
  capacities, checking name availability, and listing SKUs via Azure Resource
  Manager. Triggers: "Fabric capacity", "create capacity", "suspend capacity",
  "resume capacity", "Fabric SKU", "provision Fabric", "ARM Fabric",
  "FabricCapacityResource".
license: MIT
metadata:
  author: Microsoft
  version: 1.0.0
  package: Azure.ResourceManager.Fabric
tags:
  - cloud_providers
  - azure-mgmt-fabric-dotnet
depends_on: []
---

# Azure.ResourceManager.Fabric (.NET)

Management plane SDK for provisioning and managing Microsoft Fabric [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) resources via Azure Resource Manager.

> **Management Plane Only**
> This SDK manages Fabric *capacities* (compute resources). For working with Fabric workspaces, lakehouses, warehouses, and data items, use the Microsoft Fabric REST API or data plane SDKs.

## Installation

```bash
dotnet add package Azure.ResourceManager.Fabric
dotnet add package Azure.Identity
```

**Current Version**: 1.0.0 (GA - September 2025)  
**API Version**: 2023-11-01  
**Target Frameworks**: .NET 8.0, .NET Standard 2.0

## Environment Variables

```bash
AZURE_SUBSCRIPTION_ID=<your-subscription-id> # Required: Azure subscription ID
AZURE_TOKEN_CREDENTIALS=prod  # Required only if DefaultAzureCredential is used in production
AZURE_TENANT_ID=<tenant-id> # For service principal auth (optional)
AZURE_CLIENT_ID=<client-id> # For service principal auth (optional)
AZURE_CLIENT_SECRET=<client-secret> # For service principal auth (optional)
```

## Authentication

```csharp
using Azure.Identity;
using Azure.ResourceManager;
using Azure.ResourceManager.Fabric;

// Local dev: DefaultAzureCredential. Production: set AZURE_TOKEN_CREDENTIALS=prod or AZURE_TOKEN_CREDENTIALS=<specific_credential>
var credential = new DefaultAzureCredential(
    DefaultAzureCredential.DefaultEnvironmentVariableName
);
// Or use a specific credential directly in production:
// See https://learn.microsoft.com/dotnet/api/overview/azure/identity-readme?view=azure-dotnet#credential-classes
// var credential = new ManagedIdentityCredential();
var armClient = new ArmClient(credential);

// Get subscription
var subscription = await armClient.GetDefaultSubscriptionAsync();
```

## Resource Hierarchy

```
ArmClient
└── SubscriptionResource
    └── ResourceGroupResource
        └── FabricCapacityResource
```

## Core Workflows

### 1. Create Fabric [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)

```csharp
using Azure.ResourceManager.Fabric;
using Azure.ResourceManager.Fabric.Models;
using Azure.Core;

// Get resource group
var resourceGroup = await subscription.GetResourceGroupAsync("my-resource-group");

// Define [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) configuration
var administration = new FabricCapacityAdministration(
    new[] { "admin@contoso.com" }  // [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) administrators (UPNs or object IDs)
);

var properties = new FabricCapacityProperties(administration);

var sku = new FabricSku("F64", FabricSkuTier.Fabric);

var capacityData = new FabricCapacityData(
    AzureLocation.WestUS2,
    properties,
    sku)
{
    Tags = { ["Environment"] = "Production" }
};

// Create [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) (long-running operation)
var capacityCollection = resourceGroup.Value.GetFabricCapacities();
var operation = await capacityCollection.CreateOrUpdateAsync(
    WaitUntil.Completed,
    "my-fabric-[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)",
    capacityData);

FabricCapacityResource [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) = operation.Value;
Console.WriteLine($"Created [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md): {[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Data.Name}");
Console.WriteLine($"State: {[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Data.Properties.State}");
```

### 2. Get Fabric [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)

```csharp
// Get existing [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)
var [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) = await resourceGroup.Value
    .GetFabricCapacityAsync("my-fabric-[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)");

Console.WriteLine($"Name: {[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.Data.Name}");
Console.WriteLine($"Location: {[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.Data.Location}");
Console.WriteLine($"SKU: {[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.Data.Sku.Name}");
Console.WriteLine($"State: {[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.Data.Properties.State}");
Console.WriteLine($"Provisioning State: {[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.Data.Properties.ProvisioningState}");
```

### 3. Update [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) (Scale SKU or Change Admins)

```csharp
var [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) = await resourceGroup.Value
    .GetFabricCapacityAsync("my-fabric-[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)");

var patch = new FabricCapacityPatch
{
    Sku = new FabricSku("F128", FabricSkuTier.Fabric),  // Scale up
    Properties = new FabricCapacityUpdateProperties
    {
        Administration = new FabricCapacityAdministration(
            new[] { "admin@contoso.com", "newadmin@contoso.com" }
        )
    }
};

var updateOperation = await [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.UpdateAsync(
    WaitUntil.Completed,
    patch);

Console.WriteLine($"Updated SKU: {updateOperation.Value.Data.Sku.Name}");
```

### 4. Suspend and Resume [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)

```csharp
// Suspend [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) (stop billing for compute)
await [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.SuspendAsync(WaitUntil.Completed);
Console.WriteLine("[Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) suspended");

// Resume [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)
var resumeOperation = await [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.ResumeAsync(WaitUntil.Completed);
Console.WriteLine($"[Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) resumed. State: {resumeOperation.Value.Data.Properties.State}");
```

### 5. Delete [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)

```csharp
await [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.DeleteAsync(WaitUntil.Completed);
Console.WriteLine("[Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) deleted");
```

### 6. List All Capacities

```csharp
// In a resource group
await foreach (var cap in resourceGroup.Value.GetFabricCapacities())
{
    Console.WriteLine($"- {cap.Data.Name} ({cap.Data.Sku.Name})");
}

// In a subscription
await foreach (var cap in subscription.GetFabricCapacitiesAsync())
{
    Console.WriteLine($"- {cap.Data.Name} in {cap.Data.Location}");
}
```

### 7. Check Name Availability

```csharp
var checkContent = new FabricNameAvailabilityContent
{
    Name = "my-new-[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)",
    ResourceType = "Microsoft.Fabric/capacities"
};

var result = await subscription.CheckFabricCapacityNameAvailabilityAsync(
    AzureLocation.WestUS2,
    checkContent);

if (result.Value.IsNameAvailable == true)
{
    Console.WriteLine("Name is available!");
}
else
{
    Console.WriteLine($"Name unavailable: {result.Value.Reason} - {result.Value.Message}");
}
```

### 8. List Available SKUs

```csharp
// List all SKUs available in subscription
await foreach (var skuDetails in subscription.GetSkusFabricCapacitiesAsync())
{
    Console.WriteLine($"SKU: {skuDetails.Name}");
    Console.WriteLine($"  Resource Type: {skuDetails.ResourceType}");
    foreach (var location in skuDetails.Locations)
    {
        Console.WriteLine($"  Location: {location}");
    }
}

// List SKUs available for an existing [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) (for scaling)
await foreach (var skuDetails in [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md).Value.GetSkusForCapacityAsync())
{
    Console.WriteLine($"Can scale to: {skuDetails.Sku.Name}");
}
```

## SKU Reference

| SKU Name | [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) Units (CU) | Power BI Equivalent |
|----------|---------------------|---------------------|
| F2 | 2 | - |
| F4 | 4 | - |
| F8 | 8 | EM1/A1 |
| F16 | 16 | EM2/A2 |
| F32 | 32 | EM3/A3 |
| F64 | 64 | P1/A4 |
| F128 | 128 | P2/A5 |
| F256 | 256 | P3/A6 |
| F512 | 512 | P4/A7 |
| F1024 | 1024 | P5/A8 |
| F2048 | 2048 | - |

## Key Types Reference

| Type | Purpose |
|------|---------|
| `ArmClient` | Entry point for all ARM operations |
| `FabricCapacityResource` | Represents a Fabric [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) instance |
| `FabricCapacityCollection` | Collection for [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) CRUD operations |
| `FabricCapacityData` | [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) creation/read data model |
| `FabricCapacityPatch` | [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) update payload |
| `FabricCapacityProperties` | [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) properties (administration, state) |
| `FabricCapacityAdministration` | Admin members configuration |
| `FabricSku` | SKU configuration (name and tier) |
| `FabricSkuTier` | Pricing tier (currently only "Fabric") |
| `FabricProvisioningState` | Provisioning states (Succeeded, Failed, etc.) |
| `FabricResourceState` | Resource states (Active, Suspended, etc.) |
| `FabricNameAvailabilityContent` | Name availability check request |
| `FabricNameAvailabilityResult` | Name availability check response |

## Provisioning and Resource States

### Provisioning States (`FabricProvisioningState`)
- `Succeeded` - Operation completed successfully
- `Failed` - Operation failed
- `Canceled` - Operation was canceled
- `Deleting` - [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) is being deleted
- `Provisioning` - Initial provisioning in progress
- `Updating` - Update operation in progress

### Resource States (`FabricResourceState`)
- `Active` - [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) is running and available
- `Provisioning` - Being provisioned
- `Failed` - In failed state
- `Updating` - Being updated
- `Deleting` - Being deleted
- `Suspending` - Transitioning to suspended
- `Suspended` - Suspended (not billing for compute)
- `Pausing` - Transitioning to paused
- `Paused` - Paused
- `Resuming` - Resuming from suspended/paused
- `Scaling` - Scaling to different SKU
- `Preparing` - Preparing resources

## Best Practices

1. **Use `WaitUntil.Completed`** for operations that must finish before proceeding
2. **Use `WaitUntil.Started`** when you want to poll manually or run operations in parallel
3. **Use `DefaultAzureCredential`** — never hardcode credentials
4. **Handle `RequestFailedException`** for ARM API errors
5. **Use `CreateOrUpdateAsync`** for idempotent operations
6. **Suspend when not in use** — Fabric capacities bill for compute even when idle
7. **Check provisioning state** before performing operations on a [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)
8. **Use appropriate SKU** — Start small (F2/F4) for dev/test, scale up for production

## Error Handling

```csharp
using Azure;

try
{
    var operation = await capacityCollection.CreateOrUpdateAsync(
        WaitUntil.Completed, capacityName, capacityData);
}
catch (RequestFailedException ex) when (ex.Status == 409)
{
    Console.WriteLine("[Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) already exists or conflict");
}
catch (RequestFailedException ex) when (ex.Status == 400)
{
    Console.WriteLine($"Invalid configuration: {ex.Message}");
}
catch (RequestFailedException ex) when (ex.Status == 403)
{
    Console.WriteLine("Insufficient permissions or quota exceeded");
}
catch (RequestFailedException ex)
{
    Console.WriteLine($"ARM Error: {ex.Status} - {ex.ErrorCode}: {ex.Message}");
}
```

## Common Pitfalls

1. **[Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) names must be globally unique** — Fabric [capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) names must be unique across all Azure subscriptions
2. **Suspend doesn't delete** — Suspended capacities still exist but don't bill for compute
3. **SKU changes may require downtime** — Scaling operations can take several minutes
4. **Admin UPNs must be valid** — [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) administrators must be valid Azure AD users
5. **Location constraints** — Not all SKUs are available in all regions; use `GetSkusFabricCapacitiesAsync` to check
6. **Long provisioning times** — [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) creation can take 5-15 minutes

## Related SDKs

| SDK | Purpose | Install |
|-----|---------|---------|
| `Azure.ResourceManager.Fabric` | Management plane (this SDK) | `dotnet add package Azure.ResourceManager.Fabric` |
| `Microsoft.Fabric.Api` | Data plane operations (beta) | `dotnet add package Microsoft.Fabric.Api --prerelease` |
| `Azure.ResourceManager` | Core ARM SDK | `dotnet add package Azure.ResourceManager` |
| `Azure.Identity` | Authentication | `dotnet add package Azure.Identity` |

## References

- [Azure.ResourceManager.Fabric NuGet](https://www.nuget.org/packages/Azure.ResourceManager.Fabric)
- [GitHub Source](https://[github](../../CI_CD/github/SKILL.md).com/Azure/azure-sdk-for-net/tree/main/sdk/fabric/Azure.ResourceManager.Fabric)
- [Microsoft Fabric Documentation](https://learn.microsoft.com/fabric/)
- [Fabric [Capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md) Management](https://learn.microsoft.com/fabric/admin/service-admin-portal-[capacity](../../../AI_and_Agents/Infrastructure/deploy-model/[capacity](../azure-skills/skills/microsoft-foundry/models/deploy-model/[capacity](../../Observability_and_SecOps/capacity/SKILL.md)/SKILL.md)/SKILL.md)-settings)
