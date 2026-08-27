---
name: chatops-runbook-automation
description: >
  Guides building ChatOps incident-channel bots (Slack/Microsoft Teams) and
  automated runbook execution (StackStorm/Rundeck-style) — slash commands that
  run a diagnostic or remediation action from inside the incident channel,
  permission-scoped and confirmation-gated destructive actions, audit logging of
  every executed action, and balancing automation speed against the risk of an
  accidental or unauthorized destructive action. Use when the user asks to
  "build a Slack bot for incident response," "automate a runbook so on-call can
  run it from chat," "wire a restart/rollback command into our incident
  channel," "add a confirmation step before a destructive ChatOps action," or
  "audit what runbook actions were executed during an incident."
license: Apache-2.0
compatibility: Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI
metadata:
  domain: incident-tooling-and-itsm
  maturity: stable
tags:
  - frontend
  - chatops-runbook-automation
depends_on: []
---

# ChatOps [Runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) Automation

## Purpose

During an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md), the fastest path from "we know the fix" to "the fix
is applied" is often a chat command — `/restart checkout-api-prod` typed
directly into the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel — rather than someone context-
switching to a separate tool, re-authenticating, and running the same
command from a terminal. ChatOps platforms (a Slack/Teams bot backed by
StackStorm, Rundeck, or a custom webhook handler) exist to close that
gap: a [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) becomes a slash command any authorized on-call engineer
can trigger from inside the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel, with the action and its
output visible to everyone in the channel in real time. But the same
property that makes ChatOps valuable during an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) — a chat message
away from executing a real action against production — is exactly what
makes an under-guarded destructive command dangerous: a mistyped
service name, a command run by someone without full context, or a bot
with no confirmation step for a hard-to-reverse action (a database
failover, a mass pod restart, a rollback) can turn a ChatOps
convenience into the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)'s actual root cause. This skill covers
building the bot/automation layer (Slack/Teams integration,
StackStorm/Rundeck-style [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) execution), permission-scoping who can
run what, requiring an explicit confirmation step for destructive
actions, and logging every execution for [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) — treating automation
speed and safety as a design tradeoff to make deliberately, not an
afterthought.

## When to use

- Building a new Slack or Microsoft Teams bot/integration that lets
  on-call trigger diagnostic or remediation [runbooks](../../../DevOps_and_Cloud/Observability_and_SecOps/runbooks/SKILL.md) from an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)
  channel.
- Wiring StackStorm, Rundeck, or a custom webhook-driven automation
  layer to execute a specific [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) action (restart a service, scale
  a deployment, trigger a rollback, run a diagnostic query) in response
  to a chat command.
- Adding a confirmation step to an existing ChatOps command that
  currently executes a destructive or hard-to-reverse action
  immediately with no safeguard.
- Deciding which [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) actions are safe to fully automate
  (auto-triggered on a detected condition, no human in the loop) versus
  which should always require an explicit human-initiated chat command,
  versus which should never be chat-triggerable at all.
- Reviewing an existing ChatOps bot's permission model to check whether
  destructive commands are scoped to the right roles/channels.
- Auditing what [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) actions were actually executed during a past
  [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md), to confirm the record is complete and attributable to a
  specific person.
- Investigating an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) where a ChatOps command produced an
  unintended or larger-than-expected blast radius.

## Prerequisites & environment

- A chat platform (Slack, Microsoft Teams) with the ability to register
  slash commands or interactive bot commands, and admin rights to scope
  which channels/roles can install and use the integration.
- An automation execution backend: **StackStorm** (rule-based, open-
  source automation with a rich action/workflow model, self-hosted) or
  **Rundeck** (job-scheduling/[runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md)-execution focused, strong ACL and
  [audit](../../../AI_and_Agents/Operations/audit/SKILL.md)-log support, both OSS and commercial editions) — or, for a
  narrower/lighter need, a custom webhook handler invoking a script
  directly. Choose based on how much workflow complexity (multi-step
  [runbooks](../../../DevOps_and_Cloud/Observability_and_SecOps/runbooks/SKILL.md), approval gates, conditional branching) the automation needs
  versus a single-action command.
