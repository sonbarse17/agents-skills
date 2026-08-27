---
name: using-agent-skills
description: Discovers and invokes agent skills. Use when starting a session or
  when you need to discover which skill applies to the current task. This is the
  meta-skill that governs how all other skills are discovered and invoked.
tags:
  - miscellaneous
  - using-agent-skills
depends_on: []
---

# Using Agent Skills

## Overview

Agent Skills is a collection of engineering workflow skills organized by development phase. Each skill encodes a specific process that senior engineers follow. This meta-skill helps you discover and apply the right skill for your current task.

## Skill Discovery

When a task arrives, identify the development phase and apply the corresponding skill:

```
Task arrives
    │
    ├── Don't know what you want yet? ──────→ [interview-me](../../Frontend/interview-me/SKILL.md)
    ├── Have a rough concept, need variants? → [idea-refine](../../../Product_and_Business/idea-refine/SKILL.md)
    ├── New project/feature/change? ──→ [spec-driven-development](../../Frontend/spec-driven-development/SKILL.md)
    ├── Have a spec, need tasks? ──────→ [planning-and-task-breakdown](../../Frontend/planning-and-task-breakdown/SKILL.md)
    ├── Implementing code? ────────────→ [incremental-implementation](../../Patterns/incremental-implementation/SKILL.md)
    │   ├── UI work? ─────────────────→ [frontend-ui-engineering](../../Frontend/frontend-ui-engineering/SKILL.md)
    │   ├── API work? ────────────────→ [api-and-interface-design](../../Backend/api-and-interface-design/SKILL.md)
    │   ├── Need better context? ─────→ [context-engineering](../../../AI_and_Agents/Workflows/context-engineering/SKILL.md)
    │   ├── Need doc-verified code? ───→ [source-driven-development](../../Frontend/source-driven-development/SKILL.md)
    │   └── Stakes high / unfamiliar code? ──→ [doubt-driven-development](../../../DevOps_and_Cloud/Observability_and_SecOps/doubt-driven-development/SKILL.md)
    ├── Writing/running tests? ────────→ [test-driven-development](../../../DevOps_and_Cloud/Observability_and_SecOps/test-driven-development/SKILL.md)
    │   └── Browser-based? ───────────→ [browser-testing-with-devtools](../../Frontend/browser-testing-with-devtools/SKILL.md)
    ├── Something broke? ──────────────→ [debugging-and-error-recovery](../../Patterns/debugging-and-error-recovery/SKILL.md)
    ├── Reviewing code? ───────────────→ [code-review-and-quality](../../Patterns/[code-review](../code-review/SKILL.md)-and-quality/SKILL.md)
    │   ├── Too complex? ─────────────→ [code-simplification](../../Patterns/code-simplification/SKILL.md)
    │   ├── Security concerns? ───────→ [security-and-hardening](../../../Security/security-and-hardening/SKILL.md)
    │   └── Performance concerns? ────→ [performance-optimization](../../Backend/performance-optimization/SKILL.md)
    ├── Committing/branching? ─────────→ [git-workflow-and-versioning](../../../DevOps_and_Cloud/CI_CD/[git-workflow](../../../DevOps_and_Cloud/CI_CD/git-workflow/SKILL.md)-and-versioning/SKILL.md)
    ├── CI/CD pipeline work? ──────────→ [ci-cd-and-automation](../../../DevOps_and_Cloud/CI_CD/ci-cd-and-automation/SKILL.md)
    ├── Deprecating/migrating? ────────→ [deprecation-and-migration](../../Patterns/deprecation-and-migration/SKILL.md)
    ├── Writing docs/ADRs? ───────────→ [documentation-and-adrs](../../../Product_and_Business/documentation-and-adrs/SKILL.md)
    ├── Adding logs/metrics/alerts? ───→ [observability-and-instrumentation](../../../DevOps_and_Cloud/Observability_and_SecOps/[observability](../../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md)-and-instrumentation/SKILL.md)
    └── Deploying/launching? ─────────→ [shipping-and-launch](../../../Product_and_Business/shipping-and-launch/SKILL.md)
```

## Core Operating Behaviors

These behaviors apply at all times, across all skills. They are non-negotiable.

### 1. Surface Assumptions

Before implementing anything non-trivial, explicitly state your assumptions:

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about architecture]
3. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

Don't silently fill in ambiguous requirements. The most common failure mode is making wrong assumptions and running with them unchecked. Surface uncertainty early — it's cheaper than rework.

### 2. Manage Confusion Actively

When you encounter inconsistencies, conflicting requirements, or unclear specifications:

1. **STOP.** Do not proceed with a guess.
2. Name the specific confusion.
3. Present the tradeoff or ask the clarifying question.
4. Wait for resolution before continuing.

**Bad:** Silently picking one interpretation and hoping it's right.
**Good:** "I see X in the spec but Y in the existing code. Which takes precedence?"

### 3. Push Back When Warranted

You are not a yes-machine. When an approach has clear problems:

