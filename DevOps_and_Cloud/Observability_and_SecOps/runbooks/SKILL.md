---
name: runbooks
description: Writes and maintains the procedural documents that let a tired,
  half-awake engineer resolve a known failure at 3am without needing the
  original author or deep system knowledge. Use this whenever the user is
  documenting an operational procedure, writing a "what to do when X fires" doc,
  building an alert-to-action mapping, or complaining that on-call has to
  reverse-engineer fixes each time an alert repeats. For the live coordination
  during an active incident use `incident-response`, and for the improvised
  procedures that emerge in one-off outages use `root-cause-analysis` to turn
  them into a permanent runbook.
license: MIT
tags:
  - observability_and_secops
  - runbooks
depends_on: []
---

# Runbooks

A [runbook](../runbook/SKILL.md) is not documentation about the system — it is a script for a specific person in a
specific bad moment: paged at 3am, half-asleep, unfamiliar with this particular service, under
pressure to fix it fast. Write for that reader, not for someone doing a leisurely deep-dive at
their desk. If the [runbook](../runbook/SKILL.md) requires understanding why the fix works, it has already failed its
purpose.

The test of a good [runbook](../runbook/SKILL.md) is whether someone who has never touched the service could follow
it and resolve the issue. If it only works for the person who wrote it, it is a note to self,
not a [runbook](../runbook/SKILL.md).

**Write for a tired stranger, not for yourself.**

## 1. Trigger the [runbook](../runbook/SKILL.md) from the alert, not the other way around

A [runbook](../runbook/SKILL.md) nobody can find during an [incident](../incident/SKILL.md) does not exist. Every alert that pages a human
should link directly to the [runbook](../runbook/SKILL.md) for that specific failure — not a wiki search, not "ask in
Slack," a direct link in the alert payload itself.

- **One [runbook](../runbook/SKILL.md) per alert, not per service** — a service with ten alerts needs ten short
  runbooks, not one long one the responder has to search.
- **Name the [runbook](../runbook/SKILL.md) after the symptom**, not the fix — "Disk usage above 90%" not "Cleanup
  script."
- **Put the link in the alert**, see `[alerting](../alerting/SKILL.md)` — a [runbook](../runbook/SKILL.md) is only as good as its
  discoverability under pressure.

**Done when:** paging on this alert lands the responder on the exact [runbook](../runbook/SKILL.md) within one click.

## 2. Write concrete steps, not concrete goals

"Investigate the cause of high latency" is a goal. "Run `[kubectl](../../Containers_and_Orchestration/kubectl/SKILL.md) top pods -n api` and check if
any pod exceeds 80% CPU; if so, run the scale-up command below" is a step. A tired reader
cannot turn a goal into an action under pressure — that translation is exactly the expertise
the [runbook](../runbook/SKILL.md) exists to replace.

```
1. Check queue depth:  curl -s internal/metrics/queue_depth
2. If depth > 10,000: run scale-consumers.sh --count +5
3. Re-check after 3 min. If still climbing, escalate to #data-platform (see step 5).
4. If depth is falling, monitor for 15 min then close.
5. Escalation: page @data-platform-oncall via PagerDuty, do not use Slack DM.
```

- **Every command is copy-pasteable**, with real flags, not placeholders like
  `<your-namespace>`.
- **State the expected output** so the reader can tell whether the step worked.
- **Number the steps** — a numbered list survives being read out loud over a phone call; prose
  doesn't.

**Done when:** a reader unfamiliar with the service could execute every step without needing
to interpret intent.

## 3. Make the decision points explicit

Every [runbook](../runbook/SKILL.md) has branches — "if this, then that; otherwise, escalate." Leaving the branch
implicit forces the responder to make a judgment call they are the least equipped to make at
3am. Write the branch down, including what "otherwise" means.

- **State the threshold, not a vague description** — "if error rate exceeds 2%" not "if error
  rate looks high."
- **Give an explicit escalation path for every branch**, including who to page and what
  channel to use — see `[on-call-management](../on-call-management/SKILL.md)`.
- **Cap the number of retries or attempts** before the [runbook](../runbook/SKILL.md) itself says "stop, escalate
  now" — a [runbook](../runbook/SKILL.md) that lets someone loop for an hour has a bug.

**Done when:** every decision point in the [runbook](../runbook/SKILL.md) states a measurable threshold and a named
next action.

## 4. Keep the blast radius of every step visible

A [runbook](../runbook/SKILL.md) step that restarts the wrong thing, or a rollback command with an unstated scope,
can turn a contained [incident](../incident/SKILL.md) into a bigger one. State what each command affects before the
responder runs it, especially anything destructive or irreversible.

- **Label destructive steps explicitly** — "this restarts all pods in the deployment, expect
  ~30s of 5xx."
- **Prefer the smallest-blast-radius fix first**, escalate to bigger interventions only if it
  doesn't work.
- **Never bury a `DELETE` or `--force` flag mid-paragraph** — put it on its own line with a
  warning.

**Done when:** no step's side effects would surprise the person running it.

## 5. Test runbooks the same way you test code

An untested [runbook](../runbook/SKILL.md) is a hypothesis, not a procedure. Commands drift, tools get renamed,
permissions change, and a [runbook](../runbook/SKILL.md) that worked six months ago silently rots. The only way to
know it still works is to run it.

- **Run every [runbook](../runbook/SKILL.md) during a game day** — see `[chaos-engineering](../chaos-engineering/SKILL.md)` — not just read it.
- **Assign an owning team**, not an owning individual, so it survives someone leaving.
- **Set a staleness check** — a [runbook](../runbook/SKILL.md) not reviewed in the last quarter is a suspect [runbook](../runbook/SKILL.md);
  flag it.

**Done when:** the [runbook](../runbook/SKILL.md) has been executed successfully by someone other than its author
within the last review cycle.

## 6. Retire runbooks as aggressively as you write them

A stale [runbook](../runbook/SKILL.md) is worse than no [runbook](../runbook/SKILL.md) — it sends a tired responder down a path that no
longer applies to the current system. When the underlying failure mode is fixed, or the
service is decommissioned, the [runbook](../runbook/SKILL.md) needs to go with it, not linger as a trap.

- **Delete, don't archive-and-forget** — a [runbook](../runbook/SKILL.md) folder full of dead procedures erodes trust
  in all of them.
- **Link [runbook](../runbook/SKILL.md) updates to the change that invalidates them** — if a deploy changes the
  recovery command, the [runbook](../runbook/SKILL.md) PR ships in the same change.

**Done when:** every [runbook](../runbook/SKILL.md) currently linked from an alert reflects the system as it exists
today.

## Report

State how many runbooks were written or updated, which alerts they're now linked from, and
whether they've been execution-tested or only reviewed on paper. Name explicitly which ones
are still unvalidated in practice — an untested [runbook](../runbook/SKILL.md) read as complete is more dangerous
than an obviously missing one, because it creates false confidence at the exact moment
confidence is needed least.
