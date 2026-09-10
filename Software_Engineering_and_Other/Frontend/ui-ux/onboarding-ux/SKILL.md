---
name: onboarding-ux
description: Design first-run experiences, product tours, empty-state
  onboarding, and progressive disclosure of features. Use when designing
  what a new user sees on first login, deciding between a tour/checklist/
  empty-state approach, or reducing time-to-first-value.
tags:
  - frontend
  - onboarding-ux
depends_on:
  - interaction-patterns
  - ui-states
---

# Onboarding UX

Onboarding's job is to get a new user to their first real moment of value as fast as possible —
not to explain every feature. An onboarding flow that's thorough but delays value is worse than a
minimal one that gets the user to a working result in two minutes.

## When to Use This Skill

- Designing what a new user sees on first login or first app open
- Choosing between a product tour, a setup checklist, contextual tooltips, or empty-state guidance
- Reducing time-to-first-value (TTFV) for a complex product
- Designing progressive disclosure so advanced features don't overwhelm new users
- Deciding what to ask for during signup vs. defer until later

## Onboarding Approaches

| Approach | Best for | Risk |
|---|---|---|
| Guided product tour (spotlight/coach marks) | Complex tools with non-obvious core actions | Users skip it, or it blocks interaction with the real UI |
| Setup checklist | Products needing configuration before value (integrations, invite team) | Feels like a chore if steps aren't tied to visible value |
| Empty-state guidance | Any screen a new user reaches with nothing in it yet | Easy to under-invest — see `ui-states` |
| Contextual tooltips (just-in-time) | Features relevant only in specific moments, not day one | Overuse creates tooltip fatigue; reserve for genuinely non-obvious things |
| Sample/demo data | Products that are meaningless empty (dashboards, analytics tools) | Must be unmistakably marked as sample data, never confused with real data |
| Interactive "do it for real" tutorial | Products where the fastest path to value *is* doing the real task once | Requires the tutorial task to be genuinely representative, not a toy example |

Prefer **guidance embedded in empty states and just-in-time tooltips** over an upfront guided
tour for most products — a tour front-loads information before the user has context to retain it;
contextual guidance appears exactly when it's relevant and is more likely to be read.

## Time to First Value

Map the shortest real path from signup to the user's first "aha" moment, and design onboarding to
remove every unnecessary step on that specific path — not to explain the whole product.

```
Signup → [minimize] → First value moment → [then] → Feature depth, settings, edge cases
```

- Defer account setup steps that aren't required for the first value moment (profile photo, full
  billing details, team invites) to *after* the user has seen value, not before.
- If signup requires information the user doesn't have handy (company size, integration API
  keys), let them skip it with a clear "finish later" path rather than blocking progress.
- Pre-fill or auto-detect what can be inferred (timezone, locale, browser-detected settings)
  instead of asking.

## Progressive Disclosure

- Show the minimum viable interface on first use; reveal advanced options, settings, and power-user
  features as the user demonstrates need for them (or explicitly opts into "advanced mode").
- A settings panel with 40 options overwhelms a first-time user and is invisible clutter to
  someone who never needs them — group advanced options behind an "Advanced" disclosure rather
  than flattening everything into one view.
- Feature discovery for capabilities not needed on day one belongs in contextual moments (an
  empty state, a relevant hover, a "did you know" surfaced after relevant usage) — not crammed
  into the first-run tour.

## Setup Checklists

```tsx
interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
  ctaHref: string;
}

// Each step should be independently completable and tied to a concrete
// outcome the user can see, not an abstract "configure X."
const steps: OnboardingStep[] = [
  { id: 'invite', label: 'Invite your team', done: false, ctaHref: '/team/invite' },
  { id: 'connect', label: 'Connect your data source', done: true, ctaHref: '/integrations' },
  { id: 'first-report', label: 'Create your first report', done: false, ctaHref: '/reports/new' },
];
```

- Order steps by dependency and by fastest-path-to-value, not alphabetically or by internal
  priority.
- Show progress (2 of 4 complete) — visible progress is a strong completion motivator.
- Let users dismiss or collapse the checklist; don't make it a permanent, unremovable fixture
  once onboarding is functionally complete.
- Never gate the rest of the product behind checklist completion unless a step is a genuine
  hard prerequisite (e.g., connecting a data source before a dashboard can render anything).

## Product Tours

- Keep to 3-5 steps maximum — anything longer has a steep drop-off and low retention of the
  later steps.
- Point at real, interactive UI, not a static screenshot — the user should be able to try the
  highlighted action immediately.
- Always provide a visible, easy skip/exit — a tour that can't be dismissed is an obstacle, not
  a help.
- Never trigger a tour automatically for a returning user who has already completed it; gate on
  a persisted "has seen onboarding" flag.

## Common Pitfalls

1. **Front-loading everything**: a 12-step tour explaining every feature before the user has done anything real.
2. **Blocking value behind setup**: requiring full profile/team/billing configuration before showing any value.
3. **Untagged sample data**: demo content that looks identical to real data, confusing users about what's actually theirs.
4. **Un-skippable tours**: no visible way to exit or dismiss guided onboarding.
5. **Checklist that never goes away**: a completed or ignored checklist that stays pinned indefinitely, becoming permanent clutter.
6. **Re-triggering onboarding**: showing the first-run tour again to a user who already completed it.

## Rules

1. Identify the single fastest path to first value and design onboarding around removing friction from exactly that path.
2. Defer any signup/setup step not required for first value to after that value is delivered.
3. Every guided tour is skippable and capped at 3-5 steps.
4. Sample/demo data is unmistakably labeled as such.
5. Onboarding surfaces (tours, checklists) never reappear for a user who has already completed or dismissed them.
6. Progressive disclosure hides advanced options by default rather than flattening everything into the first-run view.
