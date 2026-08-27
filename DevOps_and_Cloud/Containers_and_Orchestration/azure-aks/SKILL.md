---
name: azure-aks
description: Deploy and manage Azure Kubernetes Service clusters. Configure node
  pools, networking, and integrations. Use when running Kubernetes workloads on
  Azure.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
tags:
  - containers_and_orchestration
  - azure-aks
depends_on: []
---

# Azure [Kubernetes](../kubernetes/SKILL.md) Service

Deploy and manage production-grade [Kubernetes](../kubernetes/SKILL.md) clusters on Azure with AKS. Covers cluster creation, node pool management, networking, ingress controllers, [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md), security, and Terraform-based provisioning.

## When to Use

- You need managed [Kubernetes](../kubernetes/SKILL.md) without maintaining control plane infrastructure.
- Your workloads require container orchestration with auto-scaling.
- You need tight integration with Azure AD, Key [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md), and Container Registry.
- You are running [microservices](../../../Software_Engineering_and_Other/Patterns/microservices/SKILL.md) that require service mesh, ingress, or network policies.
- You need GPU or spot node pools for specialized or cost-optimized workloads.

## Prerequisites

```bash
# Install Azure CLI and [kubectl](../kubectl/SKILL.md)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az aks install-cli

# Login and set subscription
az login
az account set --subscription "my-subscription-id"

# Register required providers
az provider register --namespace Microsoft.ContainerService
az provider register --namespace Microsoft.OperationsManagement

# Verify [kubectl](../kubectl/SKILL.md)
[kubectl](../kubectl/SKILL.md) version --client
```

## Cluster Creation

### Basic Production Cluster

```bash
# Create resource group
az group create --name myapp-rg --location eastus

# Create AKS cluster with best-practice defaults
az aks create \
  --resource-group myapp-rg \
  --name myapp-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v5 \
  --enable-managed-identity \
  --enable-cluster-autoscaler \
  --min-count 2 \
  --max-count 10 \
  --network-plugin azure \
  --network-policy calico \
  --service-cidr 10.1.0.0/16 \
  --dns-service-ip 10.1.0.10 \
  --vnet-subnet-id "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/{vnet}/subnets/{subnet}" \
  --enable-aad \
  --aad-admin-group-object-ids "{aad-group-id}" \
  --enable-azure-rbac \
  --zones 1 2 3 \
  --generate-ssh-keys \
  --tags environment=prod team=platform

# Get cluster credentials
az aks get-credentials --resource-group myapp-rg --name myapp-aks

# Verify cluster access
[kubectl](../kubectl/SKILL.md) get nodes -o wide
[kubectl](../kubectl/SKILL.md) cluster-info
```

### Private Cluster

```bash
az aks create \
  --resource-group myapp-rg \
  --name myapp-private-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v5 \
  --enable-managed-identity \
  --enable-private-cluster \
  --private-dns-zone system \
  --network-plugin azure \
  --vnet-subnet-id "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/{vnet}/subnets/{subnet}" \
  --generate-ssh-keys
```

## Node Pool Management

