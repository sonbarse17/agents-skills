---
name: blockchain-infrastructure
description: >
  Use this skill when asked about blockchain node deployment, RPC
  infrastructure, CI/CD for smart contracts, monitoring and alerting for
  blockchain networks, MEV infrastructure (Flashbots, builders, relays), key
  management (KMS, HSM), and environment management for
  devnet/testnet/staging/mainnet. Languages: Go, Rust, TypeScript, Python,
  Shell. Covers node deployment (archive, full, validator nodes on
  bare-metal/cloud/K8s), RPC infrastructure (load balancing, caching, WSS, rate
  limiting), MEV infrastructure (builder/relay setup, searcher infrastructure,
  block building optimization), key management (AWS KMS, Fireblocks, HSMs, MPC
  signing, validator key management), CI/CD pipelines for smart contract
  testing/deployment/verification, blockchain monitoring (Prometheus exporters,
  Grafana, Forta, Tenderly), and multi-environment configuration (devnet,
  testnet, staging, mainnet per chain). Integrates with shared devops skills. Do
  NOT use for: core protocol development (use blockchain-core), smart contract
  development (use blockchain-application), or general devops outside blockchain
  context.
version: 2.0.0
author: j4flmao
license: MIT
tags:
  - blockchain
  - infrastructure
  - devops
  - deployment
  - phase-blockchain
depends_on: []
---

# Blockchain Infrastructure

## Purpose
Guide blockchain infrastructure operations: node deployment, RPC infrastructure, smart contract CI/CD, [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md), MEV infrastructure, and key management. Covers production-grade deployment patterns for all major blockchain networks.

## Agent Protocol

### Trigger
"blockchain deploy", "node deployment", "archive node", "validator node", "RPC infrastructure", "blockchain RPC", "JSON-RPC load balancing", "smart contract CI/CD", "forge CI", "hardhat CI", "blockchain [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md)", "Prometheus blockchain", "Grafana blockchain", "Forta", "Tenderly", "devnet", "testnet", "blockchain environment", "mainnet deploy", "contract verification", "blockchain DevOps", "MEV infrastructure", "builder", "relay", "Flashbots", "MEV relay", "block building", "KMS", "HSM", "key management blockchain", "Fireblocks", "HSM blockchain", "validator key management", "searcher infrastructure"

### Input Context
- Blockchain networks to support
- Node types (archive/full/validator)
- Infrastructure provider ([bare-metal](../../AI_and_Agents/Models_and_FineTuning/bare-metal/SKILL.md)/cloud/K8s)
- Scale requirements (RPC load, number of chains, validators)
- Security requirements (key management, access control, compliance)
- Budget constraints

### Output Artifact
Infrastructure architecture specification including: deployment topology, provisioning configuration, CI/CD pipeline, [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) stack, and operations [runbooks](../../DevOps_and_Cloud/Observability_and_SecOps/runbooks/SKILL.md).

### Response Format
1. **Deployment topology**: node type, infrastructure sizing, network requirements, geographic distribution
2. **Provisioning**: [Ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md)/Terraform/K8s configuration, secrets management, upgrade strategy
3. **CI/CD pipeline**: test → build → verify → deploy → monitor flow with security gates
4. **Configuration**: environment-specific parameters, chain settings, multi-env strategy
5. **[Monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) & [alerting](../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md)**: metrics, [dashboards](../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md), SLOs, [runbooks](../../DevOps_and_Cloud/Observability_and_SecOps/runbooks/SKILL.md), escalation

### Completion Criteria
- Node deployment topology includes: sizing, network, storage, and HA strategy
- Provisioning automation covers: initial setup, upgrades, backups, disaster recovery
- CI/CD pipeline includes: contract testing, static analysis, deployment, verification, [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md)
- [Monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) covers: node health, chain health, infrastructure health, security events
- [Runbooks](../../DevOps_and_Cloud/Observability_and_SecOps/runbooks/SKILL.md) document: deploy, upgrade, rollback, [incident](../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) response procedures

### Max Response Length
5000 tokens

## Decision Trees

### Node Deployment
```
Node requirement:
├── Archive node (full historical state)?
│   ├── Storage: 12TB+ (Ethereum), 500GB+ (Solana)
│   ├── RAM: 64GB+ (Erigon), 128GB+ (geth full archive)
│   ├── CPU: 16+ cores
│   └── Sync: weeks (snapshot sync recommended)
├── Full node (recent state only)?
│   ├── Storage: 2-4TB SSD
│   ├── RAM: 32GB+
│   ├── CPU: 8+ cores
│   └── Sync: days (snapshot sync available)
├── Validator node?
│   ├── Same as full node + low latency to other validators
│   ├── MEV-Boost integration for Ethereum validators
│   └── Redundant internet connection (2+ ISPs)
└── Light node?
    ├── Minimal storage (MBs)
    ├── Trust-minimized via state proofs
    └── Suitable for wallets, mobile, embedded
```

