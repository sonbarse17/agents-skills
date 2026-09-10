---
name: design-handoff
description: Hand off a design from designer to engineer cleanly — spec
  documentation, asset export, Figma Dev Mode usage, and the review loop for
  catching implementation drift. Use when a design is ready to build, when
  implementation doesn't match the design, or when setting up a recurring
  design-to-dev workflow for a team.
tags:
  - frontend
  - design-handoff
depends_on:
  - frontend-design-review
  - design-systems
---

# Design Handoff

Handoff is the point of highest information loss in the design-to-code pipeline — a design that's
pixel-perfect in Figma but under-specified in handoff reliably drifts in implementation. Good
handoff isn't a bigger document; it's making the source of truth (the design file, backed by
tokens) directly inspectable by engineering instead of relying on a translated spec.

## When to Use This Skill

- A design is ready to move from design tool to implementation
- Implementation doesn't match the design and the team needs to figure out why
- Setting up a recurring design-to-dev workflow (not a one-off handoff)
- Deciding what needs to be specified explicitly vs. what the design system already covers
- Reviewing whether a handed-off design is actually implementation-ready

## What Handoff Requires

| Category | What to provide | Why |
|---|---|---|
| States | Every interactive state (default, hover, focus, active, disabled, loading, error) | Engineers can't invent states not shown — under-specified states get skipped or guessed |
| Responsive behavior | Layout at each breakpoint, not just desktop | A single-breakpoint mock leaves mobile/tablet behavior undefined |
| Content edge cases | Long text, empty state, overflow, truncation rule | The happy-path mock with ideal content doesn't reveal how real content behaves |
| Spacing & sizing | Exact values via Dev Mode / tokens, not "eyeballed" from the canvas | Prevents pixel drift between design and implementation |
| Assets | Exported at the correct format/resolution (SVG for icons, optimized raster for photos) | Engineers shouldn't have to re-export or guess formats |
| Motion | Duration, easing, what triggers it | Animation is invisible in a static mock — see `animation` |
| Copy | Final copy, not lorem ipsum, including error/empty states | Placeholder text shipped to production is a common handoff failure |

A design is not implementation-ready if any of these are still "TBD" — flag gaps explicitly
rather than letting engineering fill them in by assumption.

## Using Figma Dev Mode (or equivalent)

- Dev Mode exposes exact spacing, color tokens, typography, and exportable assets directly from
  the design file — prefer pointing engineers at the live file over a static export or a written
  spec doc that will drift out of sync with the design.
- Annotate token usage explicitly: if a component should use `--color-brand` and not a hardcoded
  hex, that intent needs to be visible in the file (via published styles/variables), not just in
  the designer's head.
1. Confirm the file uses design tokens/variables/shared styles — not raw hex values or ad-hoc
   pixel spacing — so Dev Mode surfaces the token name, not an opaque value.
2. Confirm every component in the handoff maps to an existing component in the codebase's design
   system (see `design-systems`) — if it doesn't exist yet, that's a new component to build, flag
   it as such rather than letting it get implemented as a one-off.
3. Link directly to the specific frame/component, not the whole file — reduces ambiguity about
   scope.

## The Handoff Review Loop

Handoff isn't a one-way document drop — build in a checkpoint after first implementation, before
final QA, to catch drift while it's cheap to fix:

```
Design finalized → Dev Mode inspection during build → First implementation pass
    → Design review against the live build (not just a code review)
    → Fix drift → Ship
```

Use `frontend-design-review`'s process for the review step — compare the actual rendered
implementation against the design file directly, not against a written description of the design.

## Common Sources of Drift

- **Missing states**: hover/focus/disabled states not shown in the mock get implemented ad hoc, inconsistent with the rest of the system.
- **Unspecified responsive behavior**: a mobile layout invented by the engineer because only desktop was designed.
- **Token bypass**: hardcoded values copied from the canvas ("I measured 13px in Figma") instead of referencing the actual design token, which silently diverges when the token later changes.
- **Content that doesn't match reality**: designs built around short, ideal-case copy break when real (longer, translated, or empty) content is dropped in — see `ui-states` and `internationalization`.
- **Asset re-creation**: an engineer re-drawing an icon instead of exporting the source SVG, introducing subtle differences.

## Common Pitfalls

1. **Static export as the only artifact**: a flat PNG/PDF spec that immediately goes stale when the design file is updated.
2. **No states beyond default**: hover/error/loading/disabled left for the engineer to guess.
3. **Desktop-only mocks** handed off for a responsive product.
4. **Lorem ipsum in the final handoff**: placeholder copy that ships because no one replaced it.
5. **No review checkpoint**: the next time design and engineering compare notes is after the feature ships.
6. **Hardcoded values instead of tokens**: designs that don't reference the shared token system, making every handoff a fresh translation exercise.

## Rules

1. Every interactive state is designed and included in the handoff, not left to implementation guesswork.
2. Handoff specifies behavior at every supported breakpoint, not desktop alone.
3. Final copy — including error, empty, and edge-case content — is in the handoff, not lorem ipsum.
4. Designs reference design tokens/shared styles, not hardcoded hex values or ad-hoc pixel measurements.
5. A design review against the live implementation happens before final ship, not only a written-spec comparison.
6. New components not already in the design system are flagged explicitly as new build work, not assumed to already exist.