- Existing [runbooks](../../../DevOps_and_Cloud/Observability_and_SecOps/runbooks/SKILL.md) already documented as a clear, reproducible
  procedure — automating an undocumented or ambiguous manual process
  just automates the ambiguity faster; the underlying [incident-response](../../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md)
  structure this bot supports is covered in
  [incident-response-and-on-call-management](../../../site-reliability-engineering/skills/[incident-response-and-on-call-management](../[incident-response](../../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md)-and-[on-call-management](../../../DevOps_and_Cloud/Observability_and_SecOps/on-call-management/SKILL.md)/SKILL.md)/SKILL.md).
- Identity/permission mapping between chat platform users and the
  execution backend's RBAC — the bot must know not just *who* sent a
  command but whether *that specific person* is authorized for *that
  specific action*, not just "authorized to use the bot at all."
- A credential/secrets strategy for the automation backend to reach the
  target systems it acts on (cloud API keys, [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md) service account
  tokens, database credentials) — store via a secrets manager (see
  [secrets-management](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[secrets-management](../../../DevOps_and_Cloud/Cloud_Providers/secrets-management/SKILL.md)/SKILL.md)),
  never embedded in the bot's own chat-command handler code.
- A durable [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) log destination (a dedicated `#chatops-[audit](../../../AI_and_Agents/Operations/audit/SKILL.md)` channel,
  a SIEM, or the execution backend's own history) that is separate from
  the ephemeral [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel — [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channels get archived,
  renamed, or are simply hard to search months later.

## Step-by-step guidance

1. **Classify every candidate [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) action by risk tier before
   automating it** — this decision should happen before any bot code is
   written, not be discovered by trial and error in production:
   ```
   Tier 1 (read-only/diagnostic): "get pod status", "show recent deploys",
     "tail error logs" — safe to expose broadly, no confirmation needed.
   Tier 2 (reversible, low blast radius): "restart one pod", "scale up
     replicas" — require role-scoped access, log every execution,
     confirmation optional based on team risk tolerance.
   Tier 3 (destructive or hard-to-reverse): "rollback a production
     deploy", "failover a database", "delete a resource", "restart an
     entire service fleet" — require role-scoped access AND an explicit
     confirmation step AND full [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging; never fully automated
     with no human trigger unless it's a pre-approved, narrowly-scoped
     auto-remediation with its own separate review.
   ```

2. **Register the slash command and route it to the execution backend**,
   keeping the chat-side handler thin — validate and forward, don't
   embed execution logic in the bot itself. Slack slash command example
   (illustrative handler):
   ```[python](../../Languages/python/SKILL.md)
   # slack_bot.py (illustrative — framework-agnostic sketch)
   @app.command("/restart")
   def handle_restart(ack, command, respond):
       ack()
       service = command["text"].strip()
       user = command["user_id"]
       if not is_authorized(user, action="restart", target=service):
           respond(f"You are not authorized to restart `{service}`.")
           return
       respond(f"Requesting restart of `{service}` — confirm with `/confirm {service}`")
       pending_confirmations[user] = {"action": "restart", "target": service, "ts": time.time()}
   ```

3. **Require an explicit, time-boxed confirmation step for Tier 2/3
   actions**, so a single mistyped or misread command doesn't execute
   immediately:
   ```[python](../../Languages/python/SKILL.md)
   @app.command("/confirm")
   def handle_confirm(ack, command, respond):
       ack()
       user = command["user_id"]
       pending = pending_confirmations.get(user)
       if not pending or time.time() - pending["ts"] > 60:
           respond("No pending action to confirm, or confirmation window expired.")
           return
       result = execution_backend.trigger(pending["action"], pending["target"], requested_by=user)
       audit_log.write(action=pending["action"], target=pending["target"], user=user, result=result)
       respond(f"Executed: {pending['action']} on `{pending['target']}` — {result}")
   ```
   > **Warning — destructive action risk:** a ChatOps command that
   > executes a destructive action (rollback, failover, mass restart,
   > delete) immediately on the first message, with no separate
   > confirmation step, is a standing risk of an accidental trigger — a
   > mistyped target, a message sent to the wrong channel, or a command
   > run by someone who misread the [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md). Always require a distinct
   > confirmation action (a second explicit command, a button click with
   > a short expiry) for anything in Tier 2/3, and never treat "it asked
   > a yes/no question in the same message" as equivalent — a genuinely
   > separate step, ideally naming the specific target back to the user,
   > catches far more mistakes.

4. **Scope authorization per action and per target, not per bot
   installation.** A user authorized to restart `checkout-api` in
   staging should not implicitly be authorized to trigger a database
   failover in production:
   ```yaml
   # rbac.yaml (illustrative)
   roles:
     checkout-oncall:
       actions: ["restart", "scale"]
       targets: ["checkout-api-staging", "checkout-api-prod"]
     platform-oncall:
       actions: ["restart", "scale", "rollback", "database-failover"]
       targets: ["*"]
   ```
   Map chat-platform user IDs to these roles via the same identity
   source of truth used elsewhere (the enterprise IdP — see
   [enterprise-sso-and-idp-federation-configuration](../../../[security-scanning](../../../Security/security-scanning/SKILL.md)-tooling/skills/[enterprise-sso-and-idp-federation-configuration](../../../DevOps_and_Cloud/Cloud_Providers/enterprise-sso-and-idp-federation-configuration/SKILL.md)/SKILL.md))
   rather than a hand-maintained list embedded in the bot's config that
   drifts from the actual on-call roster.

5. **Wire StackStorm or Rundeck as the actual execution backend** when
   [runbooks](../../../DevOps_and_Cloud/Observability_and_SecOps/runbooks/SKILL.md) need multi-step logic or richer built-in [audit](../../../AI_and_Agents/Operations/audit/SKILL.md)/ACL support
   rather than a from-scratch webhook handler. StackStorm rule example
   (triggering a pre-defined action in response to a chat event):
   ```yaml
   # stackstorm rule (illustrative)
   name: chatops_restart_checkout
   trigger:
     type: chatops.command
     parameters: { command: "restart", target: "checkout-api-prod" }
   criteria:
     trigger.payload.user_role: { type: "equals", pattern: "platform-oncall" }
   action:
     ref: [kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md).restart_deployment
     parameters:
       deployment: "checkout-api"
       namespace: "prod"
   ```
   Rundeck equivalent (a job with an explicit ACL policy restricting who
   can execute it):
   ```yaml
   # rundeck ACL policy (illustrative)
   by:
     group: platform-oncall
   for:
     job:
       - equals: { name: "restart-checkout-api-prod" }
         allow: [run]
   ```

6. **Log every executed action to a durable, searchable [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) trail**,
   including who confirmed it, what target, what the result was, and
   the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) (if any) it was executed under:
   ```json
   {
     "timestamp": "2026-07-28T14:18:03Z",
     "action": "restart",
     "target": "checkout-api-prod",
     "requested_by": "U04829",
     "confirmed_by": "U04829",
     "incident_ref": "INC0048213",
     "result": "success",
     "execution_backend": "stackstorm"
   }
   ```
   Post a summary of the action back into the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel *and*
   write the structured record to a durable log/SIEM — the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)
   channel is for real-time visibility, the durable log is what a
   postmortem or compliance [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) actually needs months later.

7. **Reflect ChatOps-executed changes into the ITSM record** when the
   org runs ServiceNow or an equivalent change-tracking system, so a
   production change made via chat during an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) has the same
   [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) trail as one made through the normal change process:
   ```http
   POST /api/now/table/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)/<INCIDENT_SYS_ID>/comment
   { "comment": "ChatOps action executed: restart checkout-api-prod, confirmed by jane.doe, result: success" }
   ```
   See
   [servicenow-itsm-integration](../[servicenow-itsm-integration](../../Miscellaneous/servicenow-itsm-integration/SKILL.md)/SKILL.md)
   for the fuller Change Request linkage pattern this should follow for
   anything that constitutes an actual production change, not just a
   diagnostic query.