- Point out the issue directly
- Explain the concrete downside (quantify when possible — "this adds ~200ms latency" not "this might be slower")
- Propose an alternative
- Accept the human's decision if they override with full information

Sycophancy is a failure mode. "Of course!" followed by implementing a bad idea helps no one. Honest technical disagreement is more valuable than false agreement.

### 4. Enforce Simplicity

Your natural tendency is to overcomplicate. Actively resist it.

Before finishing any implementation, ask:
- Can this be done in fewer lines?
- Are these abstractions earning their complexity?
- Would a staff engineer look at this and say "why didn't you just..."?

If you build 1000 lines and 100 would suffice, you have failed. Prefer the boring, obvious solution. Cleverness is expensive.

### 5. Maintain Scope Discipline

Touch only what you're asked to touch.

Do NOT:
- Remove comments you don't understand
- "Clean up" code orthogonal to the task
- Refactor adjacent systems as a side effect
- Delete code that seems unused without explicit approval
- Add features not in the spec because they "seem useful"

Your job is surgical precision, not unsolicited renovation.

### 6. Verify, Don't Assume

Every skill includes a verification step. A task is not complete until verification passes. "Seems right" is never sufficient — there must be evidence (passing tests, build output, runtime data).

Per-skill verification is the local check. The project-wide bar that applies to *every* change, regardless of which skill is active, is the Definition of Done: tests pass, no regressions, behavior verified at runtime, docs updated. See `../../references/definition-of-done.md`. It complements each task's acceptance criteria rather than replacing them.

## Failure Modes to Avoid

These are the subtle errors that look like productivity but create problems:

1. Making wrong assumptions without checking
2. Not managing your own confusion — plowing ahead when lost
3. Not surfacing inconsistencies you notice
4. Not presenting tradeoffs on non-obvious decisions
5. Being sycophantic ("Of course!") to approaches with clear problems
6. Overcomplicating code and APIs
7. Modifying code or comments orthogonal to the task
8. Removing things you don't fully understand
9. Building without a spec because "it's obvious"
10. Skipping verification because "it looks right"

## Skill Rules

1. **Check for an applicable skill before starting work.** Skills encode processes that prevent common mistakes.

2. **Skills are workflows, not suggestions.** Follow the steps in order. Don't skip verification steps.

3. **Multiple skills can apply.** A feature implementation might involve `[idea-refine](../../../Product_and_Business/idea-refine/SKILL.md)` → `[spec-driven-development](../../Frontend/spec-driven-development/SKILL.md)` → `[planning-and-task-breakdown](../../Frontend/planning-and-task-breakdown/SKILL.md)` → `[incremental-implementation](../../Patterns/incremental-implementation/SKILL.md)` → `[test-driven-development](../../../DevOps_and_Cloud/Observability_and_SecOps/test-driven-development/SKILL.md)` → `[code-review-and-quality](../../Patterns/[code-review](../code-review/SKILL.md)-and-quality/SKILL.md)` → `[code-simplification](../../Patterns/code-simplification/SKILL.md)` → `[shipping-and-launch](../../../Product_and_Business/shipping-and-launch/SKILL.md)` in sequence.

4. **When in doubt, start with a spec.** If the task is non-trivial and there's no spec, begin with `[spec-driven-development](../../Frontend/spec-driven-development/SKILL.md)`.

## Lifecycle Sequence

For a complete feature, the typical skill sequence is:

```
1.  [interview-me](../../Frontend/interview-me/SKILL.md)                → Extract what the user actually wants
2.  [idea-refine](../../../Product_and_Business/idea-refine/SKILL.md)                 → Refine vague ideas
3.  [spec-driven-development](../../Frontend/spec-driven-development/SKILL.md)     → Define what we're building
4.  [planning-and-task-breakdown](../../Frontend/planning-and-task-breakdown/SKILL.md) → Break into verifiable chunks
5.  [context-engineering](../../../AI_and_Agents/Workflows/context-engineering/SKILL.md)         → Load the right context
6.  [source-driven-development](../../Frontend/source-driven-development/SKILL.md)   → Verify against official docs
7.  [incremental-implementation](../../Patterns/incremental-implementation/SKILL.md)  → Build slice by slice
8.  [observability-and-instrumentation](../../../DevOps_and_Cloud/Observability_and_SecOps/[observability](../../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md)-and-instrumentation/SKILL.md) → Instrument as you build (runs parallel with 7-9, not after)
9.  [doubt-driven-development](../../../DevOps_and_Cloud/Observability_and_SecOps/doubt-driven-development/SKILL.md)    → Cross-examine non-trivial decisions in-flight
10. [test-driven-development](../../../DevOps_and_Cloud/Observability_and_SecOps/test-driven-development/SKILL.md)     → Prove each slice works
11. [code-review-and-quality](../../Patterns/[code-review](../code-review/SKILL.md)-and-quality/SKILL.md)     → Review before merge
12. [code-simplification](../../Patterns/code-simplification/SKILL.md)         → Reduce unnecessary complexity while preserving behavior
13. [git-workflow-and-versioning](../../../DevOps_and_Cloud/CI_CD/[git-workflow](../../../DevOps_and_Cloud/CI_CD/git-workflow/SKILL.md)-and-versioning/SKILL.md) → Clean [commit](../../../DevOps_and_Cloud/CI_CD/commit/SKILL.md) history
14. [documentation-and-adrs](../../../Product_and_Business/documentation-and-adrs/SKILL.md)      → Document decisions
15. [deprecation-and-migration](../../Patterns/deprecation-and-migration/SKILL.md)   → Retire old systems and move users safely when needed
16. [shipping-and-launch](../../../Product_and_Business/shipping-and-launch/SKILL.md)         → Deploy safely
```