```bash
# Add a user node pool for application workloads
az aks nodepool add \
  --resource-group myapp-rg \
  --cluster-name myapp-aks \
  --name apppool \
  --node-count 3 \
  --node-vm-size Standard_D8s_v5 \
  --mode User \
  --enable-cluster-autoscaler \
  --min-count 2 \
  --max-count 15 \
  --zones 1 2 3 \
  --labels workload=app tier=frontend \
  --node-taints dedicated=app:NoSchedule \
  --max-pods 50

# Add GPU node pool for ML workloads
az aks nodepool add \
  --resource-group myapp-rg \
  --cluster-name myapp-aks \
  --name gpupool \
  --node-count 1 \
  --node-vm-size Standard_NC6s_v3 \
  --mode User \
  --enable-cluster-autoscaler \
  --min-count 0 \
  --max-count 4 \
  --node-taints sku=gpu:NoSchedule \
  --labels workload=ml

# Add spot instance pool for batch workloads
az aks nodepool add \
  --resource-group myapp-rg \
  --cluster-name myapp-aks \
  --name spotpool \
  --node-count 2 \
  --node-vm-size Standard_D4s_v5 \
  --priority Spot \
  --eviction-policy Delete \
  --spot-max-price -1 \
  --enable-cluster-autoscaler \
  --min-count 0 \
  --max-count 20 \
  --labels workload=batch

# Scale a node pool manually
az aks nodepool scale \
  --resource-group myapp-rg \
  --cluster-name myapp-aks \
  --name apppool \
  --node-count 5

# Upgrade a node pool
az aks nodepool upgrade \
  --resource-group myapp-rg \
  --cluster-name myapp-aks \
  --name apppool \
  --[kubernetes](../kubernetes/SKILL.md)-version 1.28.3

# List node pools
az aks nodepool list \
  --resource-group myapp-rg \
  --cluster-name myapp-aks \
  --output table
```

## Ingress Controller Setup

```bash
# Install NGINX ingress controller via Helm
helm repo add ingress-nginx https://[kubernetes](../kubernetes/SKILL.md).[github](../../CI_CD/github/SKILL.md).io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.nodeSelector."[kubernetes](../kubernetes/SKILL.md)\.io/os"=linux \
  --set controller.service.annotations."service\.beta\.[kubernetes](../kubernetes/SKILL.md)\.io/azure-load-balancer-health-probe-request-path"=/healthz \
  --set controller.service.externalTrafficPolicy=Local

# Verify the ingress controller and get external IP
[kubectl](../kubectl/SKILL.md) get svc -n ingress-nginx
```

### Ingress Resource Example

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  namespace: myapp
  annotations:
    nginx.ingress.[kubernetes](../kubernetes/SKILL.md).io/ssl-redirect: "true"
    nginx.ingress.[kubernetes](../kubernetes/SKILL.md).io/proxy-body-size: "50m"
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

## [Monitoring](../../Observability_and_SecOps/monitoring/SKILL.md) and Logging

```bash
# Enable Container Insights
az aks enable-addons \
  --resource-group myapp-rg \
  --name myapp-aks \
  --addons [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md) \
  --workspace-resource-id "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.OperationalInsights/workspaces/{workspace}"

# Enable Azure Policy add-on
az aks enable-addons \
  --resource-group myapp-rg \
  --name myapp-aks \
  --addons azure-policy

# Enable Key [Vault](../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) secrets provider
az aks enable-addons \
  --resource-group myapp-rg \
  --name myapp-aks \
  --addons [azure-keyvault](../../Cloud_Providers/azure-keyvault/SKILL.md)-secrets-provider

# View cluster diagnostics
az aks show \
  --resource-group myapp-rg \
  --name myapp-aks \
  --query "addonProfiles" \
  --output table

# Install Prometheus + Grafana via Helm
helm repo add prometheus-community https://prometheus-community.[github](../../CI_CD/github/SKILL.md).io/[helm-charts](../helm-charts/SKILL.md)
helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md) \
  --create-namespace \
  --set grafana.adminPassword='SecureGrafanaP@ss'
```

## ACR Integration

```bash
# Create Azure Container Registry
az acr create \
  --resource-group myapp-rg \
  --name myappacr \
  --sku Standard

# Attach ACR to AKS (grants AcrPull role)
az aks update \
  --resource-group myapp-rg \
  --name myapp-aks \
  --attach-acr myappacr

# Build and push image
az acr build \
  --registry myappacr \
  --image myapp:v1.0 \
  --file Dockerfile .

# Verify pull access
[kubectl](../kubectl/SKILL.md) run test --image=myappacr.azurecr.io/myapp:v1.0 --rm -it --restart=Never -- echo "ACR pull works"
```

## Terraform Configuration