### RPC Infrastructure Pattern
```
RPC traffic:
├── Read-heavy (queries, data fetching)?
│   ├── Multi-region full nodes behind load balancer
│   ├── Cache layer (Redis for common queries)
│   ├── Read replicas for historical data
│   └── Rate limiting per API key/user/IP
├── Write-heavy (transaction submission)?
│   ├── Direct node connection (no LB for tx broadcast)
│   ├── Transaction replacement (Replace-by-fee)
│   ├── Private mempool integration (Flashbots Protect)
│   └── Gas estimation caching
└── Real-time (WebSocket)?
    ├── Dedicated WSS nodes (not behind HTTP LB)
    ├── Connection pooling (many concurrent subs)
    ├── Sticky sessions for subscription consistency
    └── Heartbeat/keepalive management
```

### MEV Infrastructure
```
Role in MEV supply chain:
├── Searcher?
│   ├── Private mempool access (Flashbots, BloxRoute)
│   ├── Backrun/arbitrage bot infrastructure
│   ├── Fast node (low latency to builders)
│   └── Simulation engine (eth_call bundle simulation)
├── Builder?
│   ├── High-performance block building
│   ├── Order flow integration (searcher bundles + public tx pool)
│   ├── Optimistic relaying for latency
│   └── Compliance: OFAC filtering, MEV-Boost relays
├── Relayer?
│   ├── MEV-Boost relay (Flashbots, bloXroute, Eden, RelayScan)
│   ├── Block validation before forwarding
│   ├── Bid privacy (encrypted until slot)
│   └── DoS protection and rate limiting
└── Validator (MEV-Boost)?
    ├── mev-boost binary installation
    ├── Relay configuration (trusted relays)
    ├── Fee recipient address
    └── Max profitable blocks (boost timeout)
```

### Cloud Provider Selection
```
├── AWS: Best for KMS (CloudHSM), Nitro Enclaves, global infra
│   ├── Node types: r6i.8xlarge (Ethereum), i4i.8xlarge (storage)
│   └── Storage: gp3 EBS (800 MB/s 256K IOPS) or i4i instance store
├── GCP: Best for [Kubernetes](../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) (GKE), network performance
│   └── Node types: n2-highmem-32, n2d-standard-64
├── [Bare-metal](../../AI_and_Agents/Models_and_FineTuning/bare-metal/SKILL.md): Best for validator nodes, MEV infrastructure
│   ├── Hetzner: AU$40/mo for AX102, great price-performance
│   └── OVH: Advance series, good for archive nodes
└── Dedicated blockchain infra providers
    ├── Alchemy: Managed RPC, node services
    ├── QuickNode: 16+ chains, custom plans
    └── Chainstack: [Multi-cloud](../../DevOps_and_Cloud/Cloud_Providers/multi-cloud/SKILL.md), enterprise
```

## CI/CD for Smart Contracts

### Foundry CI Pipeline
```yaml
name: smart-contract-ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: foundry-rs/foundry-toolchain@v1
      - name: Run lint
        run: forge fmt --check
      - name: Run Slither
        run: slither src/ --solc-remaps @openzeppelin=lib/openzeppelin-contracts
      - name: Run tests
        run: forge test -vvv
      - name: Run fuzz tests
        run: forge test --fuzz-seed 0 --fuzz-runs 10000
      - name: Gas snapshot
        run: forge snapshot
      - name: Deploy to testnet
        if: [github](../../DevOps_and_Cloud/CI_CD/github/SKILL.md).ref == 'refs/heads/main'
        run: forge script script/Deploy.s.sol --rpc-url $TESTNET_RPC --broadcast
```

### Deployment Pipeline Security
```yaml
# Deployment stages with gates
stages:
  - test: forge test, slither, aderyn
    gate: all tests passing, zero high-severity findings
  - deploy-testnet: forge script, verify on explorer
    gate: test stage passed, manual approval
  - verify-testnet: run integration tests against deployed contracts
    gate: all integration tests passing
  - deploy-mainnet: forge script with mainnet RPC + private key from KMS
    gate: verify-testnet passed, multi-sig signing completed
  - verify-mainnet: etherscan verification, [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) setup
    gate: contract verified, [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) alerts active
```

