# 🧠 Unified Agent Skills Repository

Welcome to the **Unified Agent Skills Repository**. This workspace contains **1,700+ curated skills** for autonomous AI agents, meticulously organized by technology and domain.

This repository serves as a centralized "brain" or runbook collection, enabling AI agents to understand how to interact with various APIs, design patterns, cloud providers, and development frameworks.

---

## 📂 Repository Structure

The skills are organized into a domain-based taxonomy of **12 top-level categories**, each broken into tool- or topic-specific subfolders. Every subfolder ends in a `common/` (or `other/`) bucket for content that doesn't belong to any single tool.

### ☁️ `cloud/` (337 skills)
Cloud-provider skills, organized by provider then service category (compute, storage, networking, security, database, ai, devops...).
* **azure/**, **aws/**, **gcp/** — the three major providers, each split by service category.
* **oracle/**, **alibaba/**, **digitalocean/**, **ibm/**, **cloudflare/** — smaller providers, flat.
* **common/** — multi-cloud and provider-agnostic content (FinOps, migration, architecture).

### 🔁 `ci-cd/` (64 skills)
CI/CD platforms: **github-actions/**, **gitlab-ci/**, **jenkins/**, **circleci/**, **bamboo/**, **gitea/**, plus **common/** for cross-platform pipeline design, deployment strategy, and git workflow.

### 🐳 `containers-orchestration/` (170 skills)
Docker, Kubernetes and the managed/GitOps ecosystem around them: **docker/**, **docker-compose/**, **kubernetes/**, **helm/**, **kustomize/**, **eks/**, **aks/**, **gke/**, **ecs/**, **openshift/**, **podman/**, **nomad/**, **argocd/**, **fluxcd/**, **azure-container-apps/**, plus **common/** (service mesh, chaos engineering, platform engineering).

### 🏗️ `infrastructure-as-code/` (58 skills)
**terraform/**, **opentofu/**, **pulumi/**, **cloudformation/**, **bicep/**, **crossplane/**, **ansible/**, **packer/**, plus **common/** (policy-as-code, drift detection, IaC security).

### 📈 `observability-monitoring-logging/` (133 skills)
**prometheus/**, **grafana/**, **opentelemetry/**, **elasticsearch/**, **fluent-bit/**, **loki/**, **jaeger/**, **datadog/**, **new-relic/**, **sentry/**, **azure-monitor/**, **cloudwatch/**, **gcp-operations/**, plus **common/** (SLI/SLO, incident response, root-cause analysis, dashboard design).

### 🤖 `AI_and_Agents/` (166 skills)
Building, running, and evaluating AI/LLM systems.
* **Architecture/** — agent architecture patterns, RAG design, enterprise architecture frameworks.
* **Infrastructure/** — MCP servers, RAG infrastructure, vector search.
* **Models_and_FineTuning/** — fine-tuning, LLMOps, inference/serving, evaluation, ML domains.
* **Operations/** — agent observability, cost optimization, AI-specific ops.
* **Workflows/** — prompt engineering, multi-agent coordination, agent development/diagnostics, pipelines.

### 📦 `Software_Engineering_and_Other/` (492 skills)
General software development skills, frameworks, and patterns.
* **Backend/** — frameworks (Django, FastAPI, Laravel, Rails, Spring Boot...), API design, data access, auth, payments.
* **Frontend/** — frameworks (React, Vue, Angular, Next.js...), UI/UX, state management, build tooling.
* **Languages/** — Python, JS/TS, Go, Rust, JVM, systems languages, shell.
* **Databases/** — relational, NoSQL, graph, analytical, caching, messaging.
* **Testing/** — unit, integration, e2e, contract, acceptance, regression.
* **Patterns/** — architecture, distributed systems, API/RPC, workflow, debugging, dev practice.
* **Miscellaneous/** — the long tail: quantum computing, systems/embedded, M365/Teams, document generation, wiki tooling, dev tooling.

### 🔒 `Security/` (153 skills)
**pentest-redteam/**, **scanning/** (SAST/DAST/SCA/SBOM), **supply-chain/**, **compliance/**, **identity-access/**, **cryptography-secrets/**, **incident-response/**, **threat-modeling/**, **policy-as-code/**, **app-security/**, **ai-security/**, plus **common/**.

### 📱 `Mobile/` (17 skills)
**platforms/** (Android, iOS, Flutter, React Native), **features/** (deep linking, IAP, push, AR/VR, MDM), **common/**.

### 💼 `Product_and_Business/` (91 skills)
**product-management/**, **planning-and-tracking/**, **research-and-strategy/**, **content-and-docs/**, **design-and-ux/**, **ops-and-hiring/**, **seo-and-marketing/**.

### 📊 `Data_Engineering/` (61 skills)
ETL pipelines, data platforms, warehousing, data quality, streaming, and analytics engineering.

### ⛓️ `Blockchain_and_Web3/` (26 skills)
Blockchain, DeFi, Web3, Ethereum, Solana, and ZK-proof skills.

### 📚 `Global_References/`
Flat reference assets (docs, examples, configs) that skills link to for supporting material — grouped into subfolders matching the category of the skills that actually use them.

---

## 🛠️ Anatomy of a Skill

Each folder within these categories represents a distinct "Skill" and contains:

- `SKILL.md` (or, for a minority of skills, `README.md`): the core prompt/instructions detailing when and how an AI agent should use this skill, plus any supporting scripts, templates, or assets that skill needs directly.
- Cross-skill reference material lives centrally in `Global_References/` rather than per-skill, and skills link into it by relative path.

## 🚀 Usage

This repository includes a built-in **Skill Router MCP Server** that allows AI agents (like Antigravity, Claude Desktop, Cursor) to dynamically search and read skills on-demand, without overloading their context windows.

*Note: The MCP server dynamically indexes all `SKILL.md` files recursively on startup, so you never need to manually build or update any JSON manifests!*

### Setting up the MCP Server

1. Navigate to the `mcp-server` directory:
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

2. Register the MCP server with your AI client (e.g., in `~/.gemini/config/mcp_config.json`):
   ```json
   "skill-router": {
     "command": "node",
     "args": [
       "C:\\absolute\\path\\to\\unified_skills\\mcp-server\\build\\index.js"
     ]
   }
   ```

3. Restart your AI client. The agent will now have access to `search_skills`, `get_skill_content`, and `list_categories` tools!

### Manual Usage

You can also explicitly map categories for Antigravity using a `skills.json` file placed in `~/.gemini/config/skills.json` or `.agents/skills.json` within your project workspace:

```json
{
  "entries": [
    { "path": "C:/path/to/unified_skills/cloud/azure" },
    { "path": "C:/path/to/unified_skills/Software_Engineering_and_Other/Backend" }
  ]
}
```

## 🧰 `scripts/`

Repository maintenance tooling:
- `lint-skills.js`, `crosslink-skills.js`, `consolidate_references.ps1`, `standardize_skills.ps1` — ongoing repo-wide maintenance scripts.
- `migrations/` — one-off scripts used to reorganize each category into its current tool/topic-based structure. Kept as a record of how the current layout came to be, not meant to be re-run.