```hcl
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "myapp-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "myapp"
  kubernetes_version  = "1.28"

  default_node_pool {
    name                = "system"
    vm_size             = "Standard_D4s_v5"
    enable_auto_scaling = true
    min_count           = 2
    max_count           = 5
    zones               = [1, 2, 3]
    vnet_subnet_id      = azurerm_subnet.aks.id

    node_labels = {
      role = "system"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "calico"
    service_cidr      = "10.1.0.0/16"
    dns_service_ip    = "10.1.0.10"
    load_balancer_sku = "standard"
  }

  azure_active_directory_role_based_access_control {
    managed                = true
    azure_rbac_enabled     = true
    admin_group_object_ids = [var.aks_admin_group_id]
  }

  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  }

  key_vault_secrets_provider {
    secret_rotation_enabled = true
  }

  tags = var.tags
}

resource "azurerm_kubernetes_cluster_node_pool" "app" {
  name                  = "app"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks.id
  vm_size               = "Standard_D8s_v5"
  enable_auto_scaling   = true
  min_count             = 2
  max_count             = 15
  zones                 = [1, 2, 3]
  vnet_subnet_id        = azurerm_subnet.aks.id

  node_labels = {
    workload = "app"
  }

  node_taints = [
    "dedicated=app:NoSchedule"
  ]

  tags = var.tags
}
```

## Cluster Upgrades

```bash
# Check available [Kubernetes](../kubernetes/SKILL.md) versions
az aks get-upgrades \
  --resource-group myapp-rg \
  --name myapp-aks \
  --output table

# Upgrade control plane first
az aks upgrade \
  --resource-group myapp-rg \
  --name myapp-aks \
  --[kubernetes](../kubernetes/SKILL.md)-version 1.28.3 \
  --control-plane-only

# Then upgrade each node pool
az aks nodepool upgrade \
  --resource-group myapp-rg \
  --cluster-name myapp-aks \
  --name apppool \
  --[kubernetes](../kubernetes/SKILL.md)-version 1.28.3

# Check upgrade status
az aks show \
  --resource-group myapp-rg \
  --name myapp-aks \
  --query "provisioningState"
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Nodes in `NotReady` state | VM resource exhaustion or network issues | Run `[kubectl](../kubectl/SKILL.md) describe node <name>` and check events; scale up if needed |
| Pods stuck in `Pending` | No available nodes or resource requests too high | Check autoscaler status with `az aks show`; adjust resource requests |
| `ImagePullBackOff` error | ACR not attached or image tag wrong | Verify with `az aks check-acr --name myapp-aks --acr myappacr.azurecr.io` |
| Ingress returns 404 | Service or path mismatch in Ingress spec | Verify `[kubectl](../kubectl/SKILL.md) get ingress` and service endpoints |
| Private cluster unreachable | No VPN or private endpoint configured | Use `az aks command invoke` or configure private DNS resolution |
| Cluster autoscaler not scaling | Pod resource requests not set | Define CPU/memory requests on all pods so the scheduler can calculate demand |
| Azure Policy violations blocking pods | Restrictive policies applied | Check `[kubectl](../kubectl/SKILL.md) get constrainttemplate` and adjust policy assignments |
| Persistent volume not binding | StorageClass mismatch or zone issue | Verify `[kubectl](../kubectl/SKILL.md) get pvc` and ensure StorageClass matches node pool zones |

## Related Skills

- `[terraform-azure](../../Infrastructure_as_Code/terraform-azure/SKILL.md)` -- Provision AKS clusters with Terraform for repeatable infrastructure.
- `[azure-networking](../../Cloud_Providers/azure-networking/SKILL.md)` -- VNet and subnet configuration required by Azure CNI.
- `[arm-templates](../../Cloud_Providers/arm-templates/SKILL.md)` -- Bicep-based AKS deployment as an alternative to Terraform.
- `[azure-vms](../../Cloud_Providers/azure-vms/SKILL.md)` -- Understanding VM sizes for node pool selection.
