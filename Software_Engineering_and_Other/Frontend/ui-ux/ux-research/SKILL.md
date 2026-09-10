---
name: ux-research
description: Plan and run UX research and usability testing — method
  selection, moderated/unmoderated usability testing, interviews, surveys,
  card sorting, tree testing, and A/B testing. Use when validating a design
  direction, choosing a research method, writing a research plan, or
  synthesizing findings into actionable recommendations.
tags:
  - frontend
  - ux-research
depends_on:
  - personas-journey-mapping
  - frontend-design-review
---

# UX Research

Research reduces the risk of building the wrong thing by testing assumptions against real users
before (or instead of) shipping and finding out. The method matters less than asking a clear
question first — pick the method that answers that specific question, not the one that's fastest.

## When to Use This Skill

- Choosing a research method for a specific question (usability, attitudes, information architecture, demand)
- Planning and running moderated or unmoderated usability tests
- Writing interview or survey scripts that avoid leading questions
- Running card sorting or tree testing for navigation/IA decisions
- Setting up and interpreting an A/B test
- Synthesizing research findings into prioritized, actionable recommendations

## Method Selection

```
What question are you answering?
├── "Can users complete this task?" → Usability testing (moderated or unmoderated)
├── "What do users think/feel/need?" → Interviews, surveys
├── "Does our navigation/categorization make sense?" → Card sorting (open/closed), tree testing
├── "Which variant performs better?" → A/B testing (needs existing traffic)
├── "Is there demand for this at all?" → Concept testing, fake-door test, interviews
└── "Where do users struggle in an existing flow?" → Session recordings, analytics funnel, usability testing
```

| Method | Sample size | Qual/Quant | Best for |
|---|---|---|---|
| Moderated usability test | 5-8 per segment | Qualitative | Deep task-completion issues, "why" behind behavior |
| Unmoderated usability test | 15-30 | Mixed | Faster, cheaper coverage across more participants |
| Interviews | 5-10 per segment | Qualitative | Attitudes, motivations, unmet needs |
| Surveys | 100+ for statistical validity | Quantitative | Prevalence of an opinion, satisfaction scores (SUS, NPS, CSAT) |
| Card sorting | 15-30 | Mixed | Building or validating a category structure |
| Tree testing | 30-50 | Quantitative | Validating findability in an existing/proposed navigation |
| A/B test | Depends on baseline traffic/effect size | Quantitative | Measuring the effect of a specific change on a metric |

**5 users is enough** for a *qualitative* usability test to surface ~85% of usability problems
(Nielsen's research) — more participants find the same recurring issues, not new ones. Reserve
larger samples for quantitative claims (A/B tests, surveys) where you need statistical confidence.

## Writing Unbiased Research Questions

```
BAD (leading): "Don't you think this new checkout flow is easier?"
GOOD (neutral): "Walk me through how you'd complete a purchase here."

BAD (double-barreled): "Was the signup process fast and easy to understand?"
GOOD (single question): "How would you describe the signup process?"

BAD (hypothetical): "Would you use a feature that let you save items for later?"
GOOD (behavioral): "Tell me about the last time you wanted to buy something but didn't right away. What did you do?"
```

Ask about past behavior, not hypothetical future behavior — people are unreliable predictors of
their own future actions but reasonably accurate reporters of what they actually did.

## Usability Testing Script Structure

1. **Introduction** (2 min): purpose, think-aloud instruction, "there are no wrong answers, we're testing the design not you."
2. **Background questions** (3 min): context about the participant relevant to the study.
3. **Tasks** (15-20 min): realistic scenarios, not instructions ("You want to buy a gift for a friend's birthday" not "Click Add to Cart").
4. **Post-task questions**: "How difficult was that?" (1-7 scale), "What would you expect to happen next?"
5. **Debrief** (5 min): overall impressions, System Usability Scale (SUS) if quantifying.

Never help a struggling participant mid-task — note where they got stuck and ask about it in the
debrief instead. Helping contaminates the data on where the real friction is.

## Card Sorting & Tree Testing

- **Open card sort**: participants group items AND name the groups — use early, to discover a category structure from scratch.
- **Closed card sort**: participants sort items into categories you've already defined — use to validate a structure you've drafted.
- **Tree testing**: participants find where they'd look for something in a *text-only* hierarchy (no visual design) — use to validate navigation findability independent of visual design quality. Run this before investing in visual design of the navigation.

## A/B Testing

- Define the primary metric and minimum detectable effect *before* launching — don't pick a
  metric after seeing results.
- Calculate required sample size ahead of time based on baseline conversion rate and desired
  effect size; stopping early because a result "looks significant" inflates false positives.
- Test one variable at a time unless running a multivariate test with sufficient traffic to
  support it.
- A null result (no significant difference) is still a valid, useful finding — it means the
  change wasn't worth its complexity cost.

## Synthesizing Findings

- Group observations into themes across participants — a single participant's opinion is an
  anecdote; the same friction point recurring across 4 of 6 participants is a finding.
- Prioritize findings by severity (blocks task completion vs. minor annoyance) × frequency
  (how many participants hit it), not by how loudly one participant complained.
- Every finding in the report ties to a specific, actionable recommendation — "users were
  confused" is not actionable; "users didn't notice the filter panel because it's below the fold
  on a 1366px viewport" is.

## Common Pitfalls

- **Testing with the wrong participants**: internal employees and existing power users don't represent new/target users.
- **Leading the witness**: explaining what a feature *should* do before asking someone to use it defeats the test's purpose.
- **Confirmation bias in synthesis**: cherry-picking quotes that support the desired outcome instead of reporting the full pattern.
- **Treating research as a one-time gate**: a single round before launch catches less than continuous, smaller rounds throughout a project.
- **Over-indexing on quantitative data alone**: an A/B test tells you *what* won, not *why* — pair it with qualitative research when the result is surprising.

## Rules

1. State the research question before choosing a method — never pick a method first.
2. Recruit participants who match the actual target segment, not whoever is available.
3. Ask about past behavior, never hypothetical future behavior.
4. Never lead or help a participant mid-task during a usability test.
5. Define A/B test metrics and sample size before launch, not after.
6. Every synthesized finding maps to a specific, actionable recommendation.
