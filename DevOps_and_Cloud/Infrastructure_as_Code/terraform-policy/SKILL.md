---
name: terraform-policy
description: "Write, test, or convert Terraform Policy files (.policy.hcl, .policytest.hcl, Sentinel→tfpolicy). Triggers: policy.hcl, policytest, convert sentinel, tfpolicy, write a policy."
license: MPL-2.0
metadata:
  lifecycle-status: active
  copyright: Copyright IBM Corp. 2026
  version: "0.1.0"
---

# [terraform-policy](../../../Software_Engineering_and_Other/Miscellaneous/agent-skills-main/plugins/terraform/skills/terraform-policy/SKILL.md)

**UTILITY SKILL** — INVOKES: [tfpolicy-author](../../../Global_References/tfpolicy-author.md) | [tfpolicy-test](../../../Global_References/tfpolicy-test.md)

## USE FOR:

- Writing a new `.policy.hcl` policy from a description or requirement
- Converting a `.sentinel` policy to Terraform Policy
- Writing or debugging a `.policytest.hcl` test file
- Migrating a Sentinel policy library to Terraform Policy

## DO NOT USE FOR:

- Writing `.tftest.hcl` files for Terraform modules — use `[terraform-test](../[terraform-test](../../../Software_Engineering_and_Other/Miscellaneous/agent-skills-main/plugins/terraform/skills/terraform-test/SKILL.md)/SKILL.md)`
- General Terraform HCL authoring — use `[terraform-style-guide](../[terraform-style-guide](../../../Software_Engineering_and_Other/Miscellaneous/agent-skills-main/plugins/terraform/skills/terraform-style-guide/SKILL.md)/SKILL.md)`

## Routing

| Task | Sub-skill |
|------|-----------|
| Write or convert a `.policy.hcl` policy | [tfpolicy-author](../../../Global_References/tfpolicy-author.md) |
| Write or debug a `.policytest.hcl` test | [tfpolicy-test](../../../Global_References/tfpolicy-test.md) |

## Examples

- "Block EC2 instances without encryption" → [tfpolicy-author](../../../Global_References/tfpolicy-author.md)
- "Convert this Sentinel policy to tfpolicy" → [tfpolicy-author](../../../Global_References/tfpolicy-author.md)
- "Write a policytest for my EBS policy" → [tfpolicy-test](../../../Global_References/tfpolicy-test.md)

## Troubleshooting

- **Wrong skill triggered?** Load the sub-skill directly from the routing table above.

```bash
npx skills add hashicorp/agent-skills/terraform/[terraform-policy](../../../Software_Engineering_and_Other/Miscellaneous/agent-skills-main/plugins/terraform/skills/terraform-policy/SKILL.md)/skills/tfpolicy-author
npx skills add hashicorp/agent-skills/terraform/[terraform-policy](../../../Software_Engineering_and_Other/Miscellaneous/agent-skills-main/plugins/terraform/skills/terraform-policy/SKILL.md)/skills/tfpolicy-test
```

