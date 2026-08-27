---
name: azure-compliance
description: "Run Azure compliance and security audits with azqr plus Key Vault expiration checks. Covers best-practice assessment, resource review, policy/compliance validation, and security posture checks. WHEN: compliance scan, security audit, BEFORE running azqr (compliance cli tool), Azure best practices, Key Vault expiration check, expired certificates, expiring secrets, orphaned resources, compliance assessment."
license: MIT
metadata:
  author: Microsoft
  version: "1.2.1"
---

# Azure Compliance & Security Auditing

## Quick Reference

| Property | Details |
|---|---|
| Best for | Compliance scans, security audits, Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) expiration checks |
| Primary capabilities | Comprehensive Resources Assessment, Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) Expiration [Monitoring](../../../../Observability_and_SecOps/monitoring/SKILL.md) |
| MCP tools | azqr, subscription and resource group listing, Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) item inspection |

## When to Use This Skill

- Run azqr or Azure Quick Review for compliance assessment
- Validate Azure resource configuration against best practices
- Identify orphaned or misconfigured resources
- [Audit](../../../../../AI_and_Agents/Operations/audit/SKILL.md) Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) keys, secrets, and certificates for expiration

## Skill Activation Triggers

Activate this skill when user wants to:
- Check Azure compliance or best practices
- Assess Azure resources for configuration issues
- Run azqr or Azure Quick Review
- Identify orphaned or misconfigured resources
- Review Azure security posture
- "Show me expired certificates/keys/secrets in my Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md)"
- "Check what's expiring in the next 30 days"
- "[Audit](../../../../../AI_and_Agents/Operations/audit/SKILL.md) my Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) for compliance"
- "Find secrets without expiration dates"
- "Check certificate expiration dates"

## Prerequisites

- Authentication: user is logged in to Azure via `az login`
- Permissions to read resource configuration and Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) metadata

## Assessments

| Assessment | Reference |
|------------|-----------|
| Comprehensive Compliance (azqr) | [../../../../../Global_References/azure-quick-review.md](../../../../../Global_References/azure-quick-review.md) |
| Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) Expiration | [../../../../../Global_References/[azure-keyvault](../../../azure-keyvault/SKILL.md)-expiration-[audit](../../../../../AI_and_Agents/Operations/audit/SKILL.md).md](../../../../../Global_References/[azure-keyvault](../../../azure-keyvault/SKILL.md)-expiration-[audit](../../../../../AI_and_Agents/Operations/audit/SKILL.md).md) |
| Resource Graph Queries | [../../../../../Global_References/azure-compliance_azure-resource-graph.md](../../../../../Global_References/azure-compliance_azure-resource-graph.md) |

## MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp_azure_mcp_extension_azqr` | Run azqr compliance scans |
| `mcp_azure_mcp_subscription_list` | List available subscriptions |
| `mcp_azure_mcp_group_list` | List resource groups |
| `keyvault_key_list` | List all keys in [vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) |
| `keyvault_key_get` | Get key details including expiration |
| `keyvault_secret_list` | List all secrets in [vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) |
| `keyvault_secret_get` | Get secret details including expiration |
| `keyvault_certificate_list` | List all certificates in [vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) |
| `keyvault_certificate_get` | Get certificate details including expiration |

## Assessment Workflow

1. Select scope (subscription or resource group) for Comprehensive Resources Assessment.
2. Run azqr and capture output artifacts.
3. Analyze Scan Results and summarize findings and recommendations.
4. Review Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) Expiration [Monitoring](../../../../Observability_and_SecOps/monitoring/SKILL.md) output for keys, secrets, and certificates.
5. Classify issues and propose remediation or fix steps for each finding.

### Priority Classification

| Priority | Guidance |
|---|---|
| Critical | Immediate remediation required for high-impact exposure |
| High | Resolve within days to reduce risk |
| Medium | Plan a resolution in the next sprint |
| Low | Track and fix during regular maintenance |

## Error Handling

| Error | Message | Remediation |
|---|---|---|
| Authentication required | "Please login" | Run `az login` and retry |
| Access denied | "Forbidden" | Confirm permissions and fix role assignments |
| Missing resource | "Not found" | Verify subscription and resource group selection |

## Best Practices

- Run compliance scans on a regular schedule (weekly or monthly)
- Track findings over time and verify remediation effectiveness
- Separate compliance reporting from remediation execution
- Keep Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) expiration policies documented and enforced

## SDK Quick References

For programmatic Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) access, see the condensed SDK guides:

- **Key [Vault](../../../../../Software_Engineering_and_Other/Miscellaneous/vault/SKILL.md) ([Python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md))**: [Secrets/Keys/Certs](references/sdk/[azure-keyvault-py](../../../[azure-keyvault-py](../../../azure-sdk-[python](../../../../../Software_Engineering_and_Other/Languages/python/SKILL.md)/skills/[azure-keyvault](../../../azure-keyvault/SKILL.md)-py/SKILL.md)/SKILL.md).md)
- **Secrets**: [TypeScript](references/sdk/[azure-keyvault-secrets-ts](../../../[azure-keyvault-secrets-ts](../../../azure-sdk-[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)/skills/[azure-keyvault](../../../azure-keyvault/SKILL.md)-secrets-ts/SKILL.md)/SKILL.md).md) | [Rust](references/sdk/[azure-keyvault-secrets-rust](../../../[azure-keyvault-secrets-rust](../../../azure-sdk-rust/skills/[azure-keyvault](../../../azure-keyvault/SKILL.md)-secrets-rust/SKILL.md)/SKILL.md).md) | [Java](references/sdk/[azure-security-keyvault-secrets-java](../../../azure-sdk-java/skills/[azure-security-keyvault-secrets-java](../../../azure-security-keyvault-secrets-java/SKILL.md)/SKILL.md).md)
- **Keys**: [.NET](references/sdk/[azure-security-keyvault-keys-dotnet](../../../azure-sdk-dotnet/skills/[azure-security-keyvault-keys-dotnet](../../../azure-security-keyvault-keys-dotnet/SKILL.md)/SKILL.md).md) | [Java](references/sdk/[azure-security-keyvault-keys-java](../../../azure-sdk-java/skills/[azure-security-keyvault-keys-java](../../../azure-security-keyvault-keys-java/SKILL.md)/SKILL.md).md) | [TypeScript](references/sdk/[azure-keyvault-keys-ts](../../../[azure-keyvault-keys-ts](../../../azure-sdk-[typescript](../../../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)/skills/[azure-keyvault](../../../azure-keyvault/SKILL.md)-keys-ts/SKILL.md)/SKILL.md).md) | [Rust](references/sdk/[azure-keyvault-keys-rust](../../../[azure-keyvault-keys-rust](../../../azure-sdk-rust/skills/[azure-keyvault](../../../azure-keyvault/SKILL.md)-keys-rust/SKILL.md)/SKILL.md).md)
- **Certificates**: [Rust](references/sdk/[azure-keyvault-certificates-rust](../../../[azure-keyvault-certificates-rust](../../../azure-sdk-rust/skills/[azure-keyvault](../../../azure-keyvault/SKILL.md)-certificates-rust/SKILL.md)/SKILL.md).md)


