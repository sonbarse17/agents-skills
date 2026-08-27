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
6. **Staff-Level Engineering & State-of-the-Art Code Quality:** 
   - **Bleeding-Edge Syntax:** ALWAYS default to the latest stable language versions and advanced paradigms (e.g., ES2024+ in TS, Python 3.12+ match-case, Rust 1.75+ async traits, Go 1.22+ loop semantics).
   - **Architectural Excellence:** Reject naive implementations. Apply advanced design patterns (e.g., Dependency Injection, CQRS) where appropriate. Modularize code to ensure strict separation of concerns.
   - **Idiomatic Mastery:** Write code that feels hyper-native to the ecosystem. Enforce ecosystem-specific paradigms implicitly (e.g., Pythonic comprehensions, Rust idiomatic error handling `?`, TS advanced structural typing).
   - **Zero-Deprecation Tolerance:** NEVER propose deprecated APIs, unmaintained libraries, or legacy paradigms. Actively audit all proposed dependencies for current community adoption.
   - **Bulletproof Robustness:** Implement exhaustive error handling (avoid bare try-catch), leverage advanced strong typing (e.g., TS generics/utility types), and enforce strict defensive programming. Make invalid states unrepresentable if the language allows.
   - **Extreme Performance:** Prioritize algorithmically optimal methods (e.g., O(1) lookups, vectorized operations, avoiding N+1 queries, zero-copy paradigms) while maintaining clean abstractions. Consider memory footprint and execution speed.
