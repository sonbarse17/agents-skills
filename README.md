# 🧠 Unified Agent Skills Repository

Welcome to the **Unified Agent Skills Repository**. This workspace contains **1,640+ curated skills** for autonomous AI agents, meticulously organized by technology and domain.

This repository serves as a centralized "brain" or runbook collection, enabling AI agents to understand how to interact with various APIs, design patterns, cloud providers, and development frameworks.

---

## 📂 Repository Structure

The skills are organized into a clean, domain-based taxonomy with **9 top-level categories** and multiple subcategories.

### 1. 🤖 `AI_and_Agents/` (180 skills)
Skills for building, running, and evaluating AI/LLM systems.
* **Architecture/** (19) — RAG pipelines, cognitive loops, agent architecture design.
* **Workflows/** (55) — Agentic workflows, prompt engineering, multi-agent orchestration, tool-calling.
* **Infrastructure/** (22) — Vector databases, MCP servers, RAG infrastructure, search/retrieval.
* **Models_and_FineTuning/** (71) — LLM fine-tuning, quantization, model serving, MLOps, inference.
* **Operations/** (12) — AI safety, evals, observability, cost optimization.

### 2. ☁️ `DevOps_and_Cloud/` (674 skills)
Cloud infrastructure, deployments, monitoring, and security operations.
* **CI_CD/** (62) — GitHub Actions, GitLab CI, Jenkins, deployment pipelines, feature flags.
* **Cloud_Providers/** (316) — AWS, Azure, GCP, multi-cloud, Azure SDKs, cloud storage, FinOps.
* **Containers_and_Orchestration/** (128) — Kubernetes, Docker, Helm, ArgoCD, service mesh.
* **Infrastructure_as_Code/** (42) — Terraform, Pulumi, Ansible, CloudFormation.
* **Observability_and_SecOps/** (159) — Datadog, Grafana, Prometheus, OpenTelemetry, SRE, incident response.

### 3. 📦 `Software_Engineering_and_Other/` (506 skills)
General software development skills, frameworks, and patterns.
* **Backend/** (94) — Node.js, Python (Django, FastAPI), PHP (Laravel), Java, .NET, APIs.
* **Frontend/** (130) — React, Next.js, Vue, Angular, CSS, UI frameworks, accessibility.
* **Languages/** (40) — Go, Rust, Python, TypeScript, C/C++, Kotlin, Swift, Elixir.
* **Databases/** (42) — SQL, NoSQL (MongoDB, Redis), Graph (Neo4j), time-series, caching.
* **Testing/** (19) — Unit, E2E, integration, load, contract, property-based testing.
* **Patterns/** (59) — Microservices, CQRS, event-driven, clean architecture, design patterns.
* **Miscellaneous/** (157) — Remaining specialized skills (quantum, embedded, etc.).

### 4. ⛓️ `Blockchain_and_Web3/` (24 skills)
All blockchain, DeFi, Web3, Ethereum, Solana, and ZK-proof skills.

### 5. 📊 `Data_Engineering/` (52 skills)
ETL pipelines, data platforms, warehousing, data quality, streaming, and analytics engineering.

### 6. 🔒 `Security/` (87 skills)
Pentesting, compliance (SOC2, PCI, HIPAA, GDPR), threat modeling, SAST/DAST, vulnerability management.

### 7. 📱 `Mobile/` (14 skills)
iOS, Android, React Native, Flutter, mobile-specific patterns (deep linking, push notifications).

### 8. 🎮 `Game_Development/` (14 skills)
Unity, Unreal Engine, Godot, Roblox, Cocos2d, game-specific patterns (ECS, physics, netcode).

### 9. 💼 `Product_and_Business/` (89 skills)
Product management, roadmapping, market analysis, OKR/KPI, hiring, stakeholder management.

### 📚 `Global_References/`
Supporting markdown reference files used across multiple skills.

---

## 🛠️ Anatomy of a Skill

Each folder within these categories represents a distinct "Skill" and typically contains:

- `SKILL.md` (or `README.md`): The core prompt/instructions detailing when and how an AI agent should use this skill.
- `evals/`: Benchmarking data (`evals.json`) to validate the agent's competency in executing the skill.
- `references/`: Supporting documentation, API specifications, and metrics thresholds.

## 🚀 Usage

This repository includes a built-in **Skill Router MCP Server** that allows AI agents (like Antigravity, Claude Desktop, Cursor) to dynamically search and read the 1,640+ skills on-demand, without overloading their context windows. 

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
    { "path": "C:/path/to/unified_skills/DevOps_and_Cloud/Cloud_Providers" },
    { "path": "C:/path/to/unified_skills/Software_Engineering_and_Other/Backend" }
  ]
}
```
