# 🧠 Unified Agent Skills Repository

Welcome to the **Unified Agent Skills Repository**. This workspace contains **1,698 curated skills** for autonomous AI agents, meticulously organized by technology and domain. 

This repository serves as a centralized "brain" or runbook collection, enabling AI agents to understand how to interact with various APIs, design patterns, cloud providers, and development frameworks.

---

## 📂 Repository Structure

The skills are organized into a clean, technology-based taxonomy to make them easily discoverable by both human engineers and AI routing layers.

### 1. `🤖 AI_and_Agents`
Contains cognitive architectures, memory design patterns, and tools for building AI systems.
* **Architecture:** RAG pipelines, core cognitive loops, semantic memory structures.
* **Workflows:** Multi-agent topologies, agentic workflows, prompt engineering.
* **Infrastructure:** Vector databases (Pinecone, Qdrant) and Model Context Protocol (MCP) integrations.
* **Models & Fine-Tuning:** LLM quantization, LoRA fine-tuning, and GenAI vision models.
* **Operations:** AI safety, evals, and observability.

### 2. `☁️ DevOps_and_Cloud`
Contains runbooks for cloud infrastructure, deployments, and security.
* **Cloud Providers:** AWS, GCP, and Azure specific operations.
* **Containers & Orchestration:** Kubernetes (EKS, AKS), Docker, Helm, ArgoCD.
* **Infrastructure as Code (IaC):** Terraform, Pulumi, Ansible automation.
* **CI/CD:** GitHub Actions, GitLab CI, Jenkins pipeline configurations.
* **Observability & SecOps:** Datadog, Sentry, Wiz security contexts, alert monitoring.

### 3. `📦 Software_Engineering_and_Other`
Contains general software development skills, templates, and patterns.
* **Backend:** Node.js (Express, Fastify), Python (Django), PHP (Laravel), Java/C# (Quarkus, .NET).
* **Frontend:** React, Next.js, CSS patterns, and UI frameworks.
* **Miscellaneous:** Standard site structures, game development (Roblox), etc.

---

## 🛠️ Anatomy of a Skill

Each folder within these categories represents a distinct "Skill" and typically contains:

- `SKILL.md` (or `README.md`): The core prompt/instructions detailing when and how an AI agent should use this skill.
- `evals/`: Benchmarking data (`evals.json`) to validate the agent's competency in executing the skill.
- `references/`: Supporting documentation, API specifications, and metrics thresholds.

## 🚀 Usage

To utilize these skills, point your AI agent's skills configuration or context loader to the appropriate sub-directory in this repository. Agents can dynamically read the `SKILL.md` files when their planning module determines a specific technology or runbook is required to solve a user's task.