### Smart Contract CI Tooling
```yaml
# Analysis tools in CI pipeline
tools:
  linters:
    - forge fmt --check       # Solidity formatting
    - solhint src/            # Solidity lint
  static analysis:
    - slither src/             # Vulnerability detection
    - aderyn src/              # Solidity spec violations
    - semgrep --config custom-rules/  # Custom security rules
  testing:
    - forge test -vvv          # Unit + integration
    - forge test --fuzz-runs 25000  # Fuzzing
    - forge test --invariant-runs 100  # Invariant tests
  verification:
    - forge verify-contract    # Etherscan verification
    - forge coverage           # Coverage report
  gas:
    - forge snapshot           # Gas benchmarks
    - forge diff-check         # Gas diff from baseline
```

## [Monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) Stack

### Key Metrics
| Category | Metric | Alert Threshold |
|----------|--------|-----------------|
| Node sync | Block height lag | >10 blocks behind tip |
| Peer count | Connected peers | <5 peers |
| Mempool | Pending transactions | >10,000 pending |
| RPC | Request latency | >500ms p99 |
| RPC | Error rate | >1% of requests |
| Validator | Missed attestations | >5% over 100 epochs |
| Key management | Signing failures | Any failure |
| Disk | Storage utilization | >85% |
| Network | Inbound/outbound traffic | >1Gbps sustained |
| System | CPU utilization | >80% sustained |

### Prometheus Exporter Configuration
```yaml
# Ethereum node [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) with prometheus
scrape_configs:
  - job_name: 'geth'
    static_configs:
      - targets: ['localhost:6060']  # Geth metrics endpoint
    metrics_path: /debug/metrics/prometheus

  - job_name: 'validator'
    static_configs:
      - targets: ['localhost:5064']  # Lighthouse validator metrics

  - job_name: 'mev-boost'
    static_configs:
      - targets: ['localhost:9060']  # MEV-Boost metrics

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']  # System metrics
```

### Grafana [Dashboards](../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md)
```
Recommended [dashboards](../../DevOps_and_Cloud/Cloud_Providers/dashboards/SKILL.md):
├── Ethereum Client: eth-client-dashboard (9965), syncing, peers
├── Lighthouse: Lighthouse Dashboard (16549), validator performance
├── MEV-Boost: mev-boost dashboard (custom), relay performance
├── Node Exporter Full: Node Exporter Full (1860), system resources
└── Alertmanager: alert health, notification status
```

## Key Management

### Infrastructure Components
```
Key management tiers:
├── Hot keys (validators, operational)
│   ├── AWS KMS (FIPS 140-2 Level 3) for tx signing
│   ├── Fireblocks: MPC-based, multi-device signing
│   └── Web3 Signer (Consensys): remote signing for validators
├── Warm keys (protocol admin, multi-sig)
│   ├── Ledger Stax / Trezor Safe 5 for hardware signing
│   ├── HSMs (HSM Luna, NitroKey) for automated signing
│   └── MPC (CMP-based) for threshold signing
└── Cold keys (treasury, governance)
    ├── Air-gapped hardware (multiple signers)
    ├── Paper backups in bank vaults
    └── Social recovery with geographic distribution
```

### Validator Key Management
```bash
# Ethereum validator key management with Web3Signer
# 1. Generate validator keys with deposit-cli
# 2. Store encrypted keystores in secure storage (AWS KMS/HSM)
# 3. Configure Web3Signer for remote signing
# 4. Validator client connects via REST API

# [Docker](../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) compose for Web3Signer
services:
  web3signer:
    image: consensys/web3signer:latest
    command: eth2 --keystore-path=/keystore
    volumes:
      - ./keystore:/keystore:ro
      - ./config:/config:ro
    environment:
      - WEB3SIGNER_ETH2_SIGNING_KEYSTORE_PATH=/keystore
    ports:
      - "9000:9000"
```

## Environment Management

### Multi-Environment Configuration
```yaml
# blockchain-env-config.yaml
environments:
  local:
    chain_id: 31337
    rpc_url: http://localhost:8545
    block_explorer: none
    deployer_key: $LOCAL_PK
  testnet_sepolia:
    chain_id: 11155111
    rpc_url: https://rpc.sepolia.org
    block_explorer: https://sepolia.etherscan.io
    deployer_key: $TESTNET_PK
    verify: true
  mainnet:
    chain_id: 1
    rpc_url: https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_KEY
    block_explorer: https://etherscan.io
    deployer_key: $MAINNET_PK  # From KMS, never in file
    verify: true
    gas_multiplier: 1.2  # 20% buffer on gas estimate
```