8. **Rate-limit and time-box confirmation windows** so a stale pending
   confirmation can't be triggered by an unrelated later message, and so
   a bot outage or restart doesn't leave an ambiguous half-confirmed
   action in an unclear state — expire pending confirmations after a
   short window (e.g. 60 seconds) and require the user to re-issue the
   original command if it expires.

## Best practices

- Classify every [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) action by risk tier before building any
  automation for it — this single decision (read-only vs. reversible
  vs. destructive) drives every other design choice (confirmation
  requirement, RBAC scope, [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) depth) and should never be made
  implicitly while writing the bot's code.
- Require a genuinely separate confirmation step for any destructive or
  hard-to-reverse action — never treat the original command itself, or
  an inline yes/no reaction on the same message, as sufficient; a
  distinct action naming the specific target back to the user catches
  more mistakes than either alternative.
- Scope authorization per action and per target via the org's actual
  identity source of truth (the enterprise IdP/on-call roster), not a
  separately-maintained list inside the bot that silently drifts out of
  sync with who's actually on-call or actually left the team.
- Keep the chat-side bot handler thin (validate, authorize, forward) and
  push real execution logic into a dedicated automation backend
  (StackStorm/Rundeck) with its own ACL and [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) support — a bot that
  embeds direct `[kubectl](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubectl/SKILL.md)`/cloud-API calls in its own handler code is
  harder to [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) and harder to secure than delegating to a purpose-
  built execution layer.