Not every task needs every skill. A bug fix might only need: `[debugging-and-error-recovery](../../Patterns/debugging-and-error-recovery/SKILL.md)` → `[test-driven-development](../../../DevOps_and_Cloud/Observability_and_SecOps/test-driven-development/SKILL.md)` → `[code-review-and-quality](../../Patterns/[code-review](../code-review/SKILL.md)-and-quality/SKILL.md)`.

## Quick Reference

| Phase | Skill | One-Line Summary |
|-------|-------|-----------------|
| Define | [interview-me](../../Frontend/interview-me/SKILL.md) | Surface what the user actually wants before any plan, spec, or code exists |
| Define | [idea-refine](../../../Product_and_Business/idea-refine/SKILL.md) | Refine ideas through structured divergent and convergent thinking |
| Define | [spec-driven-development](../../Frontend/spec-driven-development/SKILL.md) | Requirements and acceptance criteria before code |
| Plan | [planning-and-task-breakdown](../../Frontend/planning-and-task-breakdown/SKILL.md) | Decompose into small, verifiable tasks |
| Build | [incremental-implementation](../../Patterns/incremental-implementation/SKILL.md) | Thin vertical slices, test each before expanding |
| Build | [source-driven-development](../../Frontend/source-driven-development/SKILL.md) | Verify against official docs before implementing |
| Build | [doubt-driven-development](../../../DevOps_and_Cloud/Observability_and_SecOps/doubt-driven-development/SKILL.md) | Adversarial fresh-context review of every non-trivial decision |
| Build | [context-engineering](../../../AI_and_Agents/Workflows/context-engineering/SKILL.md) | Right context at the right time |
| Build | [frontend-ui-engineering](../../Frontend/frontend-ui-engineering/SKILL.md) | Production-quality UI with accessibility |
| Build | [api-and-interface-design](../../Backend/api-and-interface-design/SKILL.md) | Stable interfaces with clear contracts |
| Verify | [test-driven-development](../../../DevOps_and_Cloud/Observability_and_SecOps/test-driven-development/SKILL.md) | Failing test first, then make it pass |
| Verify | [browser-testing-with-devtools](../../Frontend/browser-testing-with-devtools/SKILL.md) | Chrome DevTools MCP for runtime verification |
| Verify | [debugging-and-error-recovery](../../Patterns/debugging-and-error-recovery/SKILL.md) | Reproduce → localize → fix → guard |
| Review | [code-review-and-quality](../../Patterns/[code-review](../code-review/SKILL.md)-and-quality/SKILL.md) | Five-axis review with quality gates |
| Review | [code-simplification](../../Patterns/code-simplification/SKILL.md) | Preserve behavior while reducing unnecessary complexity |
| Review | [security-and-hardening](../../../Security/security-and-hardening/SKILL.md) | OWASP prevention, input validation, least privilege |
| Review | [performance-optimization](../../Backend/performance-optimization/SKILL.md) | Measure first, optimize only what matters |
| Ship | [git-workflow-and-versioning](../../../DevOps_and_Cloud/CI_CD/[git-workflow](../../../DevOps_and_Cloud/CI_CD/git-workflow/SKILL.md)-and-versioning/SKILL.md) | Atomic commits, clean history |
| Ship | [ci-cd-and-automation](../../../DevOps_and_Cloud/CI_CD/ci-cd-and-automation/SKILL.md) | Automated quality gates on every change |
| Ship | [deprecation-and-migration](../../Patterns/deprecation-and-migration/SKILL.md) | Remove old systems and migrate users safely |
| Ship | [documentation-and-adrs](../../../Product_and_Business/documentation-and-adrs/SKILL.md) | Document the why, not just the what |
| Ship | [observability-and-instrumentation](../../../DevOps_and_Cloud/Observability_and_SecOps/[observability](../../../DevOps_and_Cloud/Observability_and_SecOps/observability/SKILL.md)-and-instrumentation/SKILL.md) | Structured logs, RED metrics, traces, symptom-based alerts |
| Ship | [shipping-and-launch](../../../Product_and_Business/shipping-and-launch/SKILL.md) | Pre-launch checklist, [monitoring](../../../DevOps_and_Cloud/Observability_and_SecOps/monitoring/SKILL.md), rollback plan |