## Security & Disaster Recovery

### [Incident](../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) Response [Runbook](../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md)
```markdown
## Node Outage Response
1. **Detect**: Alert from Prometheus (block height lag > 10)
2. **Assess**: SSH to node, check system logs (journalctl -u geth -n 100)
3. **Recover**: 
   - If disk full: prune logs, expand volume
   - If process dead: systemctl restart geth
   - If corrupt DB: restore from snapshot backup
4. **Verify**: Check sync status (eth_syncing), peer count, block height
5. **Post-mortem**: Document root cause, update [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md)

## Validator Key Compromise
1. **Detect**: Alert on unexpected validator activity
2. **Isolate**: Shut down validator node immediately
3. **Investigate**: [Audit](../../AI_and_Agents/Operations/audit/SKILL.md) access logs, key usage patterns
4. **Recover**: Generate new validator keys, exit old validator
5. **Report**: Notify the chain's security team, staking pool (if applicable)
6. **Post-mortem**: Key rotation procedure review, HSM upgrade
```

## Rules
1. Archive nodes for data availability, full nodes for RPC, validator nodes for consensus
2. Use [Ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md) for [bare-metal](../../AI_and_Agents/Models_and_FineTuning/bare-metal/SKILL.md), Terraform for cloud, Helm for K8s
3. Always run ≥2 geographically distributed RPC nodes behind load balancer for HA
4. CI/CD: Foundry forge tests + Slither static analysis + contract verification in one pipeline
5. Monitor: sync status (block height lag), peer count, mempool size, RPC latency, validator status
6. Environment configs must specify: chain ID, RPC endpoints, block explorer, faucet, registry addresses
7. Never [commit](../../DevOps_and_Cloud/CI_CD/commit/SKILL.md) private keys — use KMS, HSM, or hardware wallets for signing
8. For validators, never expose validator keys to the execution client — use separate signing infra
9. Test all infrastructure changes on testnet before mainnet
10. Document and automate disaster recovery procedures
11. RPC rate limiting should differentiate between authenticated and unauthenticated requests
12. Validator clients should be on separate machines from execution/consensus clients
13. Snapshot sync is preferred over full sync for initial setup (hours vs days)
14. MEV-Boost requires separate [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) and failover strategy
15. All blockchain nodes should use a NTP service for clock synchronization

## Implementation Examples

### [Ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md) Playbook — Full Node Deployment
```yaml
---
- name: Deploy Ethereum full node
  hosts: eth-nodes
  vars:
    chain: mainnet
    node_type: full
    execution_client: geth
    consensus_client: lighthouse
    data_dir: /data/blockchain
    p2p_port: 30303
    rpc_port: 8545

  tasks:
    - name: Create data directory
      [ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md).builtin.file:
        path: "{{ data_dir }}"
        state: directory
        owner: blockchain
        group: blockchain
        mode: '0750'

    - name: Deploy execution client (geth)
      [ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md).builtin.copy:
        src: binaries/geth-linux-amd64
        dest: /usr/local/bin/geth
        mode: '0755'

    - name: Create systemd service for geth
      [ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md).builtin.template:
        src: templates/geth.service.j2
        dest: /etc/systemd/system/geth.service
      vars:
        geth_flags: >-
          --{{ chain }}
          --datadir {{ data_dir }}/geth
          --http --http.addr 0.0.0.0 --http.port {{ rpc_port }}
          --http.api eth,net,web3,txpool,debug
          --port {{ p2p_port }}
          --maxpeers 100
          --syncmode snap
          --cache 8192

    - name: Start geth service
      [ansible](../../DevOps_and_Cloud/Infrastructure_as_Code/ansible/SKILL.md).builtin.systemd:
        name: geth
        state: started
        enabled: true
        daemon_reload: true
```