- Log every executed action to a durable destination outside the
  ephemeral [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel, and reflect production changes into the
  org's ITSM change record if one exists — an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel that gets
  archived a month later is not an acceptable sole [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) trail for a
  production change.
- Time-box confirmation windows and expire stale pending confirmations
  — an open-ended "yes, still waiting for you to confirm" state is
  itself a source of confusion about whether an action is about to
  execute.
- Review the risk-tier classification and RBAC mapping periodically, the
  same way escalation policies and CMDB routing need periodic
  revalidation — a role that was correctly scoped at rollout drifts as
  team membership and service ownership change.

## Common pitfalls

- **Symptom:** An on-call engineer, moving fast during a real Sev1,
  mistypes a service name in a ChatOps rollback command, and the
  command executes immediately against the wrong (unrelated, healthy)
  service.
  **Fix:** This is exactly the scenario the confirmation step in step 3
  exists to catch — require the confirmation step to explicitly restate
  the target back to the user ("Confirm rollback of `payments-api-prod`
  — reply `/confirm payments-api-prod`") rather than a bare "yes/no,"
  so a mistyped target is visible and catchable before execution, not
  only after.

- **Symptom:** A junior engineer who has access to the ChatOps bot (but
  was never intended to be authorized for production database
  failovers) successfully triggers one during an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md), because the
  bot's authorization check only verifies "is this user allowed to use
  the bot," not "is this user allowed to run *this specific action*."
  **Fix:** Scope authorization per action and per target (step 4), not
  per bot installation — a flat "can use ChatOps" permission is not
  equivalent to action-level RBAC, and the two are commonly conflated
  when a bot is built quickly under time pressure.

- **Symptom:** Months after an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md), a postmortem needs to determine
  exactly which ChatOps actions were executed and by whom, but the only
  record is scrollback in an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) Slack channel that's since been
  archived and is no longer searchable.
  **Fix:** Write every executed action to a durable, structured [audit](../../../AI_and_Agents/Operations/audit/SKILL.md)
  log outside the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel (step 6) at execution time, not
  after the fact — the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel is for real-time visibility
  during the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md), not the system of record for what actually
  happened.

- **Symptom:** A ChatOps bot restart or brief outage leaves a user's
  pending confirmation in an ambiguous state — they're unsure whether
  their earlier command is still "waiting to be confirmed" or was lost,
  and they re-issue it, potentially causing a double-execution.
  **Fix:** Time-box confirmation windows to a short, explicit duration
  (step 8) and have the bot respond clearly on restart/reconnect that
  any prior pending confirmation has expired and must be re-issued from
  scratch — never leave an implicit, open-ended pending state.

- **Symptom:** A [runbook](../../../DevOps_and_Cloud/Observability_and_SecOps/runbook/SKILL.md) action that was originally Tier 2 (reversible,
  e.g. "restart one pod") gets extended over time to also handle a Tier
  3 case (e.g. the same command now also supports "restart entire
  fleet" via a wildcard target) without anyone re-reviewing its
  confirmation/RBAC requirements for the new, higher-blast-radius case.
  **Fix:** Treat a change to an action's *scope* (not just adding a new
  action) as triggering the same risk-tier classification review from
  step 1 — a command that quietly grew from single-target to
  fleet-wide needs its confirmation and authorization requirements
  re-evaluated, not inherited from when it was a narrower, lower-risk
  action.

## Worked example

