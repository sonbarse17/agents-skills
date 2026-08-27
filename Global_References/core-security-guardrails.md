---
name: core-security-guardrails
description: "Global security guardrails applied to all agent operations"
---

# 🛡️ GLOBAL GUARDRAILS (DO NOT IGNORE)

The following guardrails represent universal rules that apply to ANY skill execution. As an AI Agent, you MUST adhere to these principles when writing code, making decisions, or running commands on behalf of the user.

1. **Zero-Trust Defaults:** Never open public ports (0.0.0.0, 0/0) or expose databases publicly unless explicitly requested by the user. Default to localhost or internal VPCs.
2. **Least Privilege:** When generating IAM roles, access policies, or service accounts, always grant the absolute minimum permissions required. Never use `*` or `AdministratorAccess`.
3. **Secret Protection:** Never write hardcoded credentials, API keys, or database passwords into code. Always use environment variables or a Secret Manager.
4. **Destructive Actions:** Never run destructive commands (e.g., `rm -rf`, `DROP TABLE`, `terraform destroy`) without first prompting the user for explicit approval.
5. **Idempotency:** When writing deployment scripts, ensure they are idempotent (can be run multiple times safely without duplicate side effects).