### [Docker](../../DevOps_and_Cloud/Containers_and_Orchestration/docker/SKILL.md) Compose — Node Stack
```yaml
version: '3.8'
services:
  execution:
    image: ethereum/client-go:latest
    volumes:
      - ./data/geth:/root/.ethereum
    ports:
      - "30303:30303/tcp"
      - "30303:30303/udp"
      - "8545:8545"
    command: >
      --mainnet
      --http --http.addr 0.0.0.0 --http.vhosts '*'
      --http.api eth,net,web3
      --syncmode snap
      --cache 4096
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 16G

  consensus:
    image: sigp/lighthouse:latest
    volumes:
      - ./data/lighthouse:/root/.lighthouse
    ports:
      - "9000:9000/tcp"
      - "9000:9000/udp"
      - "5052:5052"
    command: >
      lighthouse beacon
      --network mainnet
      --execution-endpoint http://execution:8551
      --execution-jwt /root/.lighthouse/jwt.hex
      --checkpoint-sync-url https://sync-mainnet.beaconcha.in
    depends_on:
      - execution
    restart: unless-stopped

  [monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md):
    image: prometheus/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  metrics-exporter:
    image: ethforker/geth-exporter:latest
    environment:
      - GETH_URI=http://execution:8545
    depends_on:
      - execution
```

### Health Check Script (Bash)
```bash
#!/bin/bash
# Node health check — run every 60s via cron

NODE="http://localhost:8545"
THRESHOLD_BLOCKS=10

# Check sync status
SYNCING=$(curl -s -X POST "$NODE" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  | jq -r '.result')

if [ "$SYNCING" != "false" ]; then
  echo "WARN: Node still syncing"
fi

# Check block height lag
LOCAL=$(curl -s -X POST "$NODE" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | jq -r '.result')
LOCAL_DEC=$((LOCAL))
PEER_BLOCK=$(curl -s "https://beaconcha.in/api/v1/epoch/latest" | jq '.data.blockscount')
LAG=$((PEER_BLOCK - LOCAL_DEC))

if [ $LAG -gt $THRESHOLD_BLOCKS ]; then
  echo "CRIT: Block height lag = $LAG (threshold: $THRESHOLD_BLOCKS)"
  exit 2
fi

# Check peer count
PEERS=$(curl -s -X POST "$NODE" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  | jq -r '.result')
PEERS_DEC=$((PEERS))

if [ $PEERS_DEC -lt 5 ]; then
  echo "CRIT: Low peer count: $PEERS_DEC"
  exit 2
fi

echo "OK: Height=$LOCAL_DEC Peers=$PEERS_DEC"
exit 0
```

### Prometheus + Grafana [Alerting](../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md) Rules
```yaml
# prometheus/alerts.yml
groups:
  - name: blockchain-nodes
    rules:
      - alert: NodeNotSyncing
        expr: eth_sync_status == 1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "{{ $labels.instance }} is not syncing"

      - alert: NodeBlockHeightLag
        expr: eth_block_height_lag > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.instance }} block height lag is {{ $value }}"

      - alert: LowPeerCount
        expr: eth_peers_count < 5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.instance }} has only {{ $value }} peers"

      - alert: RpcLatencyHigh
        expr: eth_rpc_latency_ms > 2000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "{{ $labels.instance }} RPC latency is {{ $value }}ms"

      - alert: ValidatorMissedAttestation
        expr: validator_attestation_success_rate < 0.95
        for: 30m
        labels:
          severity: critical
        annotations:
          summary: "Validator {{ $labels.validator }} missed too many attestations"
```

## References
  - ../../../Global_References/blockchain-infrastructure-advanced.md — Blockchain Infrastructure Advanced Topics
  - ../../../Global_References/blockchain-infrastructure-fundamentals.md — Blockchain Infrastructure Fundamentals
  - ../../../Global_References/ci-cd-smart-contracts.md — CI/CD for Smart Contracts
  - ../../../Global_References/[disaster-recovery](../../DevOps_and_Cloud/Observability_and_SecOps/disaster-recovery/SKILL.md)-backup.md — Disaster Recovery & Backup
  - ../../../Global_References/environment-mgmt.md — Environment Management
  - ../../../Global_References/kms-hsm.md — KMS & HSM for Blockchain
  - ../../../Global_References/mev-infrastructure.md — MEV Infrastructure
  - ../../../Global_References/blockchain-infrastructure_monitoring-[alerting](../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md).md — [Monitoring](../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md) and [Alerting](../../DevOps_and_Cloud/Observability_and_SecOps/alerting/SKILL.md)
  - ../../../Global_References/node-deployment.md — Node Deployment
  - ../../../Global_References/performance-benchmarking.md — Performance Benchmarking
  - ../../../Global_References/rpc-infrastructure.md — RPC Infrastructure
  - references/validator-operations.md — Validator Operations Guide
  - references/blockchain-devops-tooling.md — Blockchain DevOps Tooling

## Phase
blockchain → blockchain-infrastructure