**Scenario:** The platform team builds a ChatOps restart/rollback
capability for `checkout-api`, wired through StackStorm, with
Tier-3-appropriate safeguards for the rollback action.

Risk-tier classification:
```
Tier 1: /status checkout-api        — read-only, no confirmation, broad access
Tier 2: /restart checkout-api-<env> — reversible, confirmation required, role-scoped
Tier 3: /rollback checkout-api-prod — destructive, confirmation required, narrowly role-scoped
```

Slack command handler (thin — validates and forwards):
```[python](../../Languages/python/SKILL.md)
@app.command("/rollback")
def handle_rollback(ack, command, respond):
    ack()
    target = command["text"].strip()
    user = command["user_id"]
    if not rbac.is_authorized(user, action="rollback", target=target):
        respond(f"You are not authorized to roll back `{target}`.")
        return
    pending_confirmations[user] = {"action": "rollback", "target": target, "ts": time.time()}
    respond(f"Confirm rollback of `{target}` — reply `/confirm {target}` within 60s.")
```

StackStorm execution (only triggered after confirmed, and only for
`platform-oncall` role, per the RBAC mapping in step 4):
```yaml
name: chatops_rollback_checkout_prod
trigger:
  type: chatops.confirmed_command
  parameters: { action: "rollback", target: "checkout-api-prod" }
criteria:
  trigger.payload.user_role: { type: "equals", pattern: "platform-oncall" }
action:
  ref: [kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md).rollback_deployment
  parameters: { deployment: "checkout-api", namespace: "prod" }
```

[Audit](../../../AI_and_Agents/Operations/audit/SKILL.md) record written on execution, plus a comment posted back to the
linked ServiceNow [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md):
```json
{
  "timestamp": "2026-07-28T14:22:11Z",
  "action": "rollback",
  "target": "checkout-api-prod",
  "requested_by": "U04829",
  "confirmed_by": "U04829",
  "incident_ref": "INC0048213",
  "result": "success"
}
```
```http
POST /api/now/table/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)/INC0048213/comment
{ "comment": "ChatOps action executed: rollback checkout-api-prod, confirmed by jane.doe, result: success" }
```

Result: the rollback that mitigates the Sev1 happens in under a minute
from the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) channel, with an explicit confirmation step that
would have caught a mistyped target, scoped to only the on-call role
authorized for production rollbacks, and durably logged both in the
[audit](../../../AI_and_Agents/Operations/audit/SKILL.md) system and the ServiceNow [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) record for the postmortem.

## Cross-references

- [servicenow-itsm-integration](../[servicenow-itsm-integration](../../Miscellaneous/servicenow-itsm-integration/SKILL.md)/SKILL.md) —
  where ChatOps-executed production changes should be reflected for
  [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) purposes, and the Emergency Change pattern a Tier 3 ChatOps
  action during an [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md) should often also trigger.
- [pagerduty-opsgenie-configuration-validation](../[pagerduty-opsgenie-configuration-validation](../../../DevOps_and_Cloud/Observability_and_SecOps/pagerduty-opsgenie-configuration-validation/SKILL.md)/SKILL.md) —
  this skill's validation findings are a natural destination for a
  ChatOps bot's scheduled notification, closing the loop between
  "found a gap" and "the team actually saw it."
- [incident-response-and-on-call-management](../../../site-reliability-engineering/skills/[incident-response-and-on-call-management](../[incident-response](../../../DevOps_and_Cloud/Observability_and_SecOps/[incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-response/SKILL.md)-and-[on-call-management](../../../DevOps_and_Cloud/Observability_and_SecOps/on-call-management/SKILL.md)/SKILL.md)/SKILL.md) —
  the [incident](../../../DevOps_and_Cloud/Observability_and_SecOps/incident/SKILL.md)-command structure and role definitions (who is the Tech
  Lead authorized to trigger a mitigation) that ChatOps authorization
  scoping should align with.
- [secrets-management](../../../[devsecops](../../../Security/devsecops/SKILL.md)/skills/[secrets-management](../../../DevOps_and_Cloud/Cloud_Providers/secrets-management/SKILL.md)/SKILL.md) —
  how the automation backend's credentials for reaching target systems
  (cloud APIs, [Kubernetes](../../../DevOps_and_Cloud/Containers_and_Orchestration/kubernetes/SKILL.md)) should actually be stored and rotated.
