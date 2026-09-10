---
name: personas-journey-mapping
description: Synthesize UX research into personas and journey maps — building
  evidence-based (not assumed) personas, mapping end-to-end user journeys,
  and identifying friction points and moments of truth. Use when research
  findings need to be turned into a shared reference artifact for a team, or
  when scoping a redesign around the full journey rather than one screen.
tags:
  - frontend
  - personas-journey-mapping
depends_on:
  - ux-research
---

# Personas & Journey Mapping

Personas and journey maps are synthesis artifacts — they turn raw research into a shared
reference the whole team can design and prioritize against. Their value depends entirely on being
built from real research; a persona invented from assumptions in a conference room is worse than
no persona, because it launders opinion into something that looks like evidence.

## When to Use This Skill

- Turning interview/survey findings into a small set of representative user archetypes
- Mapping an end-to-end journey (not just one screen) to find friction points
- Aligning a cross-functional team around who they're building for and what the full experience looks like
- Scoping a redesign around journey friction rather than a single isolated screen
- Prioritizing which pain point in a journey to fix first

## Building Evidence-Based Personas

```
Research (interviews, surveys, analytics, support tickets)
    ↓
Identify recurring patterns in goals, behaviors, and pain points
    ↓
Cluster patterns into 2-4 distinct archetypes (not more — dilutes focus)
    ↓
Persona = goals + behaviors + pain points + context, cited back to real research
```

A persona is **not** a demographic profile with a stock photo and a made-up name. Age, photo, and
name are the least useful and most assumption-prone parts — the useful content is:

| Section | Content | Source |
|---|---|---|
| Goals | What they're trying to accomplish, in their words | Interview quotes, survey open-ends |
| Behaviors | How they currently solve this problem, tools/workarounds used | Observed in usability tests, interviews |
| Pain points | Specific, concrete frustrations — not vague ("it's slow") but instantiated ("waits 3 days for approval before starting work") | Interviews, support tickets, analytics drop-off |
| Context | When/where/how often they encounter this need | Diary studies, survey frequency questions |
| Anti-goals | What they explicitly do NOT want (over-automation, losing control, etc.) | Interviews — often overlooked but critical for scope |

Limit to **2-4 personas** per product — more than that, teams can't hold them in mind and design
decisions revert to "the average user," which defeats the purpose. If research reveals more than
4 meaningfully distinct segments, that's a signal the product may need to serve fewer segments
better, not five personas equally.

### Keep Personas Alive

- Revisit personas after major research rounds — a persona built two years ago on an earlier
  product may no longer represent current users.
- Tie every persona claim to a citation (interview number, survey question) so anyone challenging
  a design decision can trace it back to evidence, not memory.
- Retire a persona explicitly (don't just let it go stale silently) when it's no longer
  representative or the product has moved past that segment.

## Journey Mapping

A journey map plots a persona's experience across **phases** of accomplishing a goal — before,
during, and after the core interaction, not just the screens inside your product.

```
Phase:       Awareness → Consideration → Onboarding → Core Use → Renewal/Churn
Actions:     Searches   Compares       Signs up      Daily task  Evaluates value
             for a       options        Sets up       Repeats                Decides to
             solution                   account       weekly                 renew/leave
Thoughts:    "Is this    "Which one     "This is      "This       "Was this
             even a       fits my       taking a      saves me    worth the
             solved       budget?"      while"        time"       cost?"
             problem?"
Emotions:    Curious      Skeptical     Frustrated ▼  Satisfied ▲ Uncertain
Touchpoints: Search ad,   Pricing page, Signup form,  Dashboard   Renewal
             blog post    reviews       onboarding    UI          email
Pain points: --           Unclear       Too many      --          No visibility
                          pricing tiers required                  into usage
                                        fields                    before renewal
```

- Include phases **outside** the product (how they discovered the need, what happens after they
  stop using it) — the most valuable friction points are frequently at these boundaries, not
  inside the polished core flow.
- Plot the emotional curve explicitly — it visually surfaces where the experience dips, which is
  usually the highest-priority fix regardless of how minor that screen seems in isolation.
- Mark **moments of truth**: the few interactions that disproportionately shape whether the user
  trusts and continues with the product (first successful task, first error encountered, the
  cancellation flow). These deserve design attention disproportionate to how often they occur.

## From Map to Prioritization

- Rank friction points by (a) severity — does it block the goal or just annoy — and (b)
  how many personas/segments hit it, not by which team happens to own that part of the product.
- A journey map that doesn't change any roadmap prioritization was probably built as a
  deliverable, not used as a tool — the output should be a ranked list of friction points to
  address, not just a wall poster.
- Re-map after a significant redesign to verify the friction was actually resolved, not assumed
  resolved.

## Common Pitfalls

1. **Assumption-based personas**: demographic caricatures built without citing real research.
2. **Too many personas**: 6+ archetypes that dilute focus back to "design for everyone."
3. **Journey map scoped only to in-product screens**: missing the before/after phases where real friction often lives.
4. **Static artifacts**: personas/maps built once, never revisited, silently going stale.
5. **No connection to roadmap**: a journey map that doesn't produce a prioritized action list.
6. **Treating personas as fixed segments for life**: not retiring or updating them as the product and user base evolve.

## Rules

1. Every persona claim (goal, behavior, pain point) traces back to a specific research source.
2. Cap active personas at 2-4; consolidate or re-segment rather than exceeding that.
3. Journey maps include phases before and after the core in-product experience.
4. Every journey map produces a ranked list of friction points, not just a visual artifact.
5. Revisit personas and journey maps after major research rounds or redesigns — don't let them go stale silently.
