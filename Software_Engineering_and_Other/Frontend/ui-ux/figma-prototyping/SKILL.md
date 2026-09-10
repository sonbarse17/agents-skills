---
name: figma-prototyping
description: Build interactive Figma prototypes for testing and stakeholder
  review — connections/flows, component interactions, smart animate, and
  when a prototype is (or isn't) the right fidelity for the question being
  answered. Use when planning a prototype for usability testing or a
  stakeholder walkthrough, not for production design-token workflows.
tags:
  - frontend
  - figma-prototyping
depends_on:
  - ux-research
  - design-handoff
---

# Figma Prototyping

A prototype's only job is to answer a specific question as cheaply as possible — its fidelity
should match that question, not maximize polish. A rough grayscale click-through that tests
whether users understand a flow is more useful than a pixel-perfect prototype that took a week
longer to build and answers the same question.

## When to Use This Skill

- Planning a prototype for a usability test (see `ux-research`)
- Building a stakeholder walkthrough of a proposed flow before committing engineering time
- Deciding what fidelity level a prototype actually needs for the question at hand
- Wiring up Figma connections, component interactions, and Smart Animate transitions
- Handing a validated prototype's flow logic to engineering as a reference (not as the handoff artifact itself — see `design-handoff`)

## Choosing Fidelity

```
What question does the prototype need to answer?
├── "Does this general flow/concept make sense?" → Low-fidelity (grayscale wireframes, static connections)
├── "Can users complete this specific task with this UI?" → Mid-fidelity (real layout, placeholder-ish visuals, working interactions)
├── "Does this feel right — pixel-level polish, motion, micro-interactions?" → High-fidelity (final visuals, Smart Animate, real copy)
└── "Will stakeholders approve this direction?" → Match the fidelity stakeholders expect to evaluate against (usually high for exec review, mid for team review)
```

Low-fidelity prototypes for early usability testing are frequently *better* than high-fidelity —
participants critique visual polish (colors, fonts) instead of the flow logic when a prototype
looks finished, which is the wrong feedback at that stage.

## Building Interactive Flows

- **Connections** wire one frame to another on a trigger (click, drag, hover, key press, or a
  timer/after-delay). Use "While Pressing"/"While Hovering" states sparingly — they're easy to
  build but don't reflect how a real touch or focus-based interaction actually behaves.
- **Component interactions** (interactive components with defined variants for hover/pressed/
  focused/disabled) let one master component drive its own state changes across the prototype
  instead of manually wiring transitions between separate frames per state — build these once in
  the component, reuse everywhere the component appears.
- **Smart Animate** interpolates matching layer names between two frames (position, size, opacity,
  rotation) to fake real motion — name layers consistently across frames or Smart Animate can't
  match them and falls back to a hard cut.
- **Overlays** (modals, dropdowns, tooltips) should be built as overlay connections, not full-frame
  navigations — this preserves the underlying page context and closer matches real overlay
  behavior (dismiss on outside click, positioned relative to a trigger).

```
Frame: Product List --[click "Add to Cart"]--> Overlay: Cart confirmation toast
                     (overlay, not full navigation — background stays visible)

Frame: Settings (tab: General) --[click "Privacy" tab]--> Frame: Settings (tab: Privacy)
                     (Smart Animate — layers named identically, tab indicator slides)
```

## Prototyping for Usability Testing

- Build only the flow paths the test script actually exercises — a prototype doesn't need every
  edge case wired, only the specific task paths participants will attempt.
- Include realistic error/dead-end states if the test needs to observe recovery behavior; an
  unwired button that does nothing when a participant expects an error message produces
  confusing, unusable test data.
- Test the prototype yourself end-to-end before a session — a broken connection discovered
  mid-session wastes the participant's time and contaminates that session's data.
- For remote unmoderated tests, verify the prototype works in Figma's presentation mode on the
  actual device class participants will use (mobile viewport testing especially).

## Prototyping vs. Design Handoff

A prototype validates a flow's logic and feel; it is not the source of truth for implementation
detail (exact spacing, token names, responsive breakpoints) — that's `design-handoff`'s job via
Dev Mode against the underlying design file. Don't ask engineering to "build from the prototype"
directly; hand off the underlying, token-based design file, with the prototype as supporting
context for how the flow should feel.

## Common Pitfalls

1. **Over-building fidelity for an early-stage question**: polishing visuals when the open question is whether the flow's logic makes sense at all.
2. **Untested prototype links**: a broken connection discovered live during a usability session.
3. **Full-frame overlays**: navigating to a new frame for what should be a modal, losing the surrounding page context.
4. **Inconsistent layer naming**: breaking Smart Animate transitions between frames that should interpolate smoothly.
5. **Treating the prototype as the handoff spec**: engineering building pixel measurements off the prototype instead of the token-backed design file.
6. **Wiring every edge case for an early concept test**: over-investing in interaction coverage before validating the core flow is even right.

## Rules

1. Match prototype fidelity to the specific question being tested — don't default to maximum polish.
2. Test every prototype connection end-to-end before a usability session or stakeholder review.
3. Use overlay connections for modals/dropdowns/tooltips, not full-frame navigation.
4. Keep layer names consistent across frames connected by Smart Animate.
5. Hand off the token-based design file for implementation — the prototype is context, not the spec.
